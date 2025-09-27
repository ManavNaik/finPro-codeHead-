// dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard Ready ✅");

  // Example: update numbers dynamically
  const balance = document.getElementById("totalBalance");
  const income = document.getElementById("monthlyIncome");
  const expense = document.getElementById("monthlyExpense");
  const growth = document.getElementById("investmentGrowth");

  // Dummy data (replace with API later)
  let data = {
    balance: 12345,
    income: 4200,
    expense: 1800,
    growth: 3500
  };

  balance.textContent = `$${data.balance.toLocaleString()}`;
  income.textContent = `$${data.income.toLocaleString()}`;
  expense.textContent = `$${data.expense.toLocaleString()}`;
  growth.textContent = `$${data.growth.toLocaleString()}`;

  // Example: sidebar toggle (collapsible)
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "☰";
  toggleBtn.className = "absolute top-4 left-4 z-50 bg-purple-600 text-white px-3 py-2 rounded-lg lg:hidden";
  document.body.appendChild(toggleBtn);

  const sidebar = document.querySelector("aside");
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });
});
