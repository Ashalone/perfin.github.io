/**
 * PerFin - Storage & State Management Module
 * Persistent LocalStorage with Sample Data, JSON/CSV Export & Import
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'perfin_transactions',
  BUDGETS: 'perfin_budgets',
  NETWORTH: 'perfin_networth',
  SETTINGS: 'perfin_settings',
  CALC_PRESETS: 'perfin_calc_presets'
};

const DEFAULT_CATEGORIES = {
  expense: [
    { id: 'housing', name: 'Housing & Rent', icon: 'home', color: '#6366f1' },
    { id: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#10b981' },
    { id: 'dining', name: 'Dining & Food', icon: 'utensils', color: '#f59e0b' },
    { id: 'transport', name: 'Transportation', icon: 'car', color: '#38bdf8' },
    { id: 'utilities', name: 'Utilities & Bills', icon: 'zap', color: '#ec4899' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#8b5cf6' },
    { id: 'health', name: 'Health & Fitness', icon: 'heart-pulse', color: '#14b8a6' },
    { id: 'shopping', name: 'Shopping', icon: 'bag', color: '#f43f5e' },
    { id: 'education', name: 'Education & Career', icon: 'book-open', color: '#a855f7' },
    { id: 'travel', name: 'Travel & Vacations', icon: 'plane', color: '#06b6d4' },
    { id: 'misc', name: 'Miscellaneous', icon: 'more-horizontal', color: '#94a3b8' }
  ],
  income: [
    { id: 'salary', name: 'Primary Salary', icon: 'briefcase', color: '#10b981' },
    { id: 'freelance', name: 'Freelance / Consulting', icon: 'code', color: '#6366f1' },
    { id: 'investments', name: 'Dividends & Returns', icon: 'trending-up', color: '#8b5cf6' },
    { id: 'business', name: 'Business Income', icon: 'store', color: '#38bdf8' },
    { id: 'bonus', name: 'Bonus & Incentives', icon: 'award', color: '#f59e0b' },
    { id: 'other_inc', name: 'Other Income', icon: 'plus-circle', color: '#94a3b8' }
  ]
};

const DEFAULT_SETTINGS = {
  currency: 'USD',
  currencySymbol: '$',
  currencyPosition: 'prefix', // prefix or suffix
  theme: 'dark',
  dateFormat: 'YYYY-MM-DD'
};

const CURRENCY_LIST = [
  { code: 'USD', symbol: '$', name: 'USD - US Dollar' },
  { code: 'EUR', symbol: '€', name: 'EUR - Euro' },
  { code: 'GBP', symbol: '£', name: 'GBP - British Pound' },
  { code: 'INR', symbol: '₹', name: 'INR - Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'CAD - Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'AUD - Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'JPY - Japanese Yen' },
  { code: 'CHF', symbol: 'CHF ', name: 'CHF - Swiss Franc' },
  { code: 'SGD', symbol: 'S$', name: 'SGD - Singapore Dollar' },
  { code: 'CNY', symbol: '¥', name: 'CNY - Chinese Yuan' },
  { code: 'AED', symbol: 'AED ', name: 'AED - UAE Dirham' },
  { code: 'BRL', symbol: 'R$', name: 'BRL - Brazilian Real' }
];

const DEFAULT_BUDGETS = {
  housing: 1800,
  groceries: 600,
  dining: 400,
  transport: 350,
  utilities: 250,
  entertainment: 200,
  health: 150,
  shopping: 300,
  education: 100,
  travel: 200,
  misc: 100
};

const DEFAULT_NETWORTH = {
  assets: [
    { id: 'ast-1', name: 'Checking & High Yield Savings', category: 'Cash & Bank', amount: 18500 },
    { id: 'ast-2', name: 'Index Funds & Stock Portfolio', category: 'Equities & ETFs', amount: 48200 },
    { id: 'ast-3', name: '401(k) / IRA Retirement', category: 'Retirement', amount: 62000 },
    { id: 'ast-4', name: 'Primary Residence Equity', category: 'Real Estate', amount: 85000 },
    { id: 'ast-5', name: 'Crypto & Digital Assets', category: 'Crypto', amount: 4500 }
  ],
  liabilities: [
    { id: 'lib-1', name: 'Mortgage Remaining Balance', category: 'Real Estate Debt', amount: 62000 },
    { id: 'lib-2', name: 'Auto Loan', category: 'Vehicle Debt', amount: 9400 },
    { id: 'lib-3', name: 'Credit Card Balance', category: 'Revolving Credit', amount: 1250 }
  ]
};

// Generate realistic sample transactions
function generateSampleTransactions() {
  const today = new Date();
  const txs = [];
  
  function getDateStr(daysAgo) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  }

  // Monthly Recurring Incomes
  txs.push({
    id: 'tx-inc-1',
    type: 'income',
    category: 'salary',
    amount: 5200,
    date: getDateStr(3),
    title: 'Bi-Weekly Paycheck',
    notes: 'Tech Corp Direct Deposit'
  });
  txs.push({
    id: 'tx-inc-2',
    type: 'income',
    category: 'freelance',
    amount: 1450,
    date: getDateStr(10),
    title: 'UI Design Client Project',
    notes: 'Stripe Payout'
  });
  txs.push({
    id: 'tx-inc-3',
    type: 'income',
    category: 'investments',
    amount: 280,
    date: getDateStr(16),
    title: 'VTI & SCHD Quarterly Dividends',
    notes: 'Brokerage Dividend Reinvestment'
  });

  // Housing & Bills
  txs.push({
    id: 'tx-exp-1',
    type: 'expense',
    category: 'housing',
    amount: 1750,
    date: getDateStr(2),
    title: 'Apartment Rent Payment',
    notes: 'Monthly Lease'
  });
  txs.push({
    id: 'tx-exp-2',
    type: 'expense',
    category: 'utilities',
    amount: 135,
    date: getDateStr(4),
    title: 'Electric & Gas Utility',
    notes: 'City Power & Light'
  });
  txs.push({
    id: 'tx-exp-3',
    type: 'expense',
    category: 'utilities',
    amount: 80,
    date: getDateStr(5),
    title: 'High-Speed Fiber Internet',
    notes: 'Monthly subscription'
  });

  // Groceries & Food
  txs.push({
    id: 'tx-exp-4',
    type: 'expense',
    category: 'groceries',
    amount: 168.45,
    date: getDateStr(1),
    title: 'Trader Joe\'s Grocery Haul',
    notes: 'Weekly essentials & produce'
  });
  txs.push({
    id: 'tx-exp-5',
    type: 'expense',
    category: 'groceries',
    amount: 215.30,
    date: getDateStr(8),
    title: 'Costco Wholesale Food Restock',
    notes: 'Bulk pantry & snacks'
  });
  txs.push({
    id: 'tx-exp-6',
    type: 'expense',
    category: 'dining',
    amount: 64.50,
    date: getDateStr(0),
    title: 'Artisan Sushi Dinner',
    notes: 'Weekend dinner with friends'
  });
  txs.push({
    id: 'tx-exp-7',
    type: 'expense',
    category: 'dining',
    amount: 28.75,
    date: getDateStr(6),
    title: 'Local Coffee & Pastries',
    notes: 'Weekend cafe work session'
  });

  // Transport & Auto
  txs.push({
    id: 'tx-exp-8',
    type: 'expense',
    category: 'transport',
    amount: 62.00,
    date: getDateStr(3),
    title: 'Gas Station Fuel',
    notes: 'Full tank fill up'
  });
  txs.push({
    id: 'tx-exp-9',
    type: 'expense',
    category: 'transport',
    amount: 110.00,
    date: getDateStr(12),
    title: 'Metro Commuter Pass',
    notes: 'Monthly transit card'
  });

  // Entertainment & Shopping
  txs.push({
    id: 'tx-exp-10',
    type: 'expense',
    category: 'entertainment',
    amount: 45.00,
    date: getDateStr(7),
    title: 'Cinema IMAX Tickets & Snacks',
    notes: 'Dune premiere'
  });
  txs.push({
    id: 'tx-exp-11',
    type: 'expense',
    category: 'entertainment',
    amount: 19.99,
    date: getDateStr(14),
    title: 'Spotify & Streaming Bundles',
    notes: 'Monthly recurring'
  });
  txs.push({
    id: 'tx-exp-12',
    type: 'expense',
    category: 'shopping',
    amount: 145.00,
    date: getDateStr(9),
    title: 'Running Shoes & Athletic Wear',
    notes: 'Nike athletic wear'
  });
  txs.push({
    id: 'tx-exp-13',
    type: 'expense',
    category: 'health',
    amount: 75.00,
    date: getDateStr(11),
    title: 'Gym & Climbing Membership',
    notes: 'Monthly fitness pass'
  });

  return txs;
}

const Storage = {
  // --- Settings ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      console.warn('LocalStorage error:', e);
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // --- Transactions ---
  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        // Initialize with realistic sample data if first time
        const initial = generateSampleTransactions();
        this.saveTransactions(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('LocalStorage error loading transactions:', e);
      return [];
    }
  },

  saveTransactions(transactions) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  },

  addTransaction(tx) {
    const list = this.getTransactions();
    if (!tx.id) tx.id = 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    list.unshift(tx);
    this.saveTransactions(list);
    return tx;
  },

  updateTransaction(updatedTx) {
    const list = this.getTransactions();
    const idx = list.findIndex(t => t.id === updatedTx.id);
    if (idx !== -1) {
      list[idx] = updatedTx;
      this.saveTransactions(list);
      return true;
    }
    return false;
  },

  deleteTransaction(id) {
    let list = this.getTransactions();
    list = list.filter(t => t.id !== id);
    this.saveTransactions(list);
    return true;
  },

  // --- Budgets ---
  getBudgets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return data ? { ...DEFAULT_BUDGETS, ...JSON.parse(data) } : { ...DEFAULT_BUDGETS };
    } catch (e) {
      return { ...DEFAULT_BUDGETS };
    }
  },

  saveBudgets(budgets) {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets:', e);
    }
  },

  // --- Net Worth Data ---
  getNetWorthData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NETWORTH);
      return data ? JSON.parse(data) : JSON.parse(JSON.stringify(DEFAULT_NETWORTH));
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_NETWORTH));
    }
  },

  saveNetWorthData(data) {
    try {
      localStorage.setItem(STORAGE_KEYS.NETWORTH, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save net worth data:', e);
    }
  },

  // --- Reset & Sample Data ---
  loadSampleData() {
    const sampleTxs = generateSampleTransactions();
    this.saveTransactions(sampleTxs);
    this.saveBudgets(DEFAULT_BUDGETS);
    this.saveNetWorthData(DEFAULT_NETWORTH);
    return true;
  },

  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
      localStorage.removeItem(STORAGE_KEYS.NETWORTH);
      this.saveTransactions([]);
      this.saveBudgets({});
      this.saveNetWorthData({ assets: [], liabilities: [] });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // --- Backup & Restore (JSON / CSV) ---
  exportAllDataJSON() {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      budgets: this.getBudgets(),
      netWorth: this.getNetWorthData(),
      transactions: this.getTransactions()
    };
    return JSON.stringify(payload, null, 2);
  },

  importAllDataJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.budgets) this.saveBudgets(parsed.budgets);
      if (parsed.netWorth) this.saveNetWorthData(parsed.netWorth);
      if (Array.isArray(parsed.transactions)) this.saveTransactions(parsed.transactions);
      return { success: true, count: parsed.transactions ? parsed.transactions.length : 0 };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  exportTransactionsCSV() {
    const txs = this.getTransactions();
    const headers = ['ID', 'Date', 'Type', 'Category', 'Title', 'Amount', 'Notes'];
    const rows = txs.map(t => [
      `"${t.id || ''}"`,
      `"${t.date || ''}"`,
      `"${t.type || ''}"`,
      `"${t.category || ''}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      Number(t.amount || 0).toFixed(2),
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  }
};

window.Storage = Storage;
window.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
window.CURRENCY_LIST = CURRENCY_LIST;
