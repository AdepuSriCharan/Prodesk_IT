(function () {
  var STORAGE_KEY = "sprint02";

  var state = {
    salary: 0,
    expenses: [],
    currency: "INR",
    exchangeRate: 1,
    chart: null
  };

  var salaryForm = document.getElementById("salary-form");
  var expenseForm = document.getElementById("expense-form");
  var salaryInput = document.getElementById("salary-input");
  var expenseNameInput = document.getElementById("expense-name");
  var expenseAmountInput = document.getElementById("expense-amount");
  var errorPopup = document.getElementById("error-popup");
  var errorPopupMessage = document.getElementById("error-popup-message");
  var errorPopupClose = document.getElementById("error-popup-close");
  var salaryDisplay = document.getElementById("salary-display");
  var expenseDisplay = document.getElementById("expense-display");
  var balanceDisplay = document.getElementById("balance-display");
  var expenseList = document.getElementById("expense-list");
  var emptyState = document.getElementById("empty-state");
  var chartCanvas = document.getElementById("expense-chart");
  var alertBanner = document.getElementById("alert-banner");
  var currencyINRButton = document.getElementById("currency-inr");
  var currencyUSDButton = document.getElementById("currency-usd");
  var downloadReportButton = document.getElementById("download-report");
  var clearSalaryButton = document.getElementById("clear-salary");
  var errorTimeoutId = null;

  function toNumber(value) {
    return Number.parseFloat(value);
  }

  function totalExpenses() {
    return state.expenses.reduce(function (sum, item) {
      return sum + item.amount;
    }, 0);
  }

  function remainingBalance() {
    return state.salary - totalExpenses();
  }

  function showError(message) {
    if (errorTimeoutId) {
      clearTimeout(errorTimeoutId);
      errorTimeoutId = null;
    }

    errorPopupMessage.textContent = message;
    errorPopup.classList.remove("hidden");

    errorTimeoutId = setTimeout(function () {
      clearError();
    }, 5000);
  }

  function clearError() {
    if (errorTimeoutId) {
      clearTimeout(errorTimeoutId);
      errorTimeoutId = null;
    }
    errorPopupMessage.textContent = "";
    errorPopup.classList.add("hidden");
  }

  function formatCurrency(amount) {
    var value = amount * state.exchangeRate;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: state.currency,
      maximumFractionDigits: 2
    }).format(value);
  }

  function saveState() {
    var payload = {
      salary: state.salary,
      expenses: state.expenses,
      currency: state.currency
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function resetState() {
    state.salary = 0;
    state.expenses = [];
    state.currency = "INR";
    state.exchangeRate = 1;
    localStorage.removeItem(STORAGE_KEY);
    clearError();
    updateCurrencyButtons();
    renderAll();
    salaryForm.reset();
    expenseForm.reset();
  }

  function loadState() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      var parsed = JSON.parse(raw);
      state.salary = Number(parsed.salary) || 0;
      state.expenses = Array.isArray(parsed.expenses)
        ? parsed.expenses.map(function (item) {
            return {
              id: String(item.id),
              name: String(item.name),
              amount: Number(item.amount) || 0
            };
          })
        : [];
      state.currency = parsed.currency === "USD" ? "USD" : "INR";
    } catch (error) {
      console.error("Failed to parse localStorage state", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function renderExpenseList() {
    expenseList.innerHTML = "";

    if (state.expenses.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    state.expenses.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "expense-item";

      var left = document.createElement("div");
      left.innerHTML =
        "<p class='font-semibold'>" + item.name + "</p>" +
        "<p class='text-sm text-slate-600'>" + formatCurrency(item.amount) + "</p>";

      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "delete-btn";
      delBtn.textContent = "Delete";
      delBtn.setAttribute("data-id", item.id);

      li.appendChild(left);
      li.appendChild(delBtn);
      expenseList.appendChild(li);
    });
  }

  function renderSummary() {
    var salary = state.salary;
    var expenses = totalExpenses();
    var balance = remainingBalance();

    salaryDisplay.textContent = formatCurrency(salary);
    expenseDisplay.textContent = formatCurrency(expenses);
    balanceDisplay.textContent = formatCurrency(balance);

    var isCritical = salary > 0 && balance < salary * 0.1;
    balanceDisplay.classList.toggle("critical", isCritical);
    alertBanner.classList.toggle("hidden", !isCritical);
  }

  function renderChart() {
    var expenses = totalExpenses();
    var balance = Math.max(remainingBalance(), 0);

    if (state.chart) {
      state.chart.destroy();
    }

    state.chart = new Chart(chartCanvas, {
      type: "pie",
      data: {
        labels: ["Total Expenses", "Remaining Balance"],
        datasets: [
          {
            data: [expenses, balance],
            backgroundColor: ["#ef4444", "#22c55e"]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }

  function renderAll() {
    renderSummary();
    renderExpenseList();
    renderChart();
  }

  function setSalary(event) {
    event.preventDefault();
    clearError();

    var salaryValue = toNumber(salaryInput.value);

    if (Number.isNaN(salaryValue) || salaryValue <= 0) {
      showError("Please enter a valid positive salary amount.");
      return;
    }

    state.salary = salaryValue;
    saveState();
    renderAll();
    salaryForm.reset();
  }

  function addExpense(event) {
    event.preventDefault();
    clearError();

    if (state.salary <= 0) {
      showError("Please set your salary first before adding expenses.");
      return;
    }

    var name = expenseNameInput.value.trim();
    var amount = toNumber(expenseAmountInput.value);

    if (!name) {
      showError("Expense name is required.");
      return;
    }

    if (Number.isNaN(amount) || amount <= 0) {
      showError("Please enter a valid positive expense amount.");
      return;
    }

    state.expenses.push({
      id: String(Date.now()) + "_" + String(Math.floor(Math.random() * 100000)),
      name: name,
      amount: amount
    });

    saveState();
    renderAll();
    expenseForm.reset();
  }

  function deleteExpense(event) {
    var id = event.target.getAttribute("data-id");
    if (!id) return;

    state.expenses = state.expenses.filter(function (item) {
      return item.id !== id;
    });

    saveState();
    renderAll();
  }

  function updateCurrencyButtons() {
    currencyINRButton.classList.toggle("btn-primary", state.currency === "INR");
    currencyINRButton.classList.toggle("btn-secondary", state.currency !== "INR");
    currencyUSDButton.classList.toggle("btn-primary", state.currency === "USD");
    currencyUSDButton.classList.toggle("btn-secondary", state.currency !== "USD");
  }

  function setCurrency(currencyCode) {
    clearError();

    if (currencyCode === "INR") {
      state.currency = "INR";
      state.exchangeRate = 1;
      saveState();
      updateCurrencyButtons();
      renderAll();
      return;
    }

    fetchInrToUsdRate()
      .then(function (rate) {
        state.currency = "USD";
        state.exchangeRate = rate;
        saveState();
        updateCurrencyButtons();
        renderAll();
      })
      .catch(function () {
        state.currency = "INR";
        state.exchangeRate = 1;
        updateCurrencyButtons();
        renderAll();
        showError("USD conversion failed due to API/network issue. Switched back to INR.");
      });
  }

  function downloadReport() {
    clearError();

    if (!window.jspdf || !window.jspdf.jsPDF) {
      showError("PDF library failed to load.");
      return;
    }

    var doc = new window.jspdf.jsPDF();
    var expenses = totalExpenses();
    var balance = remainingBalance();

    doc.setFontSize(16);
    doc.text("Cash-Flow Report", 14, 18);
    doc.setFontSize(11);
    doc.text("Total Salary: " + formatCurrency(state.salary), 14, 30);
    doc.text("Total Expenses: " + formatCurrency(expenses), 14, 38);
    doc.text("Remaining Balance: " + formatCurrency(balance), 14, 46);

    var y = 60;
    doc.text("Expense Entries:", 14, y);
    y += 8;

    if (state.expenses.length === 0) {
      doc.text("No expenses recorded.", 14, y);
    } else {
      state.expenses.forEach(function (item, index) {
        doc.text(
          String(index + 1) + ". " + item.name + " - " + formatCurrency(item.amount),
          14,
          y
        );
        y += 8;
      });
    }

    doc.save("cash-flow-report.pdf");
  }

  function restoreCurrencyRateIfNeeded() {
    if (state.currency === "USD") {
      fetchInrToUsdRate()
        .then(function (rate) {
          state.exchangeRate = rate;
          renderAll();
        })
        .catch(function () {
          state.currency = "INR";
          state.exchangeRate = 1;
          updateCurrencyButtons();
          saveState();
          renderAll();
        });
    }
  }

  function fetchInrToUsdRate() {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, 8000);

    return fetch("https://open.er-api.com/v6/latest/INR", {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    })
      .then(function (response) {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error("Currency API request failed");
        }
        return response.json();
      })
      .then(function (data) {
        if (!data || data.result !== "success" || !data.rates || !data.rates.USD) {
          throw new Error("Invalid exchange rate payload");
        }
        return Number(data.rates.USD);
      })
      .catch(function (error) {
        clearTimeout(timeoutId);
        throw error;
      });
  }

  salaryForm.addEventListener("submit", setSalary);
  expenseForm.addEventListener("submit", addExpense);
  expenseList.addEventListener("click", deleteExpense);
  currencyINRButton.addEventListener("click", function () {
    setCurrency("INR");
  });
  currencyUSDButton.addEventListener("click", function () {
    setCurrency("USD");
  });
  downloadReportButton.addEventListener("click", downloadReport);
  clearSalaryButton.addEventListener("click", resetState);
  errorPopupClose.addEventListener("click", clearError);

  loadState();
  updateCurrencyButtons();
  renderAll();
  restoreCurrencyRateIfNeeded();
})();
