/**
 * PerFin - Chart.js Visualizations & Theme Manager
 * High-performance, reactive charts with custom glowing gradients & tooltips
 */

const Charts = {
  instances: {},

  // Get dynamic colors based on active theme
  getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
      isDark,
      text: isDark ? '#94a3b8' : '#475569',
      grid: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
      tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      tooltipText: isDark ? '#f8fafc' : '#0f172a',
      tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      primary: '#6366f1',
      emerald: '#10b981',
      rose: '#f43f5e',
      amber: '#f59e0b',
      purple: '#a855f7',
      sky: '#0ea5e9'
    };
  },

  destroyChart(key) {
    if (this.instances[key]) {
      this.instances[key].destroy();
      delete this.instances[key];
    }
  },

  // =========================================================================
  // 1. Dashboard: Cashflow Trend Chart
  // =========================================================================
  renderDashboardCashflow(canvasId, monthlyData) {
    this.destroyChart('dashboardCashflow');
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const tc = this.getThemeColors();
    const labels = monthlyData.map(d => d.monthLabel);
    const incomeData = monthlyData.map(d => d.income);
    const expenseData = monthlyData.map(d => d.expense);

    this.instances['dashboardCashflow'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(16, 185, 129, 0.75)',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: 'rgba(244, 63, 94, 0.75)',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: tc.text, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          tooltip: {
            backgroundColor: tc.tooltipBg,
            titleColor: tc.tooltipText,
            bodyColor: tc.tooltipText,
            borderColor: tc.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (item) => `${item.dataset.label}: ${window.App ? window.App.formatCurrency(item.raw) : '$' + item.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tc.text, font: { family: 'Plus Jakarta Sans' } }
          },
          y: {
            grid: { color: tc.grid },
            ticks: {
              color: tc.text,
              font: { family: 'Plus Jakarta Sans' },
              callback: (val) => window.App ? window.App.formatCurrency(val, true) : '$' + val
            }
          }
        }
      }
    });
  },

  // =========================================================================
  // 2. Dashboard: Category Expense Donut Chart
  // =========================================================================
  renderDashboardDonut(canvasId, categoryBreakdown) {
    this.destroyChart('dashboardDonut');
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const tc = this.getThemeColors();
    const labels = categoryBreakdown.map(c => c.name);
    const data = categoryBreakdown.map(c => c.amount);
    const colors = categoryBreakdown.map(c => c.color || tc.primary);

    if (data.length === 0) {
      labels.push('No Expenses Recorded');
      data.push(1);
      colors.push(tc.isDark ? '#334155' : '#e2e8f0');
    }

    this.instances['dashboardDonut'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: tc.isDark ? '#0f172a' : '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: tc.text,
              font: { family: 'Plus Jakarta Sans', size: 12 },
              boxWidth: 12,
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: tc.tooltipBg,
            titleColor: tc.tooltipText,
            bodyColor: tc.tooltipText,
            borderColor: tc.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: (item) => ` ${item.label}: ${window.App ? window.App.formatCurrency(item.raw) : '$' + item.raw}`
            }
          }
        }
      }
    });
  },

  // =========================================================================
  // 3. Tracker: Budget vs Actual Bar Chart
  // =========================================================================
  renderTrackerBudgetVsActual(canvasId, budgetVsActualData) {
    this.destroyChart('trackerBudgetVsActual');
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const tc = this.getThemeColors();
    const labels = budgetVsActualData.map(b => b.name);
    const actuals = budgetVsActualData.map(b => b.actual);
    const budgets = budgetVsActualData.map(b => b.budget);

    this.instances['trackerBudgetVsActual'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual Spent',
            data: actuals,
            backgroundColor: 'rgba(244, 63, 94, 0.8)',
            borderRadius: 4
          },
          {
            label: 'Budget Limit',
            data: budgets,
            backgroundColor: 'rgba(99, 102, 241, 0.4)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: tc.text, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          tooltip: {
            backgroundColor: tc.tooltipBg,
            titleColor: tc.tooltipText,
            bodyColor: tc.tooltipText,
            borderColor: tc.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: (item) => `${item.dataset.label}: ${window.App ? window.App.formatCurrency(item.raw) : '$' + item.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tc.text, font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          y: {
            grid: { color: tc.grid },
            ticks: {
              color: tc.text,
              callback: (val) => window.App ? window.App.formatCurrency(val, true) : '$' + val
            }
          }
        }
      }
    });
  },

  // =========================================================================
  // 4. Calculator: Compound Interest Growth Curve
  // =========================================================================
  renderCompoundChart(canvasId, schedule) {
    this.destroyChart('calcCompound');
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const tc = this.getThemeColors();
    const labels = schedule.map(s => `Yr ${s.year}`);
    const principalData = schedule.map(s => s.totalPrincipal);
    const interestData = schedule.map(s => s.totalInterest);
    const totalData = schedule.map(s => s.endingBalance);

    this.instances['calcCompound'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Balance',
            data: totalData,
            borderColor: tc.emerald,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'Principal Invested',
            data: principalData,
            borderColor: tc.primary,
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointRadius: 2,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: tc.text, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          tooltip: {
            backgroundColor: tc.tooltipBg,
            titleColor: tc.tooltipText,
            bodyColor: tc.tooltipText,
            borderColor: tc.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: (item) => `${item.dataset.label}: ${window.App ? window.App.formatCurrency(item.raw) : '$' + item.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tc.text }
          },
          y: {
            grid: { color: tc.grid },
            ticks: {
              color: tc.text,
              callback: (val) => window.App ? window.App.formatCurrency(val, true) : '$' + val
            }
          }
        }
      }
    });
  },

  // =========================================================================
  // 5. Calculator: Loan Balance Payoff Trajectory
  // =========================================================================
  renderLoanChart(canvasId, schedule, totalMonths, standardTotalPayment, initialLoan) {
    this.destroyChart('calcLoan');
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const tc = this.getThemeColors();
    // Downsample for smoother rendering if many months
    const step = Math.max(1, Math.floor(schedule.length / 30));
    const sampledSchedule = schedule.filter((_, idx) => idx % step === 0 || idx === schedule.length - 1);

    const labels = sampledSchedule.map(s => `Mo ${s.month}`);
    const balances = sampledSchedule.map(s => s.remainingBalance);
    const interestPaid = sampledSchedule.map(s => s.totalInterestToDate);

    this.instances['calcLoan'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Remaining Principal',
            data: balances,
            borderColor: tc.rose,
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            fill: true,
            tension: 0.2,
            borderWidth: 2.5
          },
          {
            label: 'Cumulative Interest Paid',
            data: interestPaid,
            borderColor: tc.amber,
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.2,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: tc.text, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          tooltip: {
            backgroundColor: tc.tooltipBg,
            titleColor: tc.tooltipText,
            bodyColor: tc.tooltipText,
            borderColor: tc.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: (item) => `${item.dataset.label}: ${window.App ? window.App.formatCurrency(item.raw) : '$' + item.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tc.text }
          },
          y: {
            grid: { color: tc.grid },
            ticks: {
              color: tc.text,
              callback: (val) => window.App ? window.App.formatCurrency(val, true) : '$' + val
            }
          }
        }
      }
    });
  },

  // =========================================================================
  // 6. Calculator: FIRE & Retirement Wealth Curve
  // =========================================================================
  renderFireChart(canvasId, trajectory, requiredFIRENumber) {
    this.destroyChart('calcFire');
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const tc = this.getThemeColors();
    const labels = trajectory.map(t => `Age ${t.age}`);
    const balances = trajectory.map(t => t.balance);
    const fireTargetLine = trajectory.map(() => requiredFIRENumber);

    this.instances['calcFire'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Projected Net Portfolio',
            data: balances,
            borderColor: tc.emerald,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 3
          },
          {
            label: 'FIRE Target Number',
            data: fireTargetLine,
            borderColor: tc.purple,
            backgroundColor: 'transparent',
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: tc.text, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          tooltip: {
            backgroundColor: tc.tooltipBg,
            titleColor: tc.tooltipText,
            bodyColor: tc.tooltipText,
            borderColor: tc.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: (item) => `${item.dataset.label}: ${window.App ? window.App.formatCurrency(item.raw) : '$' + item.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tc.text }
          },
          y: {
            grid: { color: tc.grid },
            ticks: {
              color: tc.text,
              callback: (val) => window.App ? window.App.formatCurrency(val, true) : '$' + val
            }
          }
        }
      }
    });
  },

  // =========================================================================
  // 7. Net Worth: Asset Allocation Donut
  // =========================================================================
  renderNetWorthDonut(canvasId, assetCategories) {
    this.destroyChart('netWorthDonut');
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const tc = this.getThemeColors();
    const labels = Object.keys(assetCategories);
    const data = Object.values(assetCategories);
    const palette = [tc.emerald, tc.primary, tc.purple, tc.sky, tc.amber, '#ec4899', '#14b8a6'];

    this.instances['netWorthDonut'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: palette.slice(0, labels.length),
          borderWidth: 2,
          borderColor: tc.isDark ? '#0f172a' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: tc.text, font: { family: 'Plus Jakarta Sans', size: 12 }, padding: 12 }
          },
          tooltip: {
            backgroundColor: tc.tooltipBg,
            titleColor: tc.tooltipText,
            bodyColor: tc.tooltipText,
            borderColor: tc.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: (item) => ` ${item.label}: ${window.App ? window.App.formatCurrency(item.raw) : '$' + item.raw}`
            }
          }
        }
      }
    });
  },

  // Trigger re-render of all active charts on theme toggle
  updateAllThemes() {
    Object.keys(this.instances).forEach(key => {
      if (this.instances[key]) {
        // Redraw or refresh
        this.instances[key].update();
      }
    });
  }
};

window.Charts = Charts;
