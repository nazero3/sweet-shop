import React from "react";
import ReactDOM from "react-dom/client";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);
type AdminOrder = {
  id: string;
  orderNumber: string;
  storeState: string;
  status: string;
  customerName: string;
  subtotal: string;
};
type NotificationPrefs = { push: boolean; email: boolean };
type Store = { id: string; name: string; state: string; isActive: boolean };
type Category = { id: string; slug: string; name: { ar: string; en: string }; isActive: boolean };
type Product = { id: string; slug: string; name: { ar: string; en: string }; isAvailable: boolean };
type NotificationHistory = {
  id: string;
  channel: string;
  success: boolean;
  retryCount: number;
  failureReason?: string;
  sentAt: string;
};

function App(): React.ReactElement {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [token, setToken] = React.useState("");
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [stores, setStores] = React.useState<Store[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [notifications, setNotifications] = React.useState<NotificationHistory[]>([]);
  const [prefs, setPrefs] = React.useState<NotificationPrefs>({ push: true, email: true });
  const [storeName, setStoreName] = React.useState("");
  const [storeState, setStoreState] = React.useState("");
  const [categoryNameEn, setCategoryNameEn] = React.useState("");
  const [categoryNameAr, setCategoryNameAr] = React.useState("");
  const [categorySlug, setCategorySlug] = React.useState("");
  const [productNameEn, setProductNameEn] = React.useState("");
  const [productNameAr, setProductNameAr] = React.useState("");
  const [productSlug, setProductSlug] = React.useState("");
  const [productPrice, setProductPrice] = React.useState("0");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("");
  const [error, setError] = React.useState("");

  const loadOrders = React.useCallback(async (accessToken: string): Promise<void> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) {
      setError("تعذر تحميل الطلبات");
      return;
    }
    const data = (await response.json()) as AdminOrder[];
    setOrders(data);
  }, []);

  const loadPreferences = React.useCallback(async (accessToken: string): Promise<void> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings/notifications`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) return;
    const data = (await response.json()) as NotificationPrefs;
    setPrefs(data);
  }, []);

  const loadCatalog = React.useCallback(async (accessToken: string): Promise<void> => {
    const [storesRes, categoriesRes, productsRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/admin/stores`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      fetch(`${import.meta.env.VITE_API_URL}/admin/categories`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      fetch(`${import.meta.env.VITE_API_URL}/admin/products`, { headers: { Authorization: `Bearer ${accessToken}` } })
    ]);
    if (storesRes.ok) setStores((await storesRes.json()) as Store[]);
    if (categoriesRes.ok) setCategories((await categoriesRes.json()) as Category[]);
    if (productsRes.ok) setProducts((await productsRes.json()) as Product[]);
  }, []);

  const loadNotifications = React.useCallback(async (accessToken: string): Promise<void> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/notifications`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) return;
    setNotifications((await response.json()) as NotificationHistory[]);
  }, []);

  React.useEffect(() => {
    socket.on("admin:order-updated", () => {
      if (token) void loadOrders(token);
    });
    return () => {
      socket.off("admin:order-updated");
    };
  }, [token, loadOrders]);

  async function login(): Promise<void> {
    setError("");
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = (await response.json()) as { accessToken?: string };
    if (!response.ok || !data.accessToken) {
      setError("بيانات الدخول غير صحيحة");
      return;
    }
    setToken(data.accessToken);
    void loadOrders(data.accessToken);
    void loadPreferences(data.accessToken);
    void loadCatalog(data.accessToken);
    void loadNotifications(data.accessToken);
  }

  async function savePreferences(next: NotificationPrefs): Promise<void> {
    if (!token) return;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(next)
    });
    if (!response.ok) {
      setError("تعذر حفظ إعدادات الإشعارات");
      return;
    }
    setPrefs(next);
  }

  async function updateStatus(orderId: string, status: string): Promise<void> {
    if (!token) return;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      setError("فشل تحديث حالة الطلب");
      return;
    }
    void loadOrders(token);
  }

  async function createStore(): Promise<void> {
    if (!token) return;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/stores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: storeName,
        state: storeState,
        address: `${storeName} Address`,
        phone: "+1000000000",
        operatingHours: { monday: "09:00-21:00" },
        deliveryZones: []
      })
    });
    if (!response.ok) return setError("تعذر إضافة فرع");
    setStoreName("");
    setStoreState("");
    void loadCatalog(token);
  }

  async function createCategory(): Promise<void> {
    if (!token) return;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        slug: categorySlug,
        name: { en: categoryNameEn, ar: categoryNameAr },
        sortOrder: categories.length + 1
      })
    });
    if (!response.ok) return setError("تعذر إضافة تصنيف");
    setCategoryNameEn("");
    setCategoryNameAr("");
    setCategorySlug("");
    void loadCatalog(token);
  }

  async function createProduct(): Promise<void> {
    if (!token || !selectedCategoryId) return;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        slug: productSlug,
        categoryId: selectedCategoryId,
        price: Number(productPrice),
        imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b",
        name: { en: productNameEn, ar: productNameAr },
        description: { en: `${productNameEn} description`, ar: `وصف ${productNameAr}` }
      })
    });
    if (!response.ok) return setError("تعذر إضافة منتج");
    setProductNameEn("");
    setProductNameAr("");
    setProductSlug("");
    setProductPrice("0");
    void loadCatalog(token);
  }

  return (
    <main style={{ minWidth: 1024, padding: 24 }}>
      <h1>لوحة تحكم Sweet Shop</h1>
      {!token ? (
        <>
          <p>تسجيل دخول المالك</p>
          <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <br />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={() => void login()}>دخول</button>
          {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
        </>
      ) : (
        <>
          <p>تتبع الطلبات وتحديث حالتها بشكل فوري.</p>
          <button onClick={() => void loadOrders(token)}>تحديث القائمة</button>
          <h3>إعدادات الإشعارات</h3>
          <label>
            <input
              type="checkbox"
              checked={prefs.push}
              onChange={(e) => void savePreferences({ ...prefs, push: e.target.checked })}
            />
            Push
          </label>
          <label>
            <input
              type="checkbox"
              checked={prefs.email}
              onChange={(e) => void savePreferences({ ...prefs, email: e.target.checked })}
            />
            Email
          </label>
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                {order.orderNumber} | {order.storeState} | {order.customerName} | {order.status} | $
                {order.subtotal}
                {" | "}
                <button onClick={() => void updateStatus(order.id, "PREPARING")}>Preparing</button>
                <button onClick={() => void updateStatus(order.id, "OUT_FOR_DELIVERY")}>Out</button>
                <button onClick={() => void updateStatus(order.id, "READY_FOR_PICKUP")}>Ready</button>
                <button onClick={() => void updateStatus(order.id, "DELIVERED")}>Delivered</button>
                <button onClick={() => void updateStatus(order.id, "COLLECTED")}>Collected</button>
              </li>
            ))}
          </ul>
          <hr />
          <h3>إدارة الفروع</h3>
          <input placeholder="Store name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          <input placeholder="State" value={storeState} onChange={(e) => setStoreState(e.target.value)} />
          <button onClick={() => void createStore()}>إضافة فرع</button>
          <ul>
            {stores.map((store) => (
              <li key={store.id}>
                {store.name} | {store.state} | {store.isActive ? "Active" : "Inactive"}
              </li>
            ))}
          </ul>
          <hr />
          <h3>إدارة التصنيفات</h3>
          <input
            placeholder="Category EN"
            value={categoryNameEn}
            onChange={(e) => setCategoryNameEn(e.target.value)}
          />
          <input
            placeholder="Category AR"
            value={categoryNameAr}
            onChange={(e) => setCategoryNameAr(e.target.value)}
          />
          <input placeholder="Slug" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} />
          <button onClick={() => void createCategory()}>إضافة تصنيف</button>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                {category.name.ar} | {category.slug} | {category.isActive ? "Active" : "Inactive"}
              </li>
            ))}
          </ul>
          <hr />
          <h3>إدارة المنتجات</h3>
          <input
            placeholder="Product EN"
            value={productNameEn}
            onChange={(e) => setProductNameEn(e.target.value)}
          />
          <input
            placeholder="Product AR"
            value={productNameAr}
            onChange={(e) => setProductNameAr(e.target.value)}
          />
          <input placeholder="Slug" value={productSlug} onChange={(e) => setProductSlug(e.target.value)} />
          <input
            placeholder="Price"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            type="number"
          />
          <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name.ar}
              </option>
            ))}
          </select>
          <button onClick={() => void createProduct()}>إضافة منتج</button>
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                {product.name.ar} | {product.slug} | {product.isAvailable ? "Available" : "Unavailable"}
              </li>
            ))}
          </ul>
          <hr />
          <h3>سجل الإشعارات</h3>
          <button onClick={() => void loadNotifications(token)}>تحديث سجل الإشعارات</button>
          <ul>
            {notifications.map((item) => (
              <li key={item.id}>
                {item.channel} | {item.success ? "Success" : "Failed"} | retries: {item.retryCount}
                {item.failureReason ? ` | ${item.failureReason}` : ""}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
