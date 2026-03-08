import { useLocalStorage } from './useLocalStorage';
import type { Expense, ExpenseCategory } from '@/types';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'roqui-expenses';

export function useExpenses() {
  const [expenses, setExpensesState] = useLocalStorage<Expense[]>(STORAGE_KEY, []);

  const setExpenses = (newExpenses: Expense[]) => {
    setExpensesState(newExpenses);
  };

  const addExpense = (data: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };

    setExpensesState([newExpense, ...expenses]);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>): Expense | null => {
    let updated: Expense | null = null;
    
    setExpensesState(
      expenses.map(exp => {
        if (exp.id === id) {
          updated = { ...exp, ...updates };
          return updated;
        }
        return exp;
      })
    );
    
    return updated;
  };

  const deleteExpense = (id: string): boolean => {
    setExpensesState(expenses.filter(exp => exp.id !== id));
    return true;
  };

  const getExpenseById = (id: string): Expense | undefined => {
    return expenses.find(exp => exp.id === id);
  };

  const getExpensesByMonth = (year: number, month: number): Expense[] => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getFullYear() === year && expDate.getMonth() === month;
    });
  };

  const getExpensesByCategory = (category: ExpenseCategory): Expense[] => {
    return expenses.filter(exp => exp.category === category);
  };

  const getTotalExpensesByMonth = (year: number, month: number, exchangeRate: number): number => {
    return getExpensesByMonth(year, month).reduce((total, exp) => {
      const amountInUSD = exp.currency === 'CRC' ? exp.amount / exchangeRate : exp.amount;
      return total + amountInUSD;
    }, 0);
  };

  const getRecentExpenses = (limit: number = 20): Expense[] => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  const getExpensesBreakdownByCategory = (year: number, month: number, exchangeRate: number): Record<ExpenseCategory, number> => {
    const breakdown: Partial<Record<ExpenseCategory, number>> = {};
    
    const monthExpenses = getExpensesByMonth(year, month);
    
    monthExpenses.forEach(exp => {
      const amountInUSD = exp.currency === 'CRC' ? exp.amount / exchangeRate : exp.amount;
      breakdown[exp.category] = (breakdown[exp.category] || 0) + amountInUSD;
    });
    
    return breakdown as Record<ExpenseCategory, number>;
  };

  return {
    expenses,
    setExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    getExpensesByMonth,
    getExpensesByCategory,
    getTotalExpensesByMonth,
    getRecentExpenses,
    getExpensesBreakdownByCategory,
  };
}
