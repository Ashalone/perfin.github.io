/**
 * PerFin - Financial Calculator Algorithms Engine
 * Compound Interest, Loan Amortization, FIRE Planner & Net Worth Math
 */

const Calculators = {
  // =========================================================================
  // 1. Compound Interest & Investment Growth
  // =========================================================================
  calculateCompoundInterest({
    initialDeposit = 10000,
    monthlyContribution = 500,
    annualRate = 8, // in %
    years = 10,
    compoundFreq = 12, // 1=annual, 4=quarterly, 12=monthly, 365=daily
    inflationRate = 2.5 // in %
  }) {
    const P = Math.max(0, Number(initialDeposit));
    const PMT = Math.max(0, Number(monthlyContribution));
    const r = Math.max(0, Number(annualRate)) / 100;
    const t = Math.max(1, Number(years));
    const n = Number(compoundFreq) || 12;
    const inf = Math.max(0, Number(inflationRate)) / 100;

    let balance = P;
    let totalDeposits = P;
    const schedule = [];

    // Monthly iterative simulation for precision
    const totalMonths = t * 12;
    const monthlyRate = Math.pow(1 + r / n, n / 12) - 1; // effective monthly yield

    for (let year = 1; year <= t; year++) {
      const startingBalance = balance;
      let yearlyInterest = 0;
      let yearlyDeposits = 0;

      for (let month = 1; month <= 12; month++) {
        // Add monthly contribution at beginning of month
        balance += PMT;
        yearlyDeposits += PMT;
        totalDeposits += PMT;

        // Compound interest on month's balance
        const interestThisMonth = balance * monthlyRate;
        balance += interestThisMonth;
        yearlyInterest += interestThisMonth;
      }

      // Inflation adjustment factor
      const inflationFactor = Math.pow(1 + inf, year);
      const inflationAdjusted = balance / inflationFactor;

      schedule.push({
        year,
        startingBalance,
        annualContribution: yearlyDeposits,
        interestEarned: yearlyInterest,
        endingBalance: balance,
        totalPrincipal: totalDeposits,
        totalInterest: balance - totalDeposits,
        inflationAdjusted
      });
    }

    const futureBalance = balance;
    const totalInterest = Math.max(0, futureBalance - totalDeposits);
    const inflationAdjustedBalance = futureBalance / Math.pow(1 + inf, t);

    return {
      futureBalance,
      totalPrincipal: totalDeposits,
      totalInterest,
      inflationAdjustedBalance,
      schedule
    };
  },

  // =========================================================================
  // 2. Loan & Mortgage Amortization
  // =========================================================================
  calculateLoanAmortization({
    loanAmount = 300000,
    annualRate = 6.5, // in %
    loanTermYears = 30,
    extraMonthlyPayment = 0,
    startDate = new Date()
  }) {
    const P = Math.max(0, Number(loanAmount));
    const annualR = Math.max(0, Number(annualRate)) / 100;
    const totalMonths = Math.max(1, Number(loanTermYears) * 12);
    const extra = Math.max(0, Number(extraMonthlyPayment));

    const monthlyRate = annualR / 12;

    // Standard Monthly EMI calculation: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    let baseEMI = 0;
    if (monthlyRate === 0) {
      baseEMI = P / totalMonths;
    } else {
      baseEMI = (P * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    // Standard baseline (without extra payments)
    const standardTotalPayment = baseEMI * totalMonths;
    const standardTotalInterest = standardTotalPayment - P;

    // Simulate accelerated amortization month-by-month
    let balance = P;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    const schedule = [];
    let currentMonth = 0;
    let currDate = new Date(startDate);

    while (balance > 0.001 && currentMonth < totalMonths * 2) {
      currentMonth++;
      currDate.setMonth(currDate.getMonth() + 1);

      const interestForMonth = balance * monthlyRate;
      let totalPaymentThisMonth = baseEMI + extra;
      
      // If payment exceeds remaining balance + interest, cap it
      if (balance + interestForMonth < totalPaymentThisMonth) {
        totalPaymentThisMonth = balance + interestForMonth;
      }

      let principalForMonth = totalPaymentThisMonth - interestForMonth;
      if (principalForMonth > balance) {
        principalForMonth = balance;
      }

      balance = Math.max(0, balance - principalForMonth);
      totalInterestPaid += interestForMonth;
      totalPrincipalPaid += principalForMonth;

      schedule.push({
        month: currentMonth,
        date: currDate.toISOString().split('T')[0],
        payment: totalPaymentThisMonth,
        principal: principalForMonth,
        interest: interestForMonth,
        totalInterestToDate: totalInterestPaid,
        remainingBalance: balance
      });
    }

    const actualPayoffMonths = schedule.length;
    const monthsSaved = Math.max(0, totalMonths - actualPayoffMonths);
    const totalInterestSaved = Math.max(0, standardTotalInterest - totalInterestPaid);
    const totalActualCost = totalPrincipalPaid + totalInterestPaid;

    return {
      baseEMI,
      totalActualPayment: totalActualCost,
      totalInterestPaid,
      standardTotalInterest,
      totalInterestSaved,
      monthsSaved,
      actualPayoffMonths,
      standardTermMonths: totalMonths,
      payoffDate: schedule.length > 0 ? schedule[schedule.length - 1].date : '',
      schedule
    };
  },

  // =========================================================================
  // 3. Retirement & FIRE Planner
  // =========================================================================
  calculateFIRE({
    currentAge = 30,
    targetRetirementAge = 55,
    currentSavings = 40000,
    monthlyContribution = 1200,
    annualReturn = 8, // in %
    inflationRate = 2.5, // in %
    monthlyRetirementSpend = 3500, // in today's dollars
    swr = 4.0, // Safe Withdrawal Rate % (4% rule)
    lifeExpectancy = 90
  }) {
    const ageNow = Math.max(18, Number(currentAge));
    let retireAge = Math.max(ageNow + 1, Number(targetRetirementAge));
    const initial = Math.max(0, Number(currentSavings));
    const monthlyPMT = Math.max(0, Number(monthlyContribution));
    const rNominal = Math.max(0, Number(annualReturn)) / 100;
    const inf = Math.max(0, Number(inflationRate)) / 100;
    const realRate = (1 + rNominal) / (1 + inf) - 1; // Real return rate
    const monthlySpendToday = Math.max(0, Number(monthlyRetirementSpend));
    const safeWithdrawal = Math.max(1, Number(swr)) / 100;

    // Required FIRE Number in today's purchasing power
    const annualExpensesToday = monthlySpendToday * 12;
    const requiredFIRENumber = safeWithdrawal > 0 ? annualExpensesToday / safeWithdrawal : 0;

    // Yearly timeline simulation from current age to life expectancy
    let balance = initial;
    const trajectory = [];
    let fireAgeAchieved = null;

    const maxAge = Math.max(retireAge + 10, Number(lifeExpectancy));

    for (let age = ageNow; age <= maxAge; age++) {
      const yearIndex = age - ageNow;
      const isRetirePhase = age >= retireAge;

      let annualDeposit = 0;
      let annualWithdrawal = 0;
      let investmentGrowth = 0;

      if (!isRetirePhase) {
        // Accumulation Phase
        annualDeposit = monthlyPMT * 12;
        investmentGrowth = balance * realRate + annualDeposit * (realRate / 2);
        balance += annualDeposit + investmentGrowth;

        // Check if FIRE number reached early
        if (balance >= requiredFIRENumber && fireAgeAchieved === null) {
          fireAgeAchieved = age;
        }
      } else {
        // Decumulation Phase (Retirement)
        annualWithdrawal = annualExpensesToday;
        investmentGrowth = (balance - annualWithdrawal / 2) * (realRate * 0.75); // More conservative mix in retirement
        balance = Math.max(0, balance - annualWithdrawal + investmentGrowth);
      }

      trajectory.push({
        age,
        year: new Date().getFullYear() + yearIndex,
        phase: isRetirePhase ? 'Retirement' : 'Accumulation',
        balance: Math.max(0, balance),
        annualDeposit,
        annualWithdrawal,
        investmentGrowth: Math.max(0, investmentGrowth),
        fireTarget: requiredFIRENumber
      });
    }

    const portfolioAtRetirement = trajectory.find(t => t.age === retireAge)?.balance || 0;
    const isFIREFeasible = portfolioAtRetirement >= requiredFIRENumber;
    const monthlyPassiveIncome = (portfolioAtRetirement * safeWithdrawal) / 12;

    return {
      requiredFIRENumber,
      portfolioAtRetirement,
      surplusOrShortfall: portfolioAtRetirement - requiredFIRENumber,
      isFIREFeasible,
      fireAgeAchieved: fireAgeAchieved || (isFIREFeasible ? retireAge : null),
      monthlyPassiveIncome,
      annualExpensesToday,
      trajectory
    };
  },

  // =========================================================================
  // 4. Net Worth Balance Sheet Metrics
  // =========================================================================
  calculateNetWorth(assets = [], liabilities = []) {
    const totalAssets = assets.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    // Group assets by category
    const assetCategories = {};
    assets.forEach(a => {
      const cat = a.category || 'Other';
      assetCategories[cat] = (assetCategories[cat] || 0) + Number(a.amount || 0);
    });

    // Group liabilities by category
    const liabilityCategories = {};
    liabilities.forEach(l => {
      const cat = l.category || 'Other Debt';
      liabilityCategories[cat] = (liabilityCategories[cat] || 0) + Number(l.amount || 0);
    });

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      debtToAssetRatio,
      assetCategories,
      liabilityCategories
    };
  }
};

window.Calculators = Calculators;
