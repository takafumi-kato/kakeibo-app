
'use strict';

// ==============================
// 定数・変数
// ==============================

const STORAGE_KEY = 'transactions';

let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingId = null;


// ==============================
// DOM要素
// ==============================

const elements = {
  form: document.getElementById('moneyForm'),
  date: document.getElementById('date'),
  title: document.getElementById('title'),
  category: document.getElementById('category'),
  type: document.getElementById('type'),
  amount: document.getElementById('amount'),

  totalIncome: document.getElementById('totalIncome'),
  totalExpense: document.getElementById('totalExpense'),
  balance: document.getElementById('balance'),

  transactionList: document.getElementById('transactionList'),
  titleList: document.getElementById('titleList'),

  editModal: document.getElementById('editModal'),
  closeModal: document.getElementById('closeModal'),

  editDate: document.getElementById('editDate'),
  editTitle: document.getElementById('editTitle'),
  editCategory: document.getElementById('editCategory'),
  editAmount: document.getElementById('editAmount'),

  updateButton: document.getElementById('updateButton')
};


// ==============================
// 初期化
// ==============================

function init() {
  renderTransactions();
  calculateTotals();
  renderTitleList();
  renderYearList();

  elements.form.addEventListener('submit', handleSubmit);

  editModalClose();
  editUpdate();

  // 年月検索のイベント
  const year = document.getElementById('year');
  const month = document.querySelector('.transaction-calendar');

  year.addEventListener('change', yearMonthSearch);
  month.addEventListener('change', yearMonthSearch);
}


// ==============================
// 登録処理
// ==============================

function handleSubmit(event) {
  event.preventDefault();

  const transaction = {
    id: Date.now(),
    date: elements.date.value,
    title: elements.title.value,
    category: elements.category.value,
    type: elements.type.value,
    amount: Number(elements.amount.value)
  };

  transactions.push(transaction);

  saveTransactions();
  renderTransactions();
  calculateTotals();
  renderTitleList();
  renderYearList();
  renderExpenseChart();

  elements.form.reset();
}


// ==============================
// 履歴の表示
// ==============================

function renderTransactions(data = transactions) {
  elements.transactionList.innerHTML = '';

  data.forEach(item => {
    const tr = document.createElement('tr');

    const date = new Date(item.date);
    const formattedDate =
      `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

    const values = [
      formattedDate,
      item.title,
      item.category,
      item.amount
    ];

    values.forEach(value => {
      const td = document.createElement('td');

      td.textContent = value;

      tr.appendChild(td);
    });

    // ボタン
    const actionTd = document.createElement('td');
    const deleteButton = document.createElement('button');
    const editButton = document.createElement('button');

    deleteButton.classList.add('delete-btn');
    editButton.classList.add('edit-btn');

    deleteButton.textContent = '削除';
    editButton.textContent = '編集';

    // イベント設定
    deleteEvent(deleteButton, item.id);
    editEvent(editButton, item.id);

    // ボタンを追加
    actionTd.appendChild(deleteButton);
    actionTd.appendChild(editButton);

    tr.appendChild(actionTd);

    elements.transactionList.appendChild(tr);
  });
}


// ==============================
// 削除処理
// ==============================

function deleteEvent(deleteButton, id) {
  deleteButton.addEventListener('click', () => {
    const deleteIndex =
      transactions.findIndex(transaction => transaction.id === id);

    if (deleteIndex === -1) {
      return;
    }

    transactions.splice(deleteIndex, 1);

    saveTransactions();
    renderTransactions();
    calculateTotals();
    renderTitleList();
    renderYearList();
  });
}


// ==============================
// 編集処理
// ==============================

function editEvent(editButton, id) {
  editButton.addEventListener('click', () => {
    const editIndex =
      transactions.findIndex(transaction => transaction.id === id);

    if (editIndex === -1) {
      return;
    }

    const transaction = transactions[editIndex];

    editingId = id;

    // モーダルを表示
    elements.editModal.classList.add('show');

    // 入力欄にデータを表示
    elements.editDate.value = transaction.date;
    elements.editTitle.value = transaction.title;
    elements.editCategory.value = transaction.category;
    elements.editAmount.value = transaction.amount;
  });
}


// ==============================
// 編集更新処理
// ==============================

function editUpdate() {

  elements.updateButton.addEventListener('click', () => {

    const editIndex =
      transactions.findIndex(transaction => transaction.id === editingId);

    if (editIndex === -1) {
      return;
    }

    transactions[editIndex].date = elements.editDate.value;
    transactions[editIndex].title = elements.editTitle.value;
    transactions[editIndex].category = elements.editCategory.value;
    transactions[editIndex].amount = Number(elements.editAmount.value);

    saveTransactions();
    renderTransactions();
    calculateTotals();
    renderTitleList();

    elements.editModal.classList.remove('show');
  });
}


// ==============================
// モーダルを閉じる処理
// ==============================

function editModalClose() {

  elements.closeModal.addEventListener('click', () => {
    elements.editModal.classList.remove('show');
  });

}


// ==============================
// 収入・支出・残高の計算
// ==============================

function calculateTotals() {

  const totalIncome = transactions
    .filter(transaction => transaction.type === 'income')
    .reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

  const totalExpense = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

  const balance = totalIncome - totalExpense;

  elements.totalIncome.textContent =
    `${totalIncome.toLocaleString()}円`;

  elements.totalExpense.textContent =
    `${totalExpense.toLocaleString()}円`;

  elements.balance.textContent =
    `合計：${balance.toLocaleString()}円`;
}


// ==============================
// タイトル履歴
// ==============================

function renderTitleList() {

  elements.titleList.innerHTML = '';

  const titles = [
    ...new Set(transactions.map(transaction => transaction.title))
  ];

  titles.forEach(title => {

    const option = document.createElement('option');

    option.value = title;

    elements.titleList.appendChild(option);
  });
}


// ==============================
// 年月検索
// ==============================

function yearMonthSearch() {

  const year = document.getElementById('year');
  const month = document.querySelector('.transaction-calendar');

  const searchYear = year.value;
  const searchMonth = month.value;

  const result = transactions.filter(transaction => {
    const [transactionYear, transactionMonth] =
      transaction.date.split('-');

    // 年・月どちらも「すべて」
    if (searchYear === 'all' && searchMonth === 'all') {
      return true;
    }

    // 年が「すべて」 → 月だけ検索
    if (searchYear === 'all') {
      return Number(transactionMonth) === Number(searchMonth);
    }

    // 月が「すべて」 → 年だけ検索
    if (searchMonth === 'all') {
      return transactionYear === searchYear;
    }

    // 年・月の両方を指定
    return transactionYear === searchYear &&
      Number(transactionMonth) === Number(searchMonth);
  });

  renderTransactions(result);
  renderExpenseChart(result);
  renderCategoryChart(result);
}

function renderYearList() {

  const year = document.getElementById('year');

  // 「すべて」以外を一度削除
  year.innerHTML = '<option value="all">すべて</option>';

  const years = [
    ...new Set(
      transactions.map(transaction => {
        return transaction.date.split('-')[0];
      })
    )
  ];

  years.sort((a, b) => b - a);

  years.forEach(yearValue => {

    const option = document.createElement('option');

    option.value = yearValue;
    option.textContent = `${yearValue}年`;

    year.appendChild(option);
  });
}

// ==============================
// localStorage保存
// ==============================

function saveTransactions() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(transactions)
  );

}


// ==============================
// 実行
// ==============================

init();

let expenseChart = null;

function renderExpenseChart(data = transactions) {

  const ctx = document.getElementById('expenseChart');

  const expenses = data.filter(transaction => {
    return transaction.type === 'expense';
  });

  const incomes = data.filter(transaction => {
    return transaction.type === 'income'
  });

  const expenseCategoryTotals = {};
  const incomeCategoryTotals = {};

  expenses.forEach(transaction => {
    const category = transaction.category;
    const amount = Number(transaction.amount);

    if (expenseCategoryTotals[category]) {
      expenseCategoryTotals[category] += amount;
    } else {
      expenseCategoryTotals[category] = amount;
    }
  });

  incomes.forEach(transaction => {
  const category = transaction.category;
  const amount = Number(transaction.amount);

  if (incomeCategoryTotals[category]) {
    incomeCategoryTotals[category] += amount;
  } else {
    incomeCategoryTotals[category] = amount;
  }
});

  const labels = [
    ...new Set([
      ...Object.keys(expenseCategoryTotals),
      ...Object.keys(incomeCategoryTotals)
  ])]

  const expenseData = labels.map(category => {
    return expenseCategoryTotals[category] || 0;
  });

  const incomeData = labels.map(category => {
    return incomeCategoryTotals[category] || 0;
  });

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(ctx, {
    type: 'bar',

    data: {
      labels: labels,

      datasets: [
        {
          label: '支出額',
          data: expenseData
        },

        {
          label: '収入額',
          data: incomeData
        }
      ]
    },

    options: {
    maintainAspectRatio: false
  }
  });
}

let categoryChart = null;

function renderCategoryChart(data = transactions) {

  const ctx = document.getElementById('categoryChart');

  const expenses = data.filter(transaction => {
    return transaction.type === 'expense';
  });

  const categoryTotals = {};

  expenses.forEach(transaction => {

    const category = transaction.category;
    const amount = Number(transaction.amount);

    if (categoryTotals[category]) {
      categoryTotals[category] += amount;
    } else {
      categoryTotals[category] = amount;
    }

  });

  const labels = Object.keys(categoryTotals);

  const values = Object.values(categoryTotals);

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(ctx, {

    type: 'pie',

    data: {
      labels: labels,

      datasets: [
        {
          data: values
        }
      ]
    },
    
    options: {
    maintainAspectRatio: false
  }
  });
}

renderExpenseChart();
renderCategoryChart();


