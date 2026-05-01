import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient, OrderStatus, OrderType } from "@prisma/client";
import { Server } from "socket.io";
import { createClient } from "redis";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { NotificationService } from "./services/notification/notification-service";
import type { NotificationChannel } from "./services/notification/types";

const prisma = new PrismaClient();
const ORDER_ID_PREFIX = "SS";
const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (error) => {
  // eslint-disable-next-line no-console
  console.error("Redis error", error);
});
void redis.connect().catch(() => undefined);
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

type JwtPayload = { adminId: string; role: "OWNER" };
type NotificationPreferences = Record<NotificationChannel, boolean>;
type NotificationJob = { orderId: string; channel: NotificationChannel; attempt: number };
const notificationService = new NotificationService();
const SYRIAN_STATES = new Set(["دمشق", "حلب", "حمص", "damascus", "aleppo", "homs"]);
const FALLBACK_SYRIAN_STORES = [
  {
    id: "fallback-damascus",
    name: "Sweet Shop Damascus",
    state: "دمشق",
    address: "شارع بغداد، دمشق، سوريا",
    phone: "+963-11-222-3344",
    email: "damascus@sweetshop.com",
    operatingHours: { everyday: "09:00-22:00" },
    deliveryZones: ["المالكي", "أبو رمانة", "المزة"],
    isActive: true
  },
  {
    id: "fallback-aleppo",
    name: "Sweet Shop Aleppo",
    state: "حلب",
    address: "السبع بحرات، حلب، سوريا",
    phone: "+963-21-555-2211",
    email: "aleppo@sweetshop.com",
    operatingHours: { everyday: "09:00-22:00" },
    deliveryZones: ["السليمانية", "الجميلية", "الميدان"],
    isActive: true
  },
  {
    id: "fallback-homs",
    name: "Sweet Shop Homs",
    state: "حمص",
    address: "شارع الحضارة، حمص، سوريا",
    phone: "+963-31-444-1100",
    email: "homs@sweetshop.com",
    operatingHours: { everyday: "09:00-22:00" },
    deliveryZones: ["عكرمة", "الوعر", "بابا عمرو"],
    isActive: true
  }
] as const;

const orderPayloadSchema = z.object({
  storeId: z.string(),
  storeState: z.string(),
  type: z.nativeEnum(OrderType),
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(5),
    email: z.string().email().optional().or(z.literal(""))
  }),
  deliveryAddress: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      lineTotal: z.number().positive()
    })
  ),
  specialNote: z.string().optional(),
  subtotal: z.number().positive()
});

function nextOrderNumber(state: string, sequence: number): string {
  const normalizedState = state.toUpperCase().slice(0, 2);
  return `${ORDER_ID_PREFIX}-${normalizedState}-${sequence.toString().padStart(5, "0")}`;
}

async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function setCache<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
    // no-op fallback
  }
}

async function invalidateCache(keys: string[]): Promise<void> {
  try {
    if (keys.length === 0) return;
    await redis.del(...keys);
  } catch {
    // no-op fallback
  }
}

function isValidStatusTransition(type: OrderType, from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  const flow =
    type === OrderType.DELIVERY
      ? [
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING,
          OrderStatus.OUT_FOR_DELIVERY,
          OrderStatus.DELIVERED
        ]
      : [
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING,
          OrderStatus.READY_FOR_PICKUP,
          OrderStatus.COLLECTED
        ];
  const currentIndex = flow.indexOf(from);
  const nextIndex = flow.indexOf(to);
  return currentIndex >= 0 && nextIndex === currentIndex + 1;
}

async function enqueueNotificationJobs(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { store: true } });
  if (!order) return;
  const owner = await prisma.admin.findFirst({ where: { role: "OWNER" } });
  const preferences = (owner?.notificationPreferences as NotificationPreferences | null) ?? {
    push: true,
    email: true
  };
  const channels: NotificationChannel[] = ["push", "email"];
  for (const channel of channels) {
    if (!preferences[channel]) {
      await prisma.notificationHistory.create({
        data: {
          orderId: order.id,
          channel,
          recipient: "owner",
          payload: {
            orderNumber: order.orderNumber,
            storeState: order.storeState,
            orderType: order.type,
            customerName: order.customerName,
            items: order.items,
            total: order.subtotal
          },
          retryCount: 0,
          success: false,
          failureReason: "Skipped by owner preference"
        }
      });
      continue;
    }
    const job: NotificationJob = { orderId: order.id, channel, attempt: 1 };
    await redis.rPush("notifications:queue", JSON.stringify(job));
  }
}

async function processNotificationQueue(): Promise<void> {
  const jobRaw = await redis.lPop("notifications:queue");
  if (!jobRaw) return;
  const job = JSON.parse(jobRaw) as NotificationJob;
  const order = await prisma.order.findUnique({ where: { id: job.orderId } });
  if (!order) return;

  try {
    await notificationService.send(job.channel, {
      orderNumber: order.orderNumber,
      storeState: order.storeState,
      orderType: order.type,
      customerName: order.customerName,
      items: order.items,
      total: order.subtotal
    });
    await prisma.notificationHistory.create({
      data: {
        orderId: order.id,
        channel: job.channel,
        recipient: "owner",
        payload: {
          orderNumber: order.orderNumber,
          storeState: order.storeState,
          orderType: order.type,
          customerName: order.customerName,
          items: order.items,
          total: order.subtotal
        },
        retryCount: job.attempt,
        success: true
      }
    });

    const current = (order.notificationsSent as NotificationPreferences | null) ?? {
      push: false,
      email: false
    };
    current[job.channel] = true;
    await prisma.order.update({ where: { id: order.id }, data: { notificationsSent: current } });
  } catch (error) {
    const failureReason = error instanceof Error ? error.message : "Unknown notification error";
    if (job.attempt < 3) {
      const retryJob: NotificationJob = { ...job, attempt: job.attempt + 1 };
      await redis.rPush("notifications:queue", JSON.stringify(retryJob));
    } else {
      await prisma.notificationHistory.create({
        data: {
          orderId: order.id,
          channel: job.channel,
          recipient: "owner",
          payload: {
            orderNumber: order.orderNumber,
            storeState: order.storeState,
            orderType: order.type,
            customerName: order.customerName,
            items: order.items,
            total: order.subtotal
          },
          retryCount: job.attempt,
          success: false,
          failureReason
        }
      });
    }
  }
}

function signAdminToken(adminId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ adminId, role: "OWNER" } satisfies JwtPayload, secret, { expiresIn: "1d" });
}

function authenticateAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }

  try {
    const token = auth.replace("Bearer ", "");
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT secret is missing");
    const payload = jwt.verify(token, secret) as JwtPayload;
    if (payload.role !== "OWNER") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.locals.adminId = payload.adminId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/auth/admin/login", async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const isValid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  return res.json({
    accessToken: signAdminToken(admin.id),
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
  });
});

app.get("/stores", async (_req, res) => {
  const cached = await getCache<Awaited<ReturnType<typeof prisma.store.findMany>>>("stores:active");
  if (cached) {
    const filteredCached = cached.filter((store) => SYRIAN_STATES.has(String(store.state).toLowerCase()));
    if (filteredCached.length > 0) return res.json(filteredCached);
  }
  const stores = await prisma.store.findMany({ where: { isActive: true }, orderBy: { state: "asc" } });
  const filteredStores = stores.filter((store) => SYRIAN_STATES.has(String(store.state).toLowerCase()));
  const responseStores = filteredStores.length > 0 ? filteredStores : FALLBACK_SYRIAN_STORES;
  await setCache("stores:active", responseStores, 120);
  res.json(responseStores);
});

app.get("/menu", async (_req, res) => {
  const cached = await getCache<Awaited<ReturnType<typeof prisma.category.findMany>>>("menu:active");
  if (cached) return res.json(cached);
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { sortOrder: "asc" }
  });
  await setCache("menu:active", categories, 120);
  res.json(categories);
});

app.post("/orders", async (req, res) => {
  const parsed = orderPayloadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const latestOrder = await prisma.order.findFirst({ orderBy: { createdAt: "desc" } });
  const nextSequence = latestOrder ? Number(latestOrder.orderNumber.split("-").at(-1) ?? "0") + 1 : 1;
  const orderNumber = nextOrderNumber(parsed.data.storeState, nextSequence);

  const order = await prisma.order.create({
    data: {
      orderNumber,
      storeId: parsed.data.storeId,
      storeState: parsed.data.storeState,
      type: parsed.data.type,
      status: OrderStatus.CONFIRMED,
      customerName: parsed.data.customer.name,
      customerPhone: parsed.data.customer.phone,
      customerEmail: parsed.data.customer.email || null,
      deliveryAddress: parsed.data.deliveryAddress,
      items: parsed.data.items,
      specialNote: parsed.data.specialNote,
      subtotal: parsed.data.subtotal,
      notificationsSent: { push: false, email: false }
    }
  });

  io.to(order.orderNumber).emit("order:status", { orderNumber: order.orderNumber, status: order.status });
  void enqueueNotificationJobs(order.id);
  return res.status(201).json({ orderId: order.id, orderNumber: order.orderNumber, status: order.status });
});

app.get("/orders/track/:orderNumber", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber: req.params.orderNumber },
    include: { store: true }
  });
  if (!order) return res.status(404).json({ error: "Order not found" });
  return res.json(order);
});

app.get("/admin/orders", authenticateAdmin, async (req, res) => {
  const querySchema = z.object({
    storeState: z.string().optional(),
    type: z.nativeEnum(OrderType).optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    from: z.string().optional(),
    to: z.string().optional()
  });
  const query = querySchema.parse(req.query);

  const where = {
    ...(query.storeState ? { storeState: query.storeState } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {})
          }
        }
      : {})
  };

  const orders = await prisma.order.findMany({
    where,
    include: { store: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return res.json(orders);
});

app.get("/admin/notifications", authenticateAdmin, async (req, res) => {
  const query = z
    .object({
      orderId: z.string().optional(),
      channel: z.enum(["push", "email"]).optional(),
      success: z.enum(["true", "false"]).optional()
    })
    .parse(req.query);

  const notifications = await prisma.notificationHistory.findMany({
    where: {
      ...(query.orderId ? { orderId: query.orderId } : {}),
      ...(query.channel ? { channel: query.channel } : {}),
      ...(query.success ? { success: query.success === "true" } : {})
    },
    orderBy: { sentAt: "desc" },
    take: 200
  });
  return res.json(notifications);
});

app.get("/admin/settings/notifications", authenticateAdmin, async (req, res) => {
  const adminId = res.locals.adminId as string;
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) return res.status(404).json({ error: "Admin not found" });
  return res.json(admin.notificationPreferences);
});

app.patch("/admin/settings/notifications", authenticateAdmin, async (req, res) => {
  const adminId = res.locals.adminId as string;
  const schema = z.object({
    push: z.boolean(),
    email: z.boolean()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data: { notificationPreferences: parsed.data }
  });
  return res.json(updated.notificationPreferences);
});

app.patch("/admin/orders/:orderId/status", authenticateAdmin, async (req, res) => {
  const bodySchema = z.object({ status: z.nativeEnum(OrderStatus) });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.order.findUnique({ where: { id: req.params.orderId } });
  if (!existing) return res.status(404).json({ error: "Order not found" });

  if (!isValidStatusTransition(existing.type, existing.status, parsed.data.status)) {
    return res.status(400).json({
      error: `Invalid transition for ${existing.type}: ${existing.status} -> ${parsed.data.status}`
    });
  }

  const updated = await prisma.order.update({ where: { id: req.params.orderId }, data: { status: parsed.data.status } });

  io.to(updated.orderNumber).emit("order:status", { orderNumber: updated.orderNumber, status: updated.status });
  io.emit("admin:order-updated", updated);
  return res.json(updated);
});

app.post("/admin/stores", authenticateAdmin, async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    state: z.string().min(2),
    address: z.string().min(5),
    phone: z.string().min(5),
    email: z.string().email().optional(),
    operatingHours: z.record(z.string(), z.string()),
    deliveryZones: z.array(z.string()).default([]),
    isActive: z.boolean().default(true)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const store = await prisma.store.create({ data: parsed.data });
  await invalidateCache(["stores:active"]);
  return res.status(201).json(store);
});

app.patch("/admin/stores/:storeId", authenticateAdmin, async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    state: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    phone: z.string().min(5).optional(),
    email: z.string().email().nullable().optional(),
    operatingHours: z.record(z.string(), z.string()).optional(),
    deliveryZones: z.array(z.string()).optional(),
    isActive: z.boolean().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const store = await prisma.store.update({ where: { id: req.params.storeId }, data: parsed.data });
  await invalidateCache(["stores:active"]);
  return res.json(store);
});

app.get("/admin/stores", authenticateAdmin, async (_req, res) => {
  const stores = await prisma.store.findMany({ orderBy: [{ state: "asc" }, { createdAt: "desc" }] });
  return res.json(stores);
});

app.post("/admin/categories", authenticateAdmin, async (req, res) => {
  const schema = z.object({
    name: z.object({ en: z.string().min(1), ar: z.string().min(1) }),
    slug: z.string().min(2),
    imageUrl: z.string().url().optional(),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const category = await prisma.category.create({ data: parsed.data });
  await invalidateCache(["menu:active"]);
  return res.status(201).json(category);
});

app.patch("/admin/categories/:categoryId", authenticateAdmin, async (req, res) => {
  const schema = z.object({
    name: z.object({ en: z.string().min(1), ar: z.string().min(1) }).optional(),
    slug: z.string().min(2).optional(),
    imageUrl: z.string().url().nullable().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const category = await prisma.category.update({
    where: { id: req.params.categoryId },
    data: parsed.data
  });
  await invalidateCache(["menu:active"]);
  return res.json(category);
});

app.delete("/admin/categories/:categoryId", authenticateAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.categoryId } });
  await invalidateCache(["menu:active"]);
  return res.status(204).send();
});

app.get("/admin/categories", authenticateAdmin, async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return res.json(categories);
});

app.post("/admin/products", authenticateAdmin, async (req, res) => {
  const schema = z.object({
    name: z.object({ en: z.string().min(1), ar: z.string().min(1) }),
    description: z.object({ en: z.string().min(1), ar: z.string().min(1) }),
    price: z.number().positive(),
    categoryId: z.string(),
    imageUrl: z.string().url(),
    isAvailable: z.boolean().default(true),
    slug: z.string().min(2)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const product = await prisma.product.create({ data: parsed.data });
  await invalidateCache(["menu:active"]);
  return res.status(201).json(product);
});

app.patch("/admin/products/:productId", authenticateAdmin, async (req, res) => {
  const schema = z.object({
    name: z.object({ en: z.string().min(1), ar: z.string().min(1) }).optional(),
    description: z.object({ en: z.string().min(1), ar: z.string().min(1) }).optional(),
    price: z.number().positive().optional(),
    categoryId: z.string().optional(),
    imageUrl: z.string().url().optional(),
    isAvailable: z.boolean().optional(),
    slug: z.string().min(2).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const product = await prisma.product.update({
    where: { id: req.params.productId },
    data: parsed.data
  });
  await invalidateCache(["menu:active"]);
  return res.json(product);
});

app.delete("/admin/products/:productId", authenticateAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.productId } });
  await invalidateCache(["menu:active"]);
  return res.status(204).send();
});

app.get("/admin/products", authenticateAdmin, async (_req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
  return res.json(products);
});

app.get("/admin/analytics/overview", authenticateAdmin, async (_req, res) => {
  const [ordersByStore, popularProducts, totalRevenue] = await Promise.all([
    prisma.order.groupBy({ by: ["storeState"], _count: { _all: true }, _sum: { subtotal: true } }),
    prisma.order.findMany({ select: { items: true }, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.order.aggregate({ _sum: { subtotal: true } })
  ]);

  const productCounter = new Map<string, number>();
  for (const order of popularProducts) {
    const items = (order.items as Array<{ productName: string; quantity: number }>) ?? [];
    for (const item of items) {
      productCounter.set(item.productName, (productCounter.get(item.productName) ?? 0) + item.quantity);
    }
  }

  const topProducts = [...productCounter.entries()]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return res.json({
    totalRevenue: totalRevenue._sum.subtotal ?? 0,
    ordersByStore,
    topProducts
  });
});

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Sweet Shop API",
    version: "1.0.0"
  },
  servers: [{ url: `http://localhost:${process.env.API_PORT ?? 4000}` }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer"
      }
    }
  },
  paths: {
    "/health": { get: { summary: "Health check", responses: { "200": { description: "OK" } } } },
    "/stores": { get: { summary: "List active stores", responses: { "200": { description: "Stores list" } } } },
    "/menu": { get: { summary: "List active categories/products", responses: { "200": { description: "Menu list" } } } },
    "/auth/admin/login": {
      post: { summary: "Owner login", responses: { "200": { description: "JWT token issued" } } }
    },
    "/orders": { post: { summary: "Create guest order", responses: { "201": { description: "Order created" } } } },
    "/orders/track/{orderNumber}": {
      get: {
        summary: "Track order by order number",
        parameters: [{ name: "orderNumber", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Order details" }, "404": { description: "Not found" } }
      }
    },
    "/admin/orders": {
      get: {
        summary: "Owner order feed",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Orders list" }, "401": { description: "Unauthorized" } }
      }
    },
    "/admin/orders/{orderId}/status": {
      patch: {
        summary: "Update order status",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Updated order" }, "401": { description: "Unauthorized" } }
      }
    },
    "/admin/analytics/overview": {
      get: {
        summary: "Owner analytics overview",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Analytics payload" } }
      }
    },
    "/admin/settings/notifications": {
      get: {
        summary: "Get owner notification preferences",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Preferences payload" } }
      },
      patch: {
        summary: "Update owner notification preferences",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Updated preferences payload" } }
      }
    },
    "/admin/notifications": {
      get: {
        summary: "List notification history",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Notification history list" } }
      }
    },
    "/admin/stores": {
      get: {
        summary: "List all stores",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Stores list" } }
      },
      post: {
        summary: "Create store",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Store created" } }
      }
    },
    "/admin/stores/{storeId}": {
      patch: {
        summary: "Update store",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "storeId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Store updated" } }
      }
    },
    "/admin/categories": {
      get: {
        summary: "List categories",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Categories list" } }
      },
      post: {
        summary: "Create category",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Category created" } }
      }
    },
    "/admin/categories/{categoryId}": {
      patch: {
        summary: "Update category",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "categoryId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Category updated" } }
      },
      delete: {
        summary: "Delete category",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "categoryId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Category deleted" } }
      }
    },
    "/admin/products": {
      get: {
        summary: "List products",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Products list" } }
      },
      post: {
        summary: "Create product",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Product created" } }
      }
    },
    "/admin/products/{productId}": {
      patch: {
        summary: "Update product",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Product updated" } }
      },
      delete: {
        summary: "Delete product",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Product deleted" } }
      }
    }
  }
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

io.on("connection", (socket) => {
  socket.on("join:order", (orderNumber: string) => socket.join(orderNumber));
});

const PORT = Number(process.env.API_PORT ?? 4000);
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on :${PORT}`);
});

setInterval(() => {
  void processNotificationQueue();
}, 2000);
