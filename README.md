# 🍽️ Restaunax Order Management Dashboard

A real-time restaurant order management system featuring a full CRUD backend, a dynamic dashboard, live WebSocket updates, and data visualizations. Built with TSED, Prisma, React, and Socket.IO.

---

## ⚙️ Tech Stack

### Backend (`/api`)

- [TSED](https://tsed.io/): Structured Express framework
- [Prisma](https://prisma.io/): ORM with PostgreSQL
- [Socket.IO](https://socket.io/): Real-time data updates
- [SWC](https://swc.rs/): Fast TypeScript transpilation
- [Docker](https://www.docker.com/): Containerized PostgreSQL and Node.js

### Frontend (`/ux`)

- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- [Material UI](https://mui.com/): UI Components
- [Zustand](https://github.com/pmndrs/zustand): State Management
- [Socket.IO Client](https://socket.io/docs/v4/client-api/): Real-time UI updates
- [Chart.js](https://www.chartjs.org/): Order distribution and analytics

---

## 🧪 Features

- 📦 Live order board with order processing pipelines
- 🧾 Detailed order summary + menu item breakdown
- ✍️ Create/edit/delete orders and menu items
- 🔄 Real-time sync using WebSockets for orders and menu items
- 📊 Visualizations: order type breakdown, top orders, revenue summary
- 🖼️ Icon-based menu using assets from `api/assets/menuIcons` not a production solution

---

## 🚀 Getting Started

### Prerequisites

- Docker + Docker Compose

### Setup

```bash
docker compose up
```

This will:

- Spin up PostgreSQL

- Mount and start the API server (port 8081\)

- Run Prisma migrations and seed data

- Start the frontend dev server on [http://localhost:5173](http://localhost:5173)

- To view the /rest api swagger documentaion [http://localhost:8081/doc](http://localhost:8081/doc)

- To reset database and reseed delete the .seeded file, take down the postgres container, and remove associated volume.

---

At the root I have provided a variety of additional items for adding new menu items

## **🗃️ Data Model**

### **MenuItem**

| Field | Type |
| ----- | ----- |
| id | Int (PK) |
| name | String |
| price | Decimal |
| imagePath | String |
| description | String |
| category | String |
| createdAt | DateTime |

### **Order**

| Field | Type |
| ----- | ----- |
| id | Int (PK) |
| customer | String |
| total | Decimal |
| status | String |
| type | String |
| address | String |
| deliveryFee | Decimal? |
| promotionCode | String? |
| createdAt | DateTime |

### **OrderItem**

| Field       | Type         |
|-------------|--------------|
| id          | Int (PK)     |
| quantity    | Int          |
| price       | Decimal(10,2)|
| orderId     | Int (FK)     |
| menuItemId  | Int (FK)     |
| createdAt   | DateTime     |
| updatedAt   | DateTime     |

---

## **🔧 Development Scripts**

### **API**

Ideally you run via docker compose this handle creation of development .env files and spinning up a posgres container. Below is a list of commands to spin up the API and frontend manually.

bash  
CopyEdit  
`cd api`  
`npm run start            # Start dev API`  
`npm run prisma:seed      # Seed data`  
`npm run test             # Run unit + lint tests`

### **Frontend**

bash  
CopyEdit  
`cd ux`  
`npm run dev              # Start Vite server`  
`NODE_OPTIONS=--max-old-space-size=4096 npm run build            # Production build`

---

## **🧬 Seeding**

The seed script creates:

- A variety of menu items (burgers, fries, drinks, etc.)

- 25+ randomized orders linked to those items

Location: `api/prisma/seed.ts`  
 Auto-runs on initial compose up if `.seeded` file does not exist.

---

## **📁 Directory Overview**

bash  
CopyEdit  
`restaunax-technical-assessment/`  
`├── api/`  
`│   ├── src/              # TSED services/controllers/socket.io handlers`  
`│   ├── prisma/           # DB schema and seed data`  
`│   └── assets/menuIcons/ # PNG assets for menu items`  
`├── ux/`  
`│   ├── src/components/   # Dashboard cards, modals, charts`  
`│   ├── src/pages/        # Orders, Dashboard, Menu`  
`│   └── src/stores/       # State stores`  
`└── docker-compose.yml`

---

## **🔍 Notable Components**

- `OrderPipeline`: UI for order status updates

- `OrderStatusControl`: Inline status update selector

- `OrderTypeDistribution`: Pie chart of pickup vs delivery

- `FinancialSummary`: Total income visualization

- `TopOrders`: Renders top 5 orders by value

---

## 🧭 Next Steps

Here are strategic development areas to expand this project into a full-featured platform:

---

### 👥 User Management & Permissions

- Implement user registration, login, and JWT-based authentication
- Define roles: Owner, Manager, Server, Cook, Cashier
- Apply role-based access control (RBAC) to routes and UI

---

### 🧾 Order & Payment System Enhancements

- Add payment processing
- Support dine-in, takeout, and delivery-specific logic
- Introduce table assignment or QR code linking
- Add tip and tax calculations
- Include invoice generation and printable receipts

---

### 📋 Menu Management Features

- CRUD for categories (e.g., Drinks, Appetizers)
- Daily specials, availability toggles, and kitchen notes
- Image and file uploads (S3)
- Move images out of the api to keep it ephemeral
- Track popularity metrics or ratings per item

---

### 🧑‍🍳 Kitchen Display System (KDS)

- Live view for kitchen staff to manage preparation queue
- Color-coded status updates (e.g., pending → cooking → ready)
- Order ticket printing support

---

### 🪙 Inventory & Supply Chain

- Manage stock levels per ingredient or menu item
- Alert when low stock or expired
- Track vendor orders and delivery history

---

### 🧮 Advanced Analytics & Reporting

- Sales by time period, category, and item
- Order trends and customer frequency
- Export to CSV/Excel or sync with external accounting tools

---

### 💬 Notifications & Communication

- Real-time SMS/email notifications for order readiness
- Staff task assignment or shift notes
- System logs and audit trails for data changes

---

### 🌐 Multi-Location Support

- Branch-based data partitioning
- Shared corporate reports across locations
- Configurable branding and settings per location

---

### 🛠️ DevOps & Scaling

- Container orchestration with Kubernetes or ECS
- CI/CD pipelines (GitHub Actions, GitLab CI, etc.)
- Monitoring via Grafana, Prometheus, or Datadog

---

## **👤 Author**

**Kyle S. Curren**  
 📍 Marion, OH  
 🔗 [https://github.com/ksc4130](https://github.com/ksc4130)

Built for the Restaunax Full-Stack Developer Assessment.
