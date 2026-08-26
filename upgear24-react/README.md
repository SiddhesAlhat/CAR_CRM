# UpGear24 React Frontend

A React/Vite recreation of the UpGear24 car accessories management dashboard based on the supplied screenshots and project blueprint.

## Included
- Products / Product Catalog
- Live Jobs
- My Sales
- Quotes
- Accounts / Payments Queue
- Inventory
- Staff Management
- Analytics Dashboard
- Technician W
- Technician R
- Settings / Shop Profile
- Responsive sidebar and mobile layout
- LocalStorage demo persistence for products, staff, jobs, quotes, customers and shop settings

## Run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Backend integration

The UI is intentionally decoupled from the Java backend. Replace the localStorage helpers in `src/store/data.js` with Axios calls to your Spring Boot REST APIs.
