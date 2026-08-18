# 💎 PerFin - Personal Finance Tracker & Financial Calculator Suite

> **Live Website**: [perfin.github.io](https://perfin.github.io)  
> A modern, private, client-side personal finance tracker, cashflow dashboard, and financial planning suite built for the web.

![PerFin Banner](https://img.shields.io/badge/Privacy-100%25%20Client--Side-10b981?style=for-the-badge)
![Zero Config](https://img.shields.io/badge/Hosting-GitHub%20Pages-6366f1?style=for-the-badge)
![Themes](https://img.shields.io/badge/Theme-Dark%20%26%20Light-f59e0b?style=for-the-badge)

---

## 🌟 Key Features

### 1. 📊 Financial Dashboard & Cashflow Overview
- **Real-Time Wealth Cards**: Live metrics for Total Net Worth, Monthly Inflow (Income), Monthly Outflow (Expenses), and Net Savings Rate.
- **6-Month Cashflow Bar Chart**: Visual comparison of monthly income vs. expenses over time.
- **Category Expense Donut**: Breakdown of current month spending with interactive hover slices.
- **Recent Transaction Feed & Budget Highlights**: Real-time progress bars with dynamic warning colors (amber at 80%, rose at 100%).

### 2. 💳 Income, Expense & Budget Tracker
- **Full Transaction Management**: Add, edit, delete, and categorize financial records.
- **Smart Filtering & Search**: Filter by period (*This Month, Last Month, Last 30 Days, This Year, All Time*), transaction type (*Expense, Income*), or specific category.
- **Monthly Category Budget Allocator**: Customize spending caps across categories with live budget utilization metrics.
- **Data Export / Import**: Export transactions directly to `.csv` or full state backup to `.json`.

### 3. 📈 Compound Interest & Investment Growth Calculator
- **Dynamic Parameters**: Initial deposit, monthly contributions, annual return %, investment timeframe (years), compounding frequency (daily, monthly, quarterly, annually), and inflation adjustment.
- **Interactive Growth Curve**: Area chart visualizing Principal Invested vs. Total Compound Interest Earned.
- **Annual Amortization Table**: Year-by-year schedule of starting balances, contributions, interest yields, and real purchasing power.

### 4. 🏡 Loan & Mortgage Amortization Calculator
- **EMI Math Engine**: Calculates exact Monthly Principal & Interest payments.
- **Early Payoff & Accelerated Savings**: Simulates extra monthly prepayments and calculates total interest saved and years shaved off the loan.
- **Payoff Trajectory Graph & Annual Schedule**: Visualizes loan balance reduction over the loan lifecycle.

### 5. 🎯 Retirement & FIRE (Financial Independence, Retire Early) Planner
- **FIRE Number Estimator**: Uses the Safe Withdrawal Rate (SWR / 4% rule) to calculate your required nest egg.
- **Accumulation & Decumulation Horizon**: Visualizes wealth building during working years and asset drawdown during retirement.
- **Early FIRE Age Detection**: Automatically calculates the exact age you reach financial freedom based on savings rate and investment returns.

### 6. 💼 Net Worth & Balance Sheet Tracker
- **Asset Allocation**: Track cash, index funds, retirement accounts, crypto, and real estate.
- **Liabilities & Debt Tracking**: Manage mortgages, auto loans, student debt, and credit balances.
- **Health Indicators**: Real-time Net Worth calculation and Debt-to-Asset ratio benchmarking.

### 7. ⚙️ Privacy & Customization
- **100% Client-Side Privacy**: All data is stored in the browser's `localStorage`. No accounts, no servers, zero telemetry.
- **Dual Theme System**: Seamless toggle between Modern Dark Fintech Mode and Crisp Light Mode.
- **Global Currency Engine**: Instant switching between USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), CAD ($), AUD ($), and more.

---

## 🚀 Getting Started

Since PerFin is built purely with standard HTML5, CSS3, and modern JavaScript:

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/perfin/perfin.github.io.git
   cd perfin.github.io
   ```
2. Open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari) or use a local static server:
   ```bash
   npx serve .
   ```

### Deploying to GitHub Pages
1. Push the files to the `main` branch of your GitHub repository.
2. In GitHub, go to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **Deploy from a branch** and choose `main` / `/ (root)`.
4. Your site will be live at `https://<username>.github.io`!

---

## 🛠️ Architecture & Tech Stack

- **Structure**: Semantic HTML5 with accessible ARIA landmarks.
- **Styling**: Pure CSS with CSS Custom Properties (`variables.css`), glassmorphism effects, responsive CSS grid/flexbox.
- **Typography**: Google Fonts (*Plus Jakarta Sans* & *Outfit*).
- **Icons**: Lucide Icons.
- **Charts**: Chart.js for responsive canvas rendering with dynamic theme synchronization.
- **State Management**: Zero-dependency modular JavaScript (`storage.js`, `calculators.js`, `charts.js`, `tracker.js`, `app.js`).

---

## 📄 License
MIT License. Free for personal and commercial use.
