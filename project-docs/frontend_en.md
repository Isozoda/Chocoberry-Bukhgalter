# Frontend Documentation (MoneyMind)

The MoneyMind (Choco Berry) frontend is a modern, high-performance dashboard designed for managing a dessert business. It leverages the latest technologies and UI/UX best practices to provide a premium user experience.

## 🛠 Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (for extreme speed and a better developer experience).
- **Language**: TypeScript (for type safety and error prevention).
- **Styling**: 
  - [Tailwind CSS](https://tailwindcss.com/) (for rapid and flexible styling).
  - [Shadcn UI](https://ui.shadcn.com/) (modern components based on Radix UI).
  - [Material UI (MUI)](https://mui.com/) (for icons and specialized components).
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (simple, fast global state management).
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest) and Axios (for API communication and data caching).
- **Form Handling**: React Hook Form and Zod (for robust form validation).
- **Internationalization (i18n)**: i18next (full support for **Tajik, Russian, and English**).
- **Charts**: Recharts (for financial data visualization and analytics).

## 📂 Project Structure

- `src/api/`: API integration functions.
- `src/components/`: Reusable UI components (Layout, Forms, Charts).
- `src/hooks/`: Custom hooks for shared logic.
- `src/pages/`: Main application pages and modules.
- `src/store/`: Zustand stores for state management (Auth, Theme, UI).
- `src/i18n/`: Translation files and configuration.

## 🚀 Key Modules

1. **Dashboard**:
   - Sales KPIs overview.
   - Low stock alerts for inventory.
   - Real-time cashbox balances.
   - Weekly sales trends charts.

2. **Sales (POS)**:
   - POS Terminal for adding products to a cart.
   - Support for Cash, Card, and Mixed payment methods.
   - Sales history with the ability to void transactions.

3. **Inventory**:
   - Raw material management (Fruits, Chocolate, Packaging).
   - Product cleaning process with weight loss tracking.
   - Waste and stock adjustment recording.

4. **Products**:
   - Product catalog filtered by cup types.
   - Recipe Builder (BOM) for automatic cost calculation based on ingredients.

5. **Finance**:
   - **Expenses**: Tracking fixed and variable expenses.
   - **Cashbox**: Management of physical cash and bank balances.
   - **Funds**: Specialized funds (Charity, Reserve, Renovation, etc.).

6. **Staff Management**:
   - Employee profiles and role management.
   - Attendance tracking and scheduling.
   - Automated Payroll calculation including bonuses and fines.

7. **Reports**:
   - Profit & Loss (P&L) statements.
   - Detailed sales analysis by hour and product.
   - Export capability to **Excel** and **PDF**.

8. **AI Advisor**:
   - Integrated AI assistant for business data analysis and recommendations.

9. **Telegram Integration**:
   - Linking user profiles to the Telegram bot for notifications and updates.

## ✨ Additional Features

- **Dark Mode**: Seamless dark and light mode support.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
- **Real-time Validation**: Interactive form feedback and validation.
- **Role-based Access**: Conditional UI rendering based on user permissions.
