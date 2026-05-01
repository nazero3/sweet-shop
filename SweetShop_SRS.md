# Software Requirements Specification (SRS)
## Sweet Shop — Multi-State Online Ordering Platform

**Document Version:** 1.0  
**Date:** May 1, 2026  
**Status:** Draft — Pending Review  
**Prepared By:** Senior Software Engineering Team  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [User Classes & Characteristics](#3-user-classes--characteristics)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [SEO Requirements (Google Search #1 Ranking)](#6-seo-requirements)
7. [System Architecture Overview](#7-system-architecture-overview)
8. [Data Models](#8-data-models)
9. [External Interface Requirements](#9-external-interface-requirements)
10. [Constraints & Assumptions](#10-constraints--assumptions)
11. [Cursor AI Prompt](#11-cursor-ai-prompt)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for the **Sweet Shop** multi-state online ordering platform. It is intended to serve as the single source of truth for all design, development, and testing activities. This document is written specifically to be used with Cursor AI as a design and implementation blueprint.

### 1.2 Scope

The system is a full-stack, multi-platform (web + mobile) ordering application for a sweet shop business operating across multiple U.S. states. Each state operates as an independent store location under **one centralized owner**. Customers can browse a shared menu, place orders online for delivery or in-store pickup, and track order status in real time. The owner receives consolidated notifications (Push, SMS, Email) for every order, tagged by state/store, and manages everything from a single admin dashboard.

### 1.3 Definitions, Acronyms & Abbreviations

| Term | Definition |
|------|------------|
| SRS | Software Requirements Specification |
| Owner | The single administrator who owns and controls all store locations |
| Store / Location | A physical sweet shop branch in a specific U.S. state |
| Customer | Any end-user who browses the menu and places an order (guest or registered) |
| Guest Checkout | Ordering without creating an account |
| COD | Cash on Delivery / Cash at Pickup |
| PWA | Progressive Web App |
| i18n | Internationalization (multi-language support) |
| FCM | Firebase Cloud Messaging (push notifications) |
| SEO | Search Engine Optimization |
| CMS | Content Management System |
| API | Application Programming Interface |
| JWT | JSON Web Token |

### 1.4 Document Overview

This SRS is organized into functional sections covering: system overview, user roles, functional requirements by module, non-functional requirements, SEO strategy, system architecture, data models, and a final ready-to-use Cursor AI prompt.

---

## 2. Overall Description

### 2.1 Product Perspective

The Sweet Shop Platform is a new, standalone system consisting of:

- A **Customer Web App** (browser-based, SEO-optimized)
- A **Customer Mobile App** (iOS + Android)
- An **Owner Admin Dashboard** (web-based)
- An **Owner Mobile App** (for real-time order notifications on the go)
- A **Backend API** (RESTful or GraphQL)
- A **Notification Service** (Push + SMS + Email)
- A **Real-Time Order Status Engine** (WebSockets or SSE)

### 2.2 Product Functions (High-Level Summary)

- Customers browse a **shared product catalog** of sweets
- Customers select a **store by state**, then choose delivery or pickup
- Customers place orders as **guests** (no account required)
- Customers track their order through statuses: **Confirmed → Preparing → Out for Delivery / Ready for Pickup → Delivered / Collected**
- The owner receives **instant notifications** (push, SMS, email) for every new order, clearly labeled with the store state and order details
- The owner manages all orders from a **centralized dashboard**, filtering by store/state
- The owner manages the **single shared menu** (add, edit, remove sweets, prices, images)
- The app supports **multiple languages** (i18n)
- The customer-facing web app is **fully SEO-optimized** to rank #1 on Google

### 2.3 Operating Environment

| Component | Environment |
|-----------|-------------|
| Customer Web App | Any modern browser (Chrome, Safari, Firefox, Edge) — responsive |
| Customer Mobile App | iOS 15+ / Android 9+ |
| Owner Dashboard | Modern browser (desktop-first) |
| Owner Mobile App | iOS 15+ / Android 9+ |
| Backend | Cloud-hosted (AWS / GCP / Railway) — Node.js or Python FastAPI |
| Database | PostgreSQL (primary) + Redis (caching & sessions) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| SMS | Twilio |
| Email | SendGrid or Resend |

---

## 3. User Classes & Characteristics

### 3.1 Customer (Guest)

- Any member of the public in any U.S. state
- No login required
- Can browse sweets, select a store by state, place an order, pay cash on delivery/pickup, and track their order
- May use the app in their preferred language
- Technical proficiency: General public (low to medium)

### 3.2 Owner (Administrator)

- Single user — the business owner
- Has full access to all stores across all states
- Receives real-time notifications for every incoming order
- Can view, manage, and update orders for any store
- Manages the shared product menu (catalog)
- Manages store locations (addresses, hours, delivery zones per state)
- Can update order status (Confirmed, Preparing, Out for Delivery, Delivered)
- Technical proficiency: Medium (non-developer; UI must be intuitive)

---

## 4. Functional Requirements

---

### MODULE 1 — Store Selection & Location

**FR-1.1** The system shall display a list of all available store locations organized by U.S. state.

**FR-1.2** The customer shall be able to select their state/store at the beginning of the ordering flow.

**FR-1.3** The selected store context shall persist throughout the customer's session (browsing, cart, checkout).

**FR-1.4** Each store shall display its name, state, address, phone number, and operating hours.

**FR-1.5** The system shall show whether a store is currently open or closed, based on its set operating hours.

**FR-1.6** If a store is closed, the customer shall still be able to browse the menu but shall be informed that orders cannot currently be placed at that location.

---

### MODULE 2 — Product Catalog (Shared Menu)

**FR-2.1** The system shall display a single shared menu of sweets available across all stores.

**FR-2.2** Each product entry shall include: name, description, price, category, high-quality image, and availability status.

**FR-2.3** Sweets shall be organized into categories (e.g., Chocolates, Fudge, Gummies, Gift Boxes, Seasonal, etc.).

**FR-2.4** The customer shall be able to search for sweets by name or keyword.

**FR-2.5** The customer shall be able to filter products by category.

**FR-2.6** The system shall indicate when a product is out of stock or unavailable.

**FR-2.7** The owner shall be able to add, edit, or remove products from the shared menu via the admin dashboard.

**FR-2.8** The owner shall be able to mark a product as temporarily unavailable without deleting it.

**FR-2.9** Product images shall be uploadable by the owner directly in the dashboard.

---

### MODULE 3 — Shopping Cart

**FR-3.1** The customer shall be able to add one or more products to a cart without being logged in.

**FR-3.2** The cart shall display each item's name, quantity, unit price, and line total.

**FR-3.3** The customer shall be able to update quantities or remove items from the cart.

**FR-3.4** The cart shall display a running order subtotal.

**FR-3.5** The cart shall persist in the browser session (using localStorage or cookies) so it is not lost on page refresh.

**FR-3.6** The cart shall be associated with the selected store/state context.

---

### MODULE 4 — Guest Checkout

**FR-4.1** The system shall allow customers to complete an order without registering or logging in.

**FR-4.2** During checkout, the customer shall provide: full name, phone number, email address (optional, for order status updates), and order type (Delivery or Pickup).

**FR-4.3** If the customer selects **Delivery**, the system shall additionally collect: delivery address (street, city, state, zip code).

**FR-4.4** If the customer selects **Pickup**, the system shall display the selected store's address and estimated pickup time.

**FR-4.5** The customer shall be able to add a special note/instruction for the order (e.g., "No nuts please").

**FR-4.6** The system shall confirm the payment method as **Cash on Delivery / Cash at Pickup** before order submission.

**FR-4.7** The customer shall review a full order summary before final submission.

**FR-4.8** Upon submission, the system shall generate a unique **Order ID** and display a confirmation screen with order details and the Order ID.

**FR-4.9** If an email was provided, the system shall send an order confirmation email to the customer.

**FR-4.10** If a phone number was provided, the system may (optionally) send an SMS confirmation to the customer.

---

### MODULE 5 — Order Tracking

**FR-5.1** After placing an order, the customer shall be presented with an order tracking page accessible via their unique Order ID.

**FR-5.2** The tracking page shall show real-time order status using the following stages:

| Stage | Description |
|-------|-------------|
| ✅ Order Confirmed | Order has been received by the system |
| 🍬 Preparing | The sweet shop is preparing the order |
| 🚚 Out for Delivery | Order is on its way (Delivery orders only) |
| 🏪 Ready for Pickup | Order is ready at the store (Pickup orders only) |
| 🎉 Delivered / Collected | Order completed |

**FR-5.3** The system shall update order status in real time using WebSockets or Server-Sent Events (SSE) — no page refresh required.

**FR-5.4** The customer shall be able to return to their tracking page at any time by entering their Order ID on the website/app.

**FR-5.5** The customer shall receive a notification (SMS or email, if provided) when the order status changes to "Out for Delivery" or "Ready for Pickup."

---

### MODULE 6 — Owner Notification System

**FR-6.1** The system shall send an **instant notification** to the owner every time a new order is placed at any store.

**FR-6.2** Notifications shall clearly include: Order ID, store/state name, order type (Delivery/Pickup), customer name, order total, and list of items.

**FR-6.3** Notifications shall be delivered via three simultaneous channels:

| Channel | Delivery Method |
|---------|----------------|
| Push Notification | Via Firebase Cloud Messaging (FCM) to the owner's mobile app |
| SMS | Via Twilio to the owner's registered mobile number |
| Email | Via SendGrid/Resend to the owner's email address |

**FR-6.4** The owner shall be able to configure which notification channels are active (e.g., disable SMS during certain hours).

**FR-6.5** The system shall retry failed notifications at least 3 times before logging them as failed.

**FR-6.6** Notification history shall be stored and viewable in the admin dashboard.

---

### MODULE 7 — Owner Admin Dashboard

**FR-7.1** The owner shall log in to the admin dashboard using a secure username and password (JWT-based authentication).

**FR-7.2** The dashboard home screen shall display a real-time summary: total orders today, orders by store/state, pending orders, and revenue summary (COD — collected vs. pending).

**FR-7.3** The owner shall be able to view all incoming orders across all stores in a unified order feed.

**FR-7.4** The owner shall be able to filter orders by: store/state, order type (Delivery/Pickup), order status, and date range.

**FR-7.5** The owner shall be able to click on any order to view full order details.

**FR-7.6** The owner shall be able to update an order's status from the dashboard. Status transitions:

```
Order Confirmed → Preparing → Out for Delivery / Ready for Pickup → Delivered / Collected
```

**FR-7.7** The dashboard shall highlight new (unreviewed) orders with a visual alert and sound notification (in-browser).

**FR-7.8** The dashboard shall include an analytics section showing: orders per store per day/week/month, most popular products, peak ordering hours, and delivery vs. pickup ratio.

**FR-7.9** The owner shall be able to manage store details: name, address, state, phone number, operating hours, delivery radius/zones.

**FR-7.10** The owner shall be able to add, edit, or deactivate store locations.

---

### MODULE 8 — Menu Management (Owner)

**FR-8.1** The owner shall manage a single shared product catalog that applies to all stores.

**FR-8.2** The owner shall be able to: add new sweet products, edit existing ones (name, price, description, image, category), mark items as available/unavailable, and delete items permanently.

**FR-8.3** The owner shall be able to create and manage product categories.

**FR-8.4** Product changes shall reflect immediately across all store menus on the customer-facing app.

---

### MODULE 9 — Multi-Language Support (i18n)

**FR-9.1** The customer-facing web and mobile app shall support multiple languages.

**FR-9.2** The system shall auto-detect the user's browser/device language and default to the nearest supported language.

**FR-9.3** A language switcher shall be prominently available in the app header/navigation on both web and mobile.

**FR-9.4** All UI text, product names, descriptions, and system messages shall be translatable via a translation file system (e.g., i18next for web, i18n library for React Native).

**FR-9.5** The admin dashboard shall remain in English (as it is for one owner).

**FR-9.6** The following languages shall be supported at launch (additional languages can be added without code changes): English, Spanish, French. *(Additional languages TBD by owner.)*

---

## 5. Non-Functional Requirements

### 5.1 Performance

**NFR-1** The customer web app home page shall load in under **2 seconds** on a standard 4G connection (measured via Lighthouse).

**NFR-2** The system shall handle at least **500 concurrent users** without performance degradation.

**NFR-3** Order placement shall complete in under **3 seconds** end-to-end under normal load.

**NFR-4** Owner notifications shall be delivered within **5 seconds** of order placement.

**NFR-5** All API responses shall return within **500ms** under normal load (P95).

### 5.2 Security

**NFR-6** All data transmitted between client and server shall use **HTTPS/TLS 1.3**.

**NFR-7** Owner authentication shall use **JWT tokens** with expiry and refresh token rotation.

**NFR-8** The admin dashboard shall be protected behind authentication — no public access.

**NFR-9** Customer phone numbers and emails shall be stored **encrypted at rest**.

**NFR-10** The system shall be protected against: SQL injection, XSS, CSRF, and brute-force login attacks (rate limiting).

**NFR-11** All passwords shall be hashed using **bcrypt** (min 12 rounds).

### 5.3 Scalability

**NFR-12** The backend shall be containerized (**Docker**) and deployable on cloud infrastructure (AWS ECS / GCP Cloud Run) to support horizontal scaling.

**NFR-13** The database shall use connection pooling to handle traffic spikes during peak hours.

**NFR-14** New store states/locations shall be addable without any code changes — purely via the admin dashboard.

### 5.4 Reliability & Availability

**NFR-15** The system shall target **99.9% uptime** (less than 9 hours downtime per year).

**NFR-16** The system shall implement automated database backups every 24 hours with 30-day retention.

**NFR-17** Notification failures shall be logged and retried automatically.

### 5.5 Usability

**NFR-18** The customer app shall be operable by a general public user with no training — order completion in under **3 taps/clicks** from home screen.

**NFR-19** The app shall be fully **accessible** (WCAG 2.1 AA compliance): keyboard navigation, screen reader support, sufficient color contrast.

**NFR-20** The mobile app shall support both **iOS and Android** and follow each platform's native design guidelines where applicable.

**NFR-21** The admin dashboard shall be usable without technical training. Key actions (view orders, update status) must be reachable in **2 clicks** from login.

---

## 6. SEO Requirements

*This section defines requirements specifically to make the Sweet Shop website rank #1 on Google Search.*

### 6.1 Technical SEO

**SEO-1** The customer web app shall be built using **Server-Side Rendering (SSR)** or **Static Site Generation (SSG)** (e.g., Next.js) to ensure all content is crawlable by Google bots.

**SEO-2** Every page shall have a unique, keyword-optimized `<title>` tag and `<meta description>`.

**SEO-3** The site shall implement **Open Graph** and **Twitter Card** meta tags for rich social sharing previews.

**SEO-4** The site shall implement **JSON-LD structured data** (Schema.org) for:
- `LocalBusiness` — for each store location (name, address, phone, hours, state)
- `FoodEstablishment` — for the sweet shop brand
- `Product` — for individual sweet items (name, description, price, image)
- `BreadcrumbList` — for navigation hierarchy

**SEO-5** The site shall have a machine-generated **XML sitemap** (`/sitemap.xml`) updated automatically when new products or stores are added.

**SEO-6** The site shall have a `robots.txt` file correctly configured to allow all pages except the admin area.

**SEO-7** All images shall have descriptive `alt` text generated dynamically from product names.

**SEO-8** The site shall achieve a **Google Lighthouse SEO score of 100** and a **Performance score of 90+**.

**SEO-9** The site shall use **canonical URLs** to prevent duplicate content across store pages.

**SEO-10** All URLs shall be human-readable and keyword-rich:
- `/` — Home
- `/stores` — All Stores
- `/store/[state-name]` — Individual state store page
- `/menu` — Full Menu
- `/menu/[category]` — Category page (e.g., `/menu/chocolates`)
- `/menu/[category]/[product-slug]` — Product detail page
- `/order/track/[order-id]` — Order tracking
- `/order/[store-slug]` — Order from specific store

**SEO-11** Each store page (`/store/[state-name]`) shall have unique, geo-targeted content including store address, hours, and local keywords.

### 6.2 On-Page SEO Content

**SEO-12** The homepage shall contain keyword-rich heading hierarchy (H1, H2, H3) targeting phrases like "buy sweets online," "sweet shop near me," "order sweets [state name]."

**SEO-13** Each product page shall contain a minimum of **150 words** of unique descriptive content.

**SEO-14** The site shall have a **Blog/Articles section** (accessible, managed by owner) with sweet-related content to attract organic traffic (e.g., "Best Sweets for Gifting," "History of Fudge").

**SEO-15** Internal linking shall be implemented automatically between related products, categories, and store pages.

### 6.3 Local SEO (Multi-Location)

**SEO-16** Each state store shall have a dedicated landing page optimized for local search (e.g., "Sweet Shop in Texas," "Order Sweets in California").

**SEO-17** Each store page shall include an embedded **Google Maps** view of the store location.

**SEO-18** The system shall generate **Google Business Profile-compatible** data exports for each store location.

**SEO-19** Customer reviews/testimonials shall be displayable on store pages to improve local trust signals.

### 6.4 Performance SEO

**SEO-20** The site shall implement **lazy loading** for all product images below the fold.

**SEO-21** The site shall use a **Content Delivery Network (CDN)** for static assets and images.

**SEO-22** The site shall pass all **Core Web Vitals** thresholds:
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

**SEO-23** The site shall be **mobile-first responsive** — Google uses mobile-first indexing.

---

## 7. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CUSTOMER LAYER                        │
│  ┌─────────────────┐        ┌───────────────────────┐   │
│  │  Web App         │        │  Mobile App            │   │
│  │  (Next.js SSR)   │        │  (React Native)        │   │
│  └────────┬────────┘        └──────────┬────────────┘   │
└───────────┼──────────────────────────┼─────────────────┘
            │                          │
            ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│                      API GATEWAY                         │
│              (REST API — Node.js / FastAPI)              │
│         Authentication │ Rate Limiting │ Routing         │
└──────────────────┬──────────────────────────────────────┘
                   │
       ┌───────────┼─────────────┐
       ▼           ▼             ▼
┌────────────┐ ┌────────┐ ┌───────────────┐
│  Order     │ │ Menu   │ │  Store        │
│  Service   │ │ Service│ │  Service      │
└─────┬──────┘ └────────┘ └───────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│         NOTIFICATION SERVICE             │
│  ┌────────┐  ┌───────┐  ┌───────────┐  │
│  │  FCM   │  │ Twilio│  │ SendGrid  │  │
│  │ (Push) │  │ (SMS) │  │ (Email)   │  │
│  └────────┘  └───────┘  └───────────┘  │
└─────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────┐
│                   DATA LAYER                           │
│  ┌──────────────────┐     ┌──────────────────────┐   │
│  │  PostgreSQL DB    │     │  Redis Cache          │   │
│  │  (Primary Store)  │     │  (Sessions, Queue)    │   │
│  └──────────────────┘     └──────────────────────┘   │
└───────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│         OWNER ADMIN LAYER                │
│  ┌──────────────────────────────────┐   │
│  │  Admin Dashboard (React Web App)  │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Owner Mobile App (React Native)  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 7.1 Tech Stack Recommendation

| Layer | Technology |
|-------|-----------|
| Customer Web App | Next.js 14+ (SSR/SSG for SEO) |
| Customer + Owner Mobile | React Native (Expo) |
| Owner Dashboard | React.js (Vite) |
| Backend API | Node.js + Express or FastAPI (Python) |
| Database | PostgreSQL + Prisma ORM |
| Cache / Queue | Redis |
| Real-time Updates | Socket.IO or Server-Sent Events |
| Push Notifications | Firebase Cloud Messaging |
| SMS Notifications | Twilio |
| Email Notifications | SendGrid or Resend |
| File Storage (images) | AWS S3 or Cloudflare R2 |
| CDN | Cloudflare |
| Hosting | Railway / Render / AWS |
| Authentication | JWT + bcrypt |
| i18n (Web) | i18next / next-i18next |
| i18n (Mobile) | i18n-js or expo-localization |

---

## 8. Data Models

### 8.1 Store

```json
{
  "id": "uuid",
  "name": "Sweet Shop — Texas",
  "state": "TX",
  "address": "123 Main St, Houston, TX 77001",
  "phone": "+1-713-555-0100",
  "email": "texas@sweetshop.com",
  "operatingHours": {
    "monday": { "open": "09:00", "close": "20:00" },
    "tuesday": { "open": "09:00", "close": "20:00" }
  },
  "deliveryZones": ["77001", "77002", "77003"],
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 8.2 Product

```json
{
  "id": "uuid",
  "name": { "en": "Chocolate Fudge", "es": "Fudge de Chocolate", "fr": "Fudge au Chocolat" },
  "description": { "en": "...", "es": "...", "fr": "..." },
  "price": 12.99,
  "category": "Fudge",
  "imageUrl": "https://cdn.sweetshop.com/products/choc-fudge.jpg",
  "isAvailable": true,
  "slug": "chocolate-fudge",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 8.3 Order

```json
{
  "id": "uuid",
  "orderNumber": "SS-TX-00423",
  "storeId": "uuid",
  "storeState": "TX",
  "type": "DELIVERY | PICKUP",
  "status": "CONFIRMED | PREPARING | OUT_FOR_DELIVERY | READY_FOR_PICKUP | DELIVERED | COLLECTED",
  "customer": {
    "name": "Jane Smith",
    "phone": "+1-555-123-4567",
    "email": "jane@example.com"
  },
  "deliveryAddress": {
    "street": "456 Oak Ave",
    "city": "Houston",
    "state": "TX",
    "zip": "77001"
  },
  "items": [
    { "productId": "uuid", "productName": "Chocolate Fudge", "quantity": 2, "unitPrice": 12.99, "lineTotal": 25.98 }
  ],
  "specialNote": "No nuts please",
  "subtotal": 25.98,
  "paymentMethod": "CASH",
  "paymentStatus": "PENDING | COLLECTED",
  "estimatedTime": "30 mins",
  "notificationsSent": { "push": true, "sms": true, "email": true },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 8.4 Admin / Owner

```json
{
  "id": "uuid",
  "name": "Owner Name",
  "email": "owner@sweetshop.com",
  "phone": "+1-555-000-0001",
  "passwordHash": "bcrypt_hash",
  "notificationPreferences": {
    "push": true,
    "sms": true,
    "email": true
  },
  "role": "OWNER",
  "createdAt": "timestamp"
}
```

### 8.5 Category

```json
{
  "id": "uuid",
  "name": { "en": "Chocolates", "es": "Chocolates", "fr": "Chocolats" },
  "slug": "chocolates",
  "imageUrl": "...",
  "sortOrder": 1,
  "isActive": true
}
```

---

## 9. External Interface Requirements

### 9.1 Customer Web App Interface

- Fully responsive (mobile-first): 375px → 1920px viewport support
- Navigation: sticky top nav with store selector, language switcher, cart icon
- Home Page: hero banner, featured products, store locations by state, about section
- Menu Page: category filters + product grid with search
- Product Page: image, name, description, price, quantity selector, "Add to Cart"
- Cart Page: item list, total, "Proceed to Checkout"
- Checkout Page: order type selection, customer details form, order review, "Place Order"
- Tracking Page: order status timeline, live updates
- Store Pages: per-state location details, map embed, local products highlight

### 9.2 Customer Mobile App Interface

- Bottom tab navigation: Home | Menu | Cart | Track Order
- Native push notification support
- Offline-capable browsing (cached menu)
- Store selection during onboarding

### 9.3 Owner Admin Dashboard Interface

- Sidebar navigation: Orders | Menu | Stores | Analytics | Notifications | Settings
- Real-time order feed with sound/visual alert for new orders
- Order detail modal with one-click status update
- Analytics charts (orders over time, revenue by store, top products)
- Menu editor: product list with inline editing, image upload
- Store manager: add/edit/deactivate store locations

### 9.4 Third-Party Integrations

| Service | Purpose | API |
|---------|---------|-----|
| Firebase FCM | Push notifications (Owner + Customer) | REST API |
| Twilio | SMS notifications to Owner | Twilio Node SDK |
| SendGrid / Resend | Email notifications + order confirmations | REST API |
| Google Maps | Embedded store maps, delivery zone display | Maps JavaScript API |
| AWS S3 / Cloudflare R2 | Product image storage | SDK |
| Cloudflare | CDN + DDoS protection | CDN |

---

## 10. Constraints & Assumptions

### 10.1 Constraints

- Payment is **cash only** (COD or at pickup). No online payment gateway is required in v1.
- There is **one owner** — no multi-admin roles needed in v1.
- The menu is **shared** across all stores — per-store menu differences are not in scope for v1.
- No loyalty program, discount codes, or coupons in v1.
- No inventory management in v1 (owner manually marks items out of stock).

### 10.2 Assumptions

- The owner has a smartphone capable of receiving push notifications.
- Each store has a stable internet connection for the owner to manage orders.
- Delivery is handled by the store's own staff — no third-party delivery integration (e.g., DoorDash) in v1.
- The number of states/stores will not exceed 50 at launch.
- All stores operate under the same brand name and shared menu.

### 10.3 Future Scope (v2+)

- Online payment integration (Stripe, PayPal)
- Per-store menu customization
- Customer accounts and order history
- Loyalty points and referral system
- Third-party delivery integration (DoorDash Drive, Uber Direct)
- Inventory tracking
- Multi-admin roles (store manager per state)
- Discount codes and promotions
- Customer reviews and ratings

---

## 11. Cursor AI Prompt

*Use the following prompt inside Cursor to design and build the Sweet Shop application. Copy and paste it exactly.*

---

```
You are a senior full-stack software engineer. Build a complete multi-state sweet shop online ordering platform based on the following specifications:

---

PROJECT NAME: Sweet Shop — Multi-State Online Ordering Platform

---

TECH STACK:
- Customer Web App: Next.js 14+ (App Router, SSR/SSG for SEO)
- Customer Mobile App + Owner Mobile App: React Native with Expo
- Owner Admin Dashboard: React.js (Vite)
- Backend API: Node.js with Express + Prisma ORM
- Database: PostgreSQL
- Cache: Redis
- Real-time: Socket.IO (WebSockets for order status updates)
- Push Notifications: Firebase Cloud Messaging (FCM)
- SMS: Twilio
- Email: SendGrid or Resend
- Image Storage: Cloudflare R2 (or AWS S3)
- CDN: Cloudflare
- Auth: JWT + bcrypt
- i18n Web: next-i18next
- i18n Mobile: expo-localization + i18n-js
- Containerization: Docker + docker-compose

---

USER ROLES:
1. CUSTOMER (Guest — no login required)
2. OWNER (Single admin — full control of all stores)

---

CORE FEATURES TO BUILD:

[CUSTOMER FLOW]
1. Landing page with list of all store locations by U.S. state
2. Customer selects a state/store
3. Customer browses shared product catalog (sweets) with category filters and keyword search
4. Customer adds items to cart (persisted in localStorage)
5. Customer proceeds to guest checkout:
   - Enters: full name, phone, email (optional)
   - Selects: Delivery or Pickup
   - If Delivery: enters full delivery address
   - If Pickup: sees store address and estimated wait time
   - Adds optional special instruction note
   - Reviews order summary
   - Confirms payment method: Cash on Delivery / Cash at Pickup
   - Submits order
6. System generates a unique Order ID (format: SS-[STATE]-[5 digit number], e.g., SS-TX-00423)
7. Customer sees order confirmation screen with Order ID
8. System sends confirmation email (if email provided) and optional SMS
9. Customer can track order status in real time using Order ID:
   - Stages: Order Confirmed → Preparing → Out for Delivery (or Ready for Pickup) → Delivered / Collected
   - Real-time updates via WebSocket — no page refresh needed

[OWNER FLOW]
1. Owner logs in to Admin Dashboard (secure JWT auth)
2. Owner sees real-time unified order feed across all stores
3. Every new order triggers:
   - Push notification (FCM) to owner's mobile app
   - SMS via Twilio to owner's phone number
   - Email via SendGrid to owner's email
   - All notifications include: Order ID, store/state, order type, customer name, items, total
4. Owner can filter orders by: state/store, order type, status, date
5. Owner clicks any order to view full details
6. Owner updates order status with one click (triggers real-time update to customer's tracking page)
7. Admin dashboard shows analytics: orders per store, revenue, popular products, peak hours
8. Owner manages shared product menu: add/edit/delete sweets, categories, images, availability
9. Owner manages store locations: add, edit, deactivate stores by state

---

SEO REQUIREMENTS (CRITICAL — must rank #1 on Google):
- Use Next.js SSR/SSG — all customer pages must be server-rendered
- Each page must have dynamic, unique <title> and <meta description>
- Implement JSON-LD Schema.org structured data: LocalBusiness, FoodEstablishment, Product, BreadcrumbList
- Generate /sitemap.xml automatically, updated when products/stores change
- Create /robots.txt (allow all except /admin)
- All product images must have descriptive alt text
- URL structure must be clean and keyword-rich:
  / | /stores | /store/[state-slug] | /menu | /menu/[category] | /menu/[category]/[product-slug] | /order/track/[order-id]
- Each /store/[state-slug] page must have geo-targeted content for local SEO
- Embed Google Maps on each store page
- Achieve Lighthouse SEO score: 100, Performance score: 90+
- Implement Core Web Vitals optimization: LCP < 2.5s, CLS < 0.1, FID < 100ms
- Lazy load all images below the fold
- Use a CDN for all static assets

---

MULTI-LANGUAGE (i18n):
- Support: English, Spanish, French at launch
- Auto-detect browser/device language
- Language switcher in header
- All UI strings, product names, and descriptions must be translatable via translation files
- Admin dashboard stays English only

---

DATA MODELS (implement exactly as described):
- Store: id, name, state, address, phone, email, operatingHours (per weekday), deliveryZones (zip codes), isActive
- Product: id, name (multilingual JSON), description (multilingual JSON), price, category, imageUrl, isAvailable, slug
- Category: id, name (multilingual JSON), slug, imageUrl, sortOrder, isActive
- Order: id, orderNumber, storeId, storeState, type (DELIVERY|PICKUP), status (CONFIRMED|PREPARING|OUT_FOR_DELIVERY|READY_FOR_PICKUP|DELIVERED|COLLECTED), customer {name, phone, email}, deliveryAddress, items [{productId, productName, quantity, unitPrice, lineTotal}], specialNote, subtotal, paymentMethod (CASH), paymentStatus (PENDING|COLLECTED), notificationsSent {push, sms, email}, createdAt, updatedAt
- Admin: id, name, email, phone, passwordHash, notificationPreferences {push, sms, email}, role (OWNER)

---

NOTIFICATIONS:
- Payment: Cash only (COD or at pickup) — no payment gateway needed
- Retry failed notifications 3 times before logging as failed
- Store notification history in DB and show in admin dashboard
- Owner can toggle push/sms/email notifications on/off from settings

---

PROJECT STRUCTURE:
/sweet-shop
  /apps
    /web          → Next.js customer web app
    /mobile       → React Native (Expo) — customer + owner app (separate entry points)
    /admin        → React (Vite) owner dashboard
    /api          → Node.js + Express backend
  /packages
    /db           → Prisma schema + migrations
    /shared       → Shared types, constants, utilities
  /docker-compose.yml
  /README.md

Use a monorepo structure with Turborepo or Nx.

---

IMPORTANT RULES:
- Write production-quality code — no shortcuts
- Use TypeScript everywhere
- All API endpoints must be documented in a /docs route using Swagger/OpenAPI
- Write Prisma schema first, then build services on top
- Use environment variables for all secrets (never hardcode)
- Include a complete .env.example file
- Write a full README.md with setup, run, and deployment instructions
- Mobile app must work on both iOS and Android
- Admin dashboard must be desktop-first (min width 1024px) but responsive
- Customer web app must be mobile-first and fully responsive

Start by generating the complete Prisma schema, then the folder/file structure, then implement feature by feature starting with: Store selection → Menu browsing → Cart → Guest Checkout → Order creation → Notification dispatch → Owner Dashboard → Order tracking.
```

---

*End of SRS v1.0 — Sweet Shop Multi-State Online Ordering Platform*
