
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

  function search() {
    const searchYear = year.value;
    const searchMonth = month.value;

    const result = transactions.filter(transaction => {
      const [transactionYear, transactionMonth] = transaction.date.split('-');

      if (searchMonth === 'all') {
      return transactionYear === searchYear;
    }

    return transactionYear === searchYear &&
      Number(transactionMonth) === Number(searchMonth);
  });

  renderTransactions(result);
};

  year.addEventListener('input', search);
  month.addEventListener('change', search);

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

