import { openDB } from 'idb';

const DB_NAME = 'PersonalManagerDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Banks store
      if (!db.objectStoreNames.contains('banks')) {
        db.createObjectStore('banks', { keyPath: 'id', autoIncrement: true });
      }
      // Transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        txStore.createIndex('bankId', 'bankId');
        txStore.createIndex('type', 'type');
      }
      // To-Dos store
      if (!db.objectStoreNames.contains('todos')) {
        db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// --- Bank Methods ---
export const getBanks = async () => {
  const db = await initDB();
  return db.getAll('banks');
};

export const addBank = async (bank) => {
  const db = await initDB();
  const newBank = { 
    ...bank, 
    currentBalance: Number(bank.initialBalance), 
    minMonthlyBalance: Number(bank.minMonthlyBalance || 0),
    createdAt: new Date() 
  };
  const id = await db.add('banks', newBank);
  return { ...newBank, id };
};

export const updateBankBalance = async (bankId, amountChange) => {
  const db = await initDB();
  const bank = await db.get('banks', Number(bankId));
  if (!bank) throw new Error('Bank not found');
  
  bank.currentBalance = Number(bank.currentBalance) + Number(amountChange);
  await db.put('banks', bank);
  return bank;
};

export const resetBankBalances = async () => {
  const db = await initDB();
  const banks = await db.getAll('banks');
  for (const b of banks) {
    b.currentBalance = Number(b.initialBalance);
    await db.put('banks', b);
  }
};

// --- Transaction Methods ---
export const addTransaction = async (tx) => {
  const db = await initDB();
  const transaction = { ...tx, date: new Date() };
  
  // Update bank balance
  const balanceAdjustment = tx.type === 'debit' ? -Number(tx.amount) : Number(tx.amount);
  await updateBankBalance(tx.bankId, balanceAdjustment);
  
  const id = await db.add('transactions', transaction);
  return { ...transaction, id };
};

export const getTransactions = async () => {
  const db = await initDB();
  const txs = await db.getAll('transactions');
  return txs.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// --- To-Do Methods ---
export const getTodos = async () => {
  const db = await initDB();
  return db.getAll('todos');
};

export const addTodo = async (todo) => {
  const db = await initDB();
  const newTodo = { ...todo, completed: false, createdAt: new Date() };
  const id = await db.add('todos', newTodo);
  return { ...newTodo, id };
};

export const toggleTodo = async (id, completed) => {
  const db = await initDB();
  const todo = await db.get('todos', Number(id));
  if (todo) {
    todo.completed = completed;
    await db.put('todos', todo);
  }
};

export const deleteTodo = async (id) => {
  const db = await initDB();
  await db.delete('todos', Number(id));
};