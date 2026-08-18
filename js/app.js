/**
 * PerFin - Main Application Controller
 * Navigation, Currency Formatting, Modals, Dynamic Calculators & Event Wiring
 */

const App = {
  currentTab: 'dashboard',
  editingTxId: null,

  init() {
    // 1. Initialize Theme & Currency
    const settings = Storage.getSettings();
    this.applyTheme(settings.theme || 'dark');
    this.populateCurrencySelect();

    // 2. Setup Navigation & UI Listeners
    this.setupNavigation();
    this.setupEventListeners();

    // 3. Render Initial Dashboard View
    this.renderActiveTab();

    // 4. Initialize Lucide Icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // =========================================================================
  // Theme & Currency
  // =========================================================================
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('btnThemeToggle');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'light' 
        ? '<i data-lucide="moon"></i>' 
        : '<i data-lucide="sun"></i>';
    }
    const settings = Storage.getSettings();
    settings.theme = theme;
    Storage.saveSettings(settings);

    if (window.lucide) lucide.createIcons();
    if (window.Charts) Charts.updateAllThemes();
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    this.renderActiveTab();
  },

  populateCurrencySelect() {
    const sel = document.getElementById('globalCurrencySelect');
    if (!sel) return;
    sel.innerHTML = '';
    const current = Storage.getSettings().currency || 'USD';

    CURRENCY_LIST.forEach(curr => {
      const opt = document.createElement('option');
      opt.value = curr.code;
      opt.textContent = `${curr.code} (${curr.symbol})`;
      if (curr.code === current) opt.selected = true;
      sel.appendChild(opt);
    });
  },

  setCurrency(code) {
    const found = CURRENCY_LIST.find(c => c.code === code);
    if (!found) return;
    const settings = Storage.getSettings();
    settings.currency = found.code;
    settings.currencySymbol = found.symbol;
    Storage.saveSettings(settings);
    this.showToast(`Currency set to ${found.name}`, 'info');
    this.renderActiveTab();
  },

  formatCurrency(amount, compact = false) {
    const num = Number(amount) || 0;
    const settings = Storage.getSettings();
    const sym = settings.currencySymbol || '$';

    if (compact && Math.abs(num) >= 1000000) {
      return `${sym}${(num / 1000000).toFixed(1)}M`;
    }
    if (compact && Math.abs(num) >= 10000) {
      return `${sym}${(num / 1000).toFixed(0)}k`;
    }

    const formatted = Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return num < 0 ? `-${sym}${formatted}` : `${sym}${formatted}`;
  },

  // =========================================================================
  // Navigation & Tab Switching
  // =========================================================================
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = item.getAttribute('data-tab');
        if (targetTab) {
          this.switchTab(targetTab);
          // Close mobile sidebar if open
          this.toggleSidebar(false);
        }
      });
    });

    // Mobile drawer toggle
    const menuBtn = document.getElementById('mobileMenuBtn');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (menuBtn) menuBtn.addEventListener('click', () => this.toggleSidebar(true));
    if (backdrop) backdrop.addEventListener('click', () => this.toggleSidebar(false));
  },

  toggleSidebar(open) {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('open', open);
  },

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update nav link active states
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-tab') === tabId);
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(el => {
      el.classList.toggle('active', el.id === `tab-${tabId}`);
    });

    // Update page header title
    const headerTitle = document.getElementById('pageHeaderTitle');
    const headerDesc = document.getElementById('pageHeaderDesc');
    const titles = {
      dashboard: { title: 'Financial Dashboard', desc: 'At-a-glance net worth, cashflow, and spending analytics' },
      tracker: { title: 'Income & Expense Tracker', desc: 'Manage transactions, filter spending, and track category budgets' },
      compound: { title: 'Compound Interest Calculator', desc: 'Simulate wealth growth with regular contributions and compounding' },
      loan: { title: 'Loan & Mortgage Amortization', desc: 'Calculate monthly payments, interest savings, and payoff timelines' },
      fire: { title: 'Retirement & FIRE Planner', desc: 'Plan your Financial Independence and calculate your retirement horizon' },
      networth: { title: 'Net Worth & Balance Sheet', desc: 'Track your total assets, liabilities, and debt-to-asset ratio' },
      settings: { title: 'Settings & Data Management', desc: 'Configure preferences, export backups, and manage your data' }
    };

    if (titles[tabId]) {
      if (headerTitle) headerTitle.textContent = titles[tabId].title;
      if (headerDesc) headerDesc.textContent = titles[tabId].desc;
    }

    this.renderActiveTab();
  },

  renderActiveTab() {
    switch (this.currentTab) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'tracker':
        this.renderTracker();
        break;
      case 'compound':
        this.renderCompoundCalculator();
        break;
      case 'loan':
        this.renderLoanCalculator();
        break;
      case 'fire':
        this.renderFireCalculator();
        break;
      case 'networth':
        this.renderNetWorth();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }

    if (window.lucide) lucide.createIcons();
  },

  // =========================================================================
  // 1. Dashboard View
  // =========================================================================
  renderDashboard() {
    const summary = Tracker.getMonthlySummary();
    const netWorthData = Storage.getNetWorthData();
    const nwMetrics = Calculators.calculateNetWorth(netWorthData.assets, netWorthData.liabilities);

    // Update Stat Cards
    const elNetWorth = document.getElementById('dashNetWorthVal');
    const elIncome = document.getElementById('dashIncomeVal');
    const elExpense = document.getElementById('dashExpenseVal');
    const elSavingsRate = document.getElementById('dashSavingsRateVal');

    if (elNetWorth) elNetWorth.textContent = this.formatCurrency(nwMetrics.netWorth);
    if (elIncome) elIncome.textContent = this.formatCurrency(summary.totalIncome);
    if (elExpense) elExpense.textContent = this.formatCurrency(summary.totalExpenses);
    if (elSavingsRate) elSavingsRate.textContent = `${summary.savingsRate.toFixed(1)}%`;

    // Render Charts
    const historical = Tracker.getHistoricalCashflow(6);
    Charts.renderDashboardCashflow('dashCashflowChart', historical);

    const breakdown = Tracker.getCategoryBreakdown('this_month');
    Charts.renderDashboardDonut('dashCategoryDonut', breakdown);

    // Render Recent Transactions
    const recentContainer = document.getElementById('dashRecentTransactionsList');
    if (recentContainer) {
      const allTxs = Storage.getTransactions().slice(0, 5);
      if (allTxs.length === 0) {
        recentContainer.innerHTML = `
          <div class="empty-state">
            <i data-lucide="receipt" class="empty-state-icon"></i>
            <p>No transactions yet. Click "+ Add Transaction" to begin.</p>
          </div>`;
      } else {
        recentContainer.innerHTML = allTxs.map(tx => {
          const cat = Tracker.getCategoryMeta(tx.category, tx.type);
          const isInc = tx.type === 'income';
          return `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div class="stat-icon" style="background: ${isInc ? 'var(--emerald-500-alpha)' : 'var(--rose-500-alpha)'}; color: ${isInc ? 'var(--emerald-400)' : 'var(--rose-400)'};">
                    <i data-lucide="${cat.icon || (isInc ? 'arrow-down-left' : 'arrow-up-right')}"></i>
                  </div>
                  <div>
                    <div style="font-weight: 600;">${tx.title || cat.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${tx.date}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-category">${cat.name}</span></td>
              <td style="text-align: right;">
                <span class="${isInc ? 'amount-income' : 'amount-expense'}">
                  ${isInc ? '+' : '-'}${this.formatCurrency(tx.amount)}
                </span>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Render Budget Highlights
    const budgetListContainer = document.getElementById('dashBudgetOverviewList');
    if (budgetListContainer) {
      const bData = Tracker.getBudgetVsActual().filter(b => b.budget > 0).slice(0, 4);
      if (bData.length === 0) {
        budgetListContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.875rem;">No category budgets set. Configure budgets in the Tracker tab.</p>`;
      } else {
        budgetListContainer.innerHTML = bData.map(b => {
          let barClass = '';
          if (b.percentUsed >= 100) barClass = 'danger';
          else if (b.percentUsed >= 80) barClass = 'warning';

          return `
            <div class="budget-item">
              <div class="budget-header">
                <span class="budget-category-name">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${b.color};"></span>
                  ${b.name}
                </span>
                <span style="font-size: 0.8rem; font-weight: 600; color: ${b.isOverBudget ? 'var(--rose-400)' : 'var(--text-secondary)'}">
                  ${this.formatCurrency(b.actual)} / ${this.formatCurrency(b.budget)}
                </span>
              </div>
              <div class="budget-progress-track">
                <div class="budget-progress-bar ${barClass}" style="width: ${Math.min(100, b.percentUsed)}%;"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  // =========================================================================
  // 2. Tracker & Budget View
  // =========================================================================
  renderTracker() {
    const txs = Tracker.getFilteredTransactions();
    const totalFiltered = txs.length;
    const page = Tracker.currentFilters.page || 1;
    const perPage = Tracker.currentFilters.perPage || 8;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
    const paginatedTxs = txs.slice((page - 1) * perPage, page * perPage);

    // Populate category dropdown filter if empty
    const catSelect = document.getElementById('trackerCategoryFilter');
    if (catSelect && catSelect.children.length <= 1) {
      catSelect.innerHTML = '<option value="all">All Categories</option>';
      DEFAULT_CATEGORIES.expense.forEach(c => {
        catSelect.innerHTML += `<option value="${c.id}">Expense: ${c.name}</option>`;
      });
      DEFAULT_CATEGORIES.income.forEach(c => {
        catSelect.innerHTML += `<option value="${c.id}">Income: ${c.name}</option>`;
      });
    }

    // Render Transactions Table
    const tableBody = document.getElementById('trackerTransactionsTableBody');
    if (tableBody) {
      if (paginatedTxs.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="empty-state">
              <i data-lucide="search-x" class="empty-state-icon"></i>
              <p>No transactions found matching your filter criteria.</p>
            </td>
          </tr>`;
      } else {
        tableBody.innerHTML = paginatedTxs.map(tx => {
          const cat = Tracker.getCategoryMeta(tx.category, tx.type);
          const isInc = tx.type === 'income';
          return `
            <tr>
              <td>${tx.date}</td>
              <td>
                <div style="font-weight: 600;">${tx.title || 'Untitled'}</div>
                ${tx.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${tx.notes}</div>` : ''}
              </td>
              <td>
                <span class="badge ${isInc ? 'badge-income' : 'badge-expense'}">
                  ${isInc ? 'Income' : 'Expense'}
                </span>
              </td>
              <td><span class="badge badge-category">${cat.name}</span></td>
              <td style="font-weight: 700;" class="${isInc ? 'amount-income' : 'amount-expense'}">
                ${isInc ? '+' : '-'}${this.formatCurrency(tx.amount)}
              </td>
              <td style="text-align: right;">
                <button class="btn-icon btn-sm" onclick="App.editTransaction('${tx.id}')" title="Edit">
                  <i data-lucide="edit-3"></i>
                </button>
                <button class="btn-icon btn-sm" onclick="App.deleteTransaction('${tx.id}')" title="Delete" style="color: var(--rose-400);">
                  <i data-lucide="trash-2"></i>
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Render Pagination Controls
    const pageIndicator = document.getElementById('trackerPageIndicator');
    if (pageIndicator) pageIndicator.textContent = `Page ${page} of ${totalPages} (${totalFiltered} items)`;

    const btnPrev = document.getElementById('trackerBtnPrevPage');
    const btnNext = document.getElementById('trackerBtnNextPage');
    if (btnPrev) btnPrev.disabled = page <= 1;
    if (btnNext) btnNext.disabled = page >= totalPages;

    // Render Budget Breakdown Grid
    const budgetGrid = document.getElementById('trackerBudgetGrid');
    if (budgetGrid) {
      const budgetData = Tracker.getBudgetVsActual();
      budgetGrid.innerHTML = budgetData.map(b => {
        let barClass = '';
        if (b.percentUsed >= 100) barClass = 'danger';
        else if (b.percentUsed >= 80) barClass = 'warning';

        return `
          <div class="card" style="padding: 1rem;">
            <div class="budget-header">
              <span class="budget-category-name">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${b.color};"></span>
                ${b.name}
              </span>
              <span style="font-size: 0.75rem; font-weight: 700; color: ${b.isOverBudget ? 'var(--rose-400)' : 'var(--text-muted)'}">
                ${b.percentUsed.toFixed(0)}%
              </span>
            </div>
            <div class="budget-progress-track" style="margin: 0.5rem 0;">
              <div class="budget-progress-bar ${barClass}" style="width: ${Math.min(100, b.percentUsed)}%;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
              <span style="color: var(--text-secondary);">Spent: <strong>${this.formatCurrency(b.actual)}</strong></span>
              <span style="color: var(--text-muted);">Limit: ${this.formatCurrency(b.budget)}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Budget vs Actual Chart
    Charts.renderTrackerBudgetVsActual('trackerBudgetChart', Tracker.getBudgetVsActual());
  },

  // =========================================================================
  // 3. Compound Interest & Investment Calculator View
  // =========================================================================
  renderCompoundCalculator() {
    const initialDeposit = Number(document.getElementById('ciInitialDeposit')?.value || 10000);
    const monthlyContribution = Number(document.getElementById('ciMonthlyContribution')?.value || 500);
    const annualRate = Number(document.getElementById('ciAnnualRate')?.value || 8);
    const years = Number(document.getElementById('ciYears')?.value || 10);
    const compoundFreq = Number(document.getElementById('ciFrequency')?.value || 12);
    const inflationRate = Number(document.getElementById('ciInflationRate')?.value || 2.5);

    const result = Calculators.calculateCompoundInterest({
      initialDeposit,
      monthlyContribution,
      annualRate,
      years,
      compoundFreq,
      inflationRate
    });

    // Update Result UI Cards
    const elFuture = document.getElementById('ciFutureBalance');
    const elPrincipal = document.getElementById('ciTotalPrincipal');
    const elInterest = document.getElementById('ciTotalInterest');
    const elInflationAdj = document.getElementById('ciInflationAdjusted');

    if (elFuture) elFuture.textContent = this.formatCurrency(result.futureBalance);
    if (elPrincipal) elPrincipal.textContent = this.formatCurrency(result.totalPrincipal);
    if (elInterest) elInterest.textContent = this.formatCurrency(result.totalInterest);
    if (elInflationAdj) elInflationAdj.textContent = this.formatCurrency(result.inflationAdjustedBalance);

    // Render Growth Area Chart
    Charts.renderCompoundChart('ciGrowthChart', result.schedule);

    // Render Year-by-Year Table
    const tableBody = document.getElementById('ciScheduleTableBody');
    if (tableBody) {
      tableBody.innerHTML = result.schedule.map(s => `
        <tr>
          <td><strong>Year ${s.year}</strong></td>
          <td>${this.formatCurrency(s.startingBalance)}</td>
          <td>+${this.formatCurrency(s.annualContribution)}</td>
          <td style="color: var(--emerald-400);">+${this.formatCurrency(s.interestEarned)}</td>
          <td style="font-weight: 700;">${this.formatCurrency(s.endingBalance)}</td>
          <td style="color: var(--text-muted);">${this.formatCurrency(s.inflationAdjusted)}</td>
        </tr>
      `).join('');
    }
  },

  // =========================================================================
  // 4. Loan & Mortgage Amortization View
  // =========================================================================
  renderLoanCalculator() {
    const loanAmount = Number(document.getElementById('loanAmount')?.value || 300000);
    const annualRate = Number(document.getElementById('loanInterestRate')?.value || 6.5);
    const loanTermYears = Number(document.getElementById('loanTermYears')?.value || 30);
    const extraMonthly = Number(document.getElementById('loanExtraMonthly')?.value || 0);

    const result = Calculators.calculateLoanAmortization({
      loanAmount,
      annualRate,
      loanTermYears,
      extraMonthlyPayment: extraMonthly
    });

    // Update UI Cards
    const elEMI = document.getElementById('loanMonthlyEMI');
    const elTotalInterest = document.getElementById('loanTotalInterest');
    const elTotalCost = document.getElementById('loanTotalCost');
    const elSavings = document.getElementById('loanInterestSavings');
    const elMonthsSaved = document.getElementById('loanMonthsSaved');

    if (elEMI) elEMI.textContent = this.formatCurrency(result.baseEMI);
    if (elTotalInterest) elTotalInterest.textContent = this.formatCurrency(result.totalInterestPaid);
    if (elTotalCost) elTotalCost.textContent = this.formatCurrency(result.totalActualPayment);
    if (elSavings) elSavings.textContent = this.formatCurrency(result.totalInterestSaved);
    if (elMonthsSaved) {
      const yrs = Math.floor(result.monthsSaved / 12);
      const mos = result.monthsSaved % 12;
      elMonthsSaved.textContent = yrs > 0 ? `${yrs} yrs, ${mos} mos` : `${mos} mos`;
    }

    // Render Trajectory Chart
    Charts.renderLoanChart('loanPayoffChart', result.schedule, result.standardTermMonths, result.standardTotalInterest, loanAmount);

    // Render Amortization Schedule (Summary per Year)
    const tableBody = document.getElementById('loanScheduleTableBody');
    if (tableBody) {
      // Group schedule by year for clean readability
      const yearlyMap = {};
      result.schedule.forEach(s => {
        const yr = Math.ceil(s.month / 12);
        if (!yearlyMap[yr]) {
          yearlyMap[yr] = { year: yr, payment: 0, principal: 0, interest: 0, endingBalance: s.remainingBalance };
        }
        yearlyMap[yr].payment += s.payment;
        yearlyMap[yr].principal += s.principal;
        yearlyMap[yr].interest += s.interest;
        yearlyMap[yr].endingBalance = s.remainingBalance;
      });

      tableBody.innerHTML = Object.values(yearlyMap).map(y => `
        <tr>
          <td><strong>Year ${y.year}</strong></td>
          <td>${this.formatCurrency(y.payment)}</td>
          <td>${this.formatCurrency(y.principal)}</td>
          <td style="color: var(--amber-400);">${this.formatCurrency(y.interest)}</td>
          <td style="font-weight: 700;">${this.formatCurrency(y.endingBalance)}</td>
        </tr>
      `).join('');
    }
  },

  // =========================================================================
  // 5. Retirement & FIRE Planner View
  // =========================================================================
  renderFireCalculator() {
    const currentAge = Number(document.getElementById('fireCurrentAge')?.value || 30);
    const targetAge = Number(document.getElementById('fireTargetAge')?.value || 55);
    const currentSavings = Number(document.getElementById('fireCurrentSavings')?.value || 50000);
    const monthlyPMT = Number(document.getElementById('fireMonthlyContribution')?.value || 1500);
    const annualReturn = Number(document.getElementById('fireAnnualReturn')?.value || 8);
    const inflation = Number(document.getElementById('fireInflation')?.value || 2.5);
    const monthlySpend = Number(document.getElementById('fireMonthlySpend')?.value || 4000);
    const swr = Number(document.getElementById('fireSWR')?.value || 4.0);

    const result = Calculators.calculateFIRE({
      currentAge,
      targetRetirementAge: targetAge,
      currentSavings,
      monthlyContribution: monthlyPMT,
      annualReturn,
      inflationRate: inflation,
      monthlyRetirementSpend: monthlySpend,
      swr
    });

    // Update Result UI
    const elTargetNumber = document.getElementById('fireTargetNumber');
    const elProjected = document.getElementById('fireProjectedAtRetire');
    const elStatus = document.getElementById('fireFeasibilityStatus');
    const elPassive = document.getElementById('fireMonthlyPassive');
    const elFireAge = document.getElementById('fireAchievedAge');

    if (elTargetNumber) elTargetNumber.textContent = this.formatCurrency(result.requiredFIRENumber);
    if (elProjected) elProjected.textContent = this.formatCurrency(result.portfolioAtRetirement);
    if (elPassive) elPassive.textContent = this.formatCurrency(result.monthlyPassiveIncome);
    if (elFireAge) {
      elFireAge.textContent = result.fireAgeAchieved ? `Age ${result.fireAgeAchieved}` : 'Needs Higher Savings';
    }

    if (elStatus) {
      if (result.isFIREFeasible) {
        elStatus.className = 'badge badge-income';
        elStatus.innerHTML = `<i data-lucide="check-circle"></i> Fully Funded (+${this.formatCurrency(result.surplusOrShortfall)})`;
      } else {
        elStatus.className = 'badge badge-expense';
        elStatus.innerHTML = `<i data-lucide="alert-triangle"></i> Shortfall of ${this.formatCurrency(Math.abs(result.surplusOrShortfall))}`;
      }
    }

    // Render Trajectory Chart
    Charts.renderFireChart('fireGrowthChart', result.trajectory, result.requiredFIRENumber);
  },

  // =========================================================================
  // 6. Net Worth View
  // =========================================================================
  renderNetWorth() {
    const data = Storage.getNetWorthData();
    const metrics = Calculators.calculateNetWorth(data.assets, data.liabilities);

    const elTotal = document.getElementById('nwNetWorthVal');
    const elAssets = document.getElementById('nwTotalAssetsVal');
    const elLiabs = document.getElementById('nwTotalLiabilitiesVal');
    const elDebtRatio = document.getElementById('nwDebtRatioVal');

    if (elTotal) elTotal.textContent = this.formatCurrency(metrics.netWorth);
    if (elAssets) elAssets.textContent = this.formatCurrency(metrics.totalAssets);
    if (elLiabs) elLiabs.textContent = this.formatCurrency(metrics.totalLiabilities);
    if (elDebtRatio) elDebtRatio.textContent = `${metrics.debtToAssetRatio.toFixed(1)}%`;

    // Render Assets Table
    const assetBody = document.getElementById('nwAssetsTableBody');
    if (assetBody) {
      assetBody.innerHTML = data.assets.length === 0 
        ? `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">No assets added yet.</td></tr>`
        : data.assets.map(a => `
            <tr>
              <td><strong>${a.name}</strong></td>
              <td><span class="badge badge-category">${a.category || 'Asset'}</span></td>
              <td style="font-weight:700; color: var(--emerald-400);">${this.formatCurrency(a.amount)}</td>
              <td style="text-align:right;">
                <button class="btn-icon btn-sm" onclick="App.deleteNetWorthItem('asset', '${a.id}')" style="color:var(--rose-400);">
                  <i data-lucide="trash-2"></i>
                </button>
              </td>
            </tr>
          `).join('');
    }

    // Render Liabilities Table
    const liabBody = document.getElementById('nwLiabilitiesTableBody');
    if (liabBody) {
      liabBody.innerHTML = data.liabilities.length === 0 
        ? `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">No liabilities added.</td></tr>`
        : data.liabilities.map(l => `
            <tr>
              <td><strong>${l.name}</strong></td>
              <td><span class="badge badge-category">${l.category || 'Debt'}</span></td>
              <td style="font-weight:700; color: var(--rose-400);">${this.formatCurrency(l.amount)}</td>
              <td style="text-align:right;">
                <button class="btn-icon btn-sm" onclick="App.deleteNetWorthItem('liability', '${l.id}')" style="color:var(--rose-400);">
                  <i data-lucide="trash-2"></i>
                </button>
              </td>
            </tr>
          `).join('');
    }

    // Render Asset Allocation Donut
    Charts.renderNetWorthDonut('nwAllocationDonut', metrics.assetCategories);
  },

  // =========================================================================
  // 7. Settings View
  // =========================================================================
  renderSettings() {
    const txs = Storage.getTransactions();
    const countEl = document.getElementById('settingsTxCount');
    if (countEl) countEl.textContent = `${txs.length} recorded`;
  },

  // =========================================================================
  // Modals & Action Handlers
  // =========================================================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  },

  openTransactionModal(txId = null) {
    this.editingTxId = txId;
    const modal = document.getElementById('modalTransaction');
    const title = document.getElementById('modalTxTitle');
    const typeSelect = document.getElementById('txFormType');
    const titleInput = document.getElementById('txFormTitle');
    const amtInput = document.getElementById('txFormAmount');
    const dateInput = document.getElementById('txFormDate');
    const catSelect = document.getElementById('txFormCategory');
    const notesInput = document.getElementById('txFormNotes');

    const updateCategories = () => {
      const selectedType = typeSelect.value;
      const cats = selectedType === 'income' ? DEFAULT_CATEGORIES.income : DEFAULT_CATEGORIES.expense;
      catSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    };

    typeSelect.onchange = updateCategories;

    if (txId) {
      if (title) title.textContent = 'Edit Transaction';
      const allTxs = Storage.getTransactions();
      const tx = allTxs.find(t => t.id === txId);
      if (tx) {
        typeSelect.value = tx.type;
        updateCategories();
        titleInput.value = tx.title || '';
        amtInput.value = tx.amount || '';
        dateInput.value = tx.date || '';
        catSelect.value = tx.category || '';
        notesInput.value = tx.notes || '';
      }
    } else {
      if (title) title.textContent = 'Add New Transaction';
      typeSelect.value = 'expense';
      updateCategories();
      titleInput.value = '';
      amtInput.value = '';
      dateInput.value = new Date().toISOString().split('T')[0];
      notesInput.value = '';
    }

    this.openModal('modalTransaction');
  },

  saveTransactionFromModal(e) {
    e.preventDefault();
    const type = document.getElementById('txFormType').value;
    const title = document.getElementById('txFormTitle').value.trim();
    const amount = parseFloat(document.getElementById('txFormAmount').value);
    const date = document.getElementById('txFormDate').value;
    const category = document.getElementById('txFormCategory').value;
    const notes = document.getElementById('txFormNotes').value.trim();

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    const payload = {
      type,
      title: title || 'Untitled',
      amount,
      date: date || new Date().toISOString().split('T')[0],
      category,
      notes
    };

    if (this.editingTxId) {
      payload.id = this.editingTxId;
      Storage.updateTransaction(payload);
      this.showToast('Transaction updated successfully!', 'success');
    } else {
      Storage.addTransaction(payload);
      this.showToast('Transaction added successfully!', 'success');
    }

    this.closeModal('modalTransaction');
    this.renderActiveTab();
  },

  editTransaction(txId) {
    this.openTransactionModal(txId);
  },

  deleteTransaction(txId) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      Storage.deleteTransaction(txId);
      this.showToast('Transaction deleted', 'info');
      this.renderActiveTab();
    }
  },

  openBudgetModal() {
    const budgets = Storage.getBudgets();
    const container = document.getElementById('budgetModalInputs');
    if (container) {
      container.innerHTML = DEFAULT_CATEGORIES.expense.map(c => `
        <div class="form-group" style="margin-bottom: 0.85rem;">
          <label class="form-label">${c.name}</label>
          <div class="input-group">
            <span class="input-prefix">${Storage.getSettings().currencySymbol || '$'}</span>
            <input type="number" step="10" class="form-control budget-limit-input" data-cat="${c.id}" value="${budgets[c.id] || 0}">
          </div>
        </div>
      `).join('');
    }
    this.openModal('modalBudgets');
  },

  saveBudgetsFromModal() {
    const inputs = document.querySelectorAll('.budget-limit-input');
    const newBudgets = {};
    inputs.forEach(inp => {
      const cat = inp.getAttribute('data-cat');
      const val = parseFloat(inp.value) || 0;
      newBudgets[cat] = Math.max(0, val);
    });
    Storage.saveBudgets(newBudgets);
    this.showToast('Monthly budgets updated!', 'success');
    this.closeModal('modalBudgets');
    this.renderActiveTab();
  },

  openAddNetWorthItemModal(type = 'asset') {
    document.getElementById('nwFormType').value = type;
    document.getElementById('nwFormName').value = '';
    document.getElementById('nwFormAmount').value = '';
    document.getElementById('nwFormCategory').value = type === 'asset' ? 'Equities & ETFs' : 'Loan Debt';
    this.openModal('modalNetWorthItem');
  },

  saveNetWorthItemFromModal(e) {
    e.preventDefault();
    const type = document.getElementById('nwFormType').value;
    const name = document.getElementById('nwFormName').value.trim();
    const amount = parseFloat(document.getElementById('nwFormAmount').value) || 0;
    const category = document.getElementById('nwFormCategory').value.trim();

    if (!name || isNaN(amount) || amount <= 0) {
      alert('Please provide a valid name and amount.');
      return;
    }

    const data = Storage.getNetWorthData();
    const item = {
      id: (type === 'asset' ? 'ast-' : 'lib-') + Date.now(),
      name,
      amount,
      category
    };

    if (type === 'asset') {
      data.assets.push(item);
    } else {
      data.liabilities.push(item);
    }

    Storage.saveNetWorthData(data);
    this.showToast(`${type === 'asset' ? 'Asset' : 'Liability'} added!`, 'success');
    this.closeModal('modalNetWorthItem');
    this.renderActiveTab();
  },

  deleteNetWorthItem(type, id) {
    if (confirm('Delete this item from balance sheet?')) {
      const data = Storage.getNetWorthData();
      if (type === 'asset') {
        data.assets = data.assets.filter(a => a.id !== id);
      } else {
        data.liabilities = data.liabilities.filter(l => l.id !== id);
      }
      Storage.saveNetWorthData(data);
      this.showToast('Item deleted', 'info');
      this.renderActiveTab();
    }
  },

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'check-circle';
    if (type === 'danger') iconName = 'alert-circle';
    if (type === 'info') iconName = 'info';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================
  setupEventListeners() {
    // Theme toggle button
    const themeBtn = document.getElementById('btnThemeToggle');
    if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

    // Currency selector
    const currSelect = document.getElementById('globalCurrencySelect');
    if (currSelect) currSelect.addEventListener('change', (e) => this.setCurrency(e.target.value));

    // Tracker Filter Controls
    const periodSegs = document.querySelectorAll('[data-filter-period]');
    periodSegs.forEach(btn => {
      btn.addEventListener('click', () => {
        periodSegs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Tracker.currentFilters.period = btn.getAttribute('data-filter-period');
        Tracker.currentFilters.page = 1;
        this.renderTracker();
      });
    });

    const typeSegs = document.querySelectorAll('[data-filter-type]');
    typeSegs.forEach(btn => {
      btn.addEventListener('click', () => {
        typeSegs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Tracker.currentFilters.type = btn.getAttribute('data-filter-type');
        Tracker.currentFilters.page = 1;
        this.renderTracker();
      });
    });

    const catFilter = document.getElementById('trackerCategoryFilter');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        Tracker.currentFilters.category = e.target.value;
        Tracker.currentFilters.page = 1;
        this.renderTracker();
      });
    }

    const searchInput = document.getElementById('trackerSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        Tracker.currentFilters.search = e.target.value;
        Tracker.currentFilters.page = 1;
        this.renderTracker();
      });
    }

    // Tracker Pagination Buttons
    const btnPrev = document.getElementById('trackerBtnPrevPage');
    const btnNext = document.getElementById('trackerBtnNextPage');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (Tracker.currentFilters.page > 1) {
          Tracker.currentFilters.page--;
          this.renderTracker();
        }
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        Tracker.currentFilters.page++;
        this.renderTracker();
      });
    }

    // Modal Form Submits
    const txForm = document.getElementById('formTransaction');
    if (txForm) txForm.addEventListener('submit', (e) => this.saveTransactionFromModal(e));

    const nwForm = document.getElementById('formNetWorthItem');
    if (nwForm) nwForm.addEventListener('submit', (e) => this.saveNetWorthItemFromModal(e));

    // Live Sync Calculator Inputs & Sliders
    this.wireCalculatorSync('ciInitialDeposit', 'ciInitialDepositSlider');
    this.wireCalculatorSync('ciMonthlyContribution', 'ciMonthlyContributionSlider');
    this.wireCalculatorSync('ciAnnualRate', 'ciAnnualRateSlider');
    this.wireCalculatorSync('ciYears', 'ciYearsSlider');
    this.wireCalculatorSync('ciInflationRate', 'ciInflationRateSlider');

    ['ciInitialDeposit', 'ciMonthlyContribution', 'ciAnnualRate', 'ciYears', 'ciFrequency', 'ciInflationRate']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => this.renderCompoundCalculator());
      });

    this.wireCalculatorSync('loanAmount', 'loanAmountSlider');
    this.wireCalculatorSync('loanInterestRate', 'loanInterestRateSlider');
    this.wireCalculatorSync('loanTermYears', 'loanTermYearsSlider');
    this.wireCalculatorSync('loanExtraMonthly', 'loanExtraMonthlySlider');

    ['loanAmount', 'loanInterestRate', 'loanTermYears', 'loanExtraMonthly']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => this.renderLoanCalculator());
      });

    this.wireCalculatorSync('fireCurrentAge', 'fireCurrentAgeSlider');
    this.wireCalculatorSync('fireTargetAge', 'fireTargetAgeSlider');
    this.wireCalculatorSync('fireCurrentSavings', 'fireCurrentSavingsSlider');
    this.wireCalculatorSync('fireMonthlyContribution', 'fireMonthlyContributionSlider');
    this.wireCalculatorSync('fireAnnualReturn', 'fireAnnualReturnSlider');
    this.wireCalculatorSync('fireMonthlySpend', 'fireMonthlySpendSlider');
    this.wireCalculatorSync('fireSWR', 'fireSWRSlider');

    ['fireCurrentAge', 'fireTargetAge', 'fireCurrentSavings', 'fireMonthlyContribution', 'fireAnnualReturn', 'fireInflation', 'fireMonthlySpend', 'fireSWR']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => this.renderFireCalculator());
      });
  },

  wireCalculatorSync(inputId, sliderId) {
    const inp = document.getElementById(inputId);
    const sld = document.getElementById(sliderId);
    if (!inp || !sld) return;

    inp.addEventListener('input', () => {
      sld.value = inp.value;
    });

    sld.addEventListener('input', () => {
      inp.value = sld.value;
    });
  },

  // =========================================================================
  // Data Export & Import Handlers
  // =========================================================================
  exportJSON() {
    const jsonStr = Storage.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perfin_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('JSON Backup downloaded!', 'success');
  },

  exportCSV() {
    const csvStr = Storage.exportTransactionsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perfin_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('CSV export downloaded!', 'success');
  },

  importJSONFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const res = Storage.importAllDataJSON(e.target.result);
      if (res.success) {
        this.showToast(`Imported ${res.count} transactions successfully!`, 'success');
        this.renderActiveTab();
      } else {
        alert('Failed to import JSON: ' + res.error);
      }
    };
    reader.readAsText(file);
  },

  loadDemoData() {
    if (confirm('Load realistic sample demo financial data? This will overwrite existing records.')) {
      Storage.loadSampleData();
      this.showToast('Sample financial data loaded!', 'success');
      this.renderActiveTab();
    }
  },

  resetAllData() {
    if (confirm('⚠️ Are you sure you want to erase all data? This cannot be undone.')) {
      Storage.clearAllData();
      this.showToast('All data cleared.', 'info');
      this.renderActiveTab();
    }
  }
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
