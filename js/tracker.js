/**
 * PerFin - Tracker & Budgeting Module
 * Manages transactions, category budgeting, filtering, sorting, and cashflow analytics
 */

const Tracker = {
  currentFilters: {
    period: 'this_month',
    type: 'all',
    category: 'all',
    search: '',
    sortBy: 'date_desc',
    page: 1,
    perPage: 8
  },

  // Get current active date range
  getDateRangeForPeriod(period) {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (period === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'last_30_days') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = now;
    } else if (period === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else {
      // 'all'
      startDate = new Date(2000, 0, 1);
      endDate = new Date(2099, 11, 31);
    }

    return { startDate, endDate };
  },

  // Filter transactions based on active filter state
  getFilteredTransactions() {
    const allTxs = Storage.getTransactions();
    const { startDate, endDate } = this.getDateRangeForPeriod(this.currentFilters.period);
    const q = this.currentFilters.search.trim().toLowerCase();

    return allTxs.filter(tx => {
      // Date filter
      const txDate = new Date(tx.date);
      if (this.currentFilters.period !== 'all') {
        if (txDate < startDate || txDate > endDate) return false;
      }

      // Type filter
      if (this.currentFilters.type !== 'all' && tx.type !== this.currentFilters.type) {
        return false;
      }

      // Category filter
      if (this.currentFilters.category !== 'all' && tx.category !== this.currentFilters.category) {
        return false;
      }

      // Search keyword
      if (q) {
        const titleMatch = (tx.title || '').toLowerCase().includes(q);
        const notesMatch = (tx.notes || '').toLowerCase().includes(q);
        const catMatch = (tx.category || '').toLowerCase().includes(q);
        if (!titleMatch && !notesMatch && !catMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (this.currentFilters.sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
      if (this.currentFilters.sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (this.currentFilters.sortBy === 'amount_desc') return Number(b.amount) - Number(a.amount);
      if (this.currentFilters.sortBy === 'amount_asc') return Number(a.amount) - Number(b.amount);
      return 0;
    });
  },

  // Calculate monthly summary metrics
  getMonthlySummary(year, month) {
    const now = new Date();
    const targetYear = year !== undefined ? year : now.getFullYear();
    const targetMonth = month !== undefined ? month : now.getMonth();

    const start = new Date(targetYear, targetMonth, 1);
    const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const txs = Storage.getTransactions();
    let totalIncome = 0;
    let totalExpenses = 0;

    txs.forEach(tx => {
      const d = new Date(tx.date);
      if (d >= start && d <= end) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income') totalIncome += amt;
        if (tx.type === 'expense') totalExpenses += amt;
      }
    });

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate
    };
  },

  // Calculate category spending breakdown for donut & lists
  getCategoryBreakdown(period = 'this_month') {
    const { startDate, endDate } = this.getDateRangeForPeriod(period);
    const storageObj = window.Storage || Storage;
    const defaultCats = window.DEFAULT_CATEGORIES || (typeof DEFAULT_CATEGORIES !== 'undefined' ? DEFAULT_CATEGORIES : { expense: [], income: [] });
    const txs = storageObj.getTransactions();
    const categoryTotals = {};

    txs.forEach(tx => {
      if (tx.type !== 'expense') return;
      const d = new Date(tx.date);
      if (period !== 'all' && (d < startDate || d > endDate)) return;

      const catId = tx.category || 'misc';
      categoryTotals[catId] = (categoryTotals[catId] || 0) + (Number(tx.amount) || 0);
    });

    const categoriesList = defaultCats.expense || [];
    const result = [];

    Object.keys(categoryTotals).forEach(catId => {
      const catObj = categoriesList.find(c => c.id === catId) || { name: catId, color: '#94a3b8', icon: 'tag' };
      result.push({
        id: catId,
        name: catObj.name,
        color: catObj.color,
        icon: catObj.icon,
        amount: categoryTotals[catId]
      });
    });

    return result.sort((a, b) => b.amount - a.amount);
  },

  // Calculate Budget vs Actual spending
  getBudgetVsActual() {
    const storageObj = window.Storage || Storage;
    const defaultCats = window.DEFAULT_CATEGORIES || (typeof DEFAULT_CATEGORIES !== 'undefined' ? DEFAULT_CATEGORIES : { expense: [], income: [] });
    const budgets = storageObj.getBudgets();
    const thisMonthBreakdown = this.getCategoryBreakdown('this_month');
    const categoriesList = defaultCats.expense || [];

    const result = categoriesList.map(cat => {
      const budgetLimit = budgets[cat.id] || 0;
      const actualObj = thisMonthBreakdown.find(c => c.id === cat.id);
      const actualSpend = actualObj ? actualObj.amount : 0;
      const percentUsed = budgetLimit > 0 ? (actualSpend / budgetLimit) * 100 : 0;
      const remaining = Math.max(0, budgetLimit - actualSpend);
      const isOverBudget = actualSpend > budgetLimit && budgetLimit > 0;

      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        budget: budgetLimit,
        actual: actualSpend,
        percentUsed,
        remaining,
        isOverBudget
      };
    });

    return result;
  },

  // Get historical cashflow data for 6 months
  getHistoricalCashflow(monthsCount = 6) {
    const result = [];
    const now = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const summary = this.getMonthlySummary(d.getFullYear(), d.getMonth());
      const monthLabel = d.toLocaleString('default', { month: 'short' });

      result.push({
        monthLabel,
        year: d.getFullYear(),
        income: summary.totalIncome,
        expense: summary.totalExpenses,
        net: summary.netSavings
      });
    }

    return result;
  },

  // Category name & icon helper
  getCategoryMeta(categoryId, type = 'expense') {
    const defaultCats = window.DEFAULT_CATEGORIES || (typeof DEFAULT_CATEGORIES !== 'undefined' ? DEFAULT_CATEGORIES : { expense: [], income: [] });
    const list = type === 'income' ? defaultCats.income : defaultCats.expense;
    const found = list.find(c => c.id === categoryId);
    return found || { name: categoryId, icon: 'circle', color: '#94a3b8' };
  }
};

window.Tracker = Tracker;
