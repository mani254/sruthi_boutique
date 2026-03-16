# Shruthi Boutique Management System 👗

A state-of-the-art, premium management system tailored for the unique needs of Shruthi Boutique. This platform streamlines daily operations, from customer tracking to automated billing, all wrapped in a sophisticated and modern user interface.

## 🌟 Vision & Features

Our goal is to provide a seamless, aesthetic, and highly efficient tool for boutique management.

### 📊 Advanced Business Intelligence Dashboard
- **Intelligent Filtering**: Effortlessly analyze business performance with dynamic date range selectors (Today, Last Month, Custom Range, etc.).
- **Proactive Delivery Tracking**:
  - **Upcoming Deliveries**: Automatically identifies and lists orders due in the next 3 days.
  - **Overdue Deliveries**: Highlights missed deadlines to ensure immediate customer follow-up.
- **Premium Analytics**: Visual summary of Income, Order counts, and Delivery statuses, all reflecting your chosen filters.

### 🧾 Next-Gen Billing & Invoice Management
- **Multi-Tab Workspace**: Handle multiple customers simultaneously with a sleek, browser-inspired tabbed interface.
- **Automated Two-Copy Printing**:
  - Generates professional PDF receipts as soon as you save or update an order.
  - Automatically splits the printout into **OFFICE COPY** and **CUSTOMER COPY** across separate pages for A4 printing.
- **Smart Formatting**: Neat, compact receipt layout with automatic **Amount in Words** conversion and clear balance tracking.
- **Manual Reprinting**: Dedicated "Generate Bill" action for on-demand receipt generation.

### 🔐 Robust Security & Data Governance
- **Granular RBAC**: 
  - **Superadmins**: Full system oversight, managing multiple store locations and administrative identities.
  - **Store Admins**: Focused access to local store data, ensuring privacy and operational focus.
- **Data Isolation**: Multi-tenant architecture ensuring store-specific data remains private to authorized personnel.

### 🎨 Bespoke Premium Aesthetics
- **Purple Design System**: A carefully curated color palette in the OKLCH space, providing a high-end boutique feel.
- **Adaptive Themes**: Full support for **Light and Dark modes** with persistent user preferences.
- **Modern UX**: Smooth micro-animations and responsive layouts that feel premium on any device.

## 🛠 Technology Architecture

This project is built on a modern, scalable monorepo architecture:

- **Monorepo Management**: [Turborepo](https://turbo.build/) for high-performance orchestration.
- **Frontend**: [Next.js](https://nextjs.org/) (App Router) & React 19.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom OKLCH color tokens.
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) for flexible yet structured data modeling.
- **API Strategy**: Standardized RESTful endpoints with modern Next.js Route Handlers.
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) for efficient server state management.

## 📁 System Structure

```text
├── apps/
│   └── web/           # High-performance Next.js Frontend & API Handlers
├── packages/
│   ├── database/      # Centralized Mongoose models & DB configuration
│   ├── types/         # Unified TypeScript interfaces and definitions
│   ├── tsconfig/      # Standardized TypeScript configurations
│   └── eslint-config/ # Strict Linting and formatting rules
└── turbo.json         # Build orchestration & caching rules
```

## 🚀 Deployment & Installation

### Setup Environment
1. Ensure you have **Node.js (LTS)** and **PNPM** installed.
2. Clone the repository and navigate to the project root.
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Configure `.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_secret
   PORT=3000
   ```

### Running Locally
- **Development Mode**: `pnpm dev`
- **Build Project**: `pnpm build`
- **Product Preview**: `pnpm start`

## ⚖️ Legal & Proprietary Notice
This software and all related documentation are the proprietary property of Shruthi Boutique. All rights reserved. Unauthorized copying, distribution, or use is strictly prohibited.
