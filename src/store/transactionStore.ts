import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  amount: number;
  payeeUpi: string;
  status: 'queued' | 'synced' | 'completed' | 'failed';
  hash?: string;
  createdAt: Date;
  syncedAt?: Date;
}

interface TransactionState {
  transactions: Transaction[];
  isOnline: boolean;
  addTransaction: (amount: number, payeeUpi: string) => Transaction;
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
  setOnlineStatus: (online: boolean) => void;
  syncTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isOnline: navigator.onLine,
      
      addTransaction: (amount: number, payeeUpi: string) => {
        const transaction: Transaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount,
          payeeUpi,
          status: 'queued',
          hash: Math.random().toString(36).substr(2, 16),
          createdAt: new Date(),
        };
        
        set(state => ({
          transactions: [transaction, ...state.transactions]
        }));
        
        return transaction;
      },
      
      updateTransactionStatus: (id: string, status: Transaction['status']) => {
        set(state => ({
          transactions: state.transactions.map(txn =>
            txn.id === id 
              ? { ...txn, status, syncedAt: status === 'synced' ? new Date() : txn.syncedAt }
              : txn
          )
        }));
      },
      
      setOnlineStatus: (online: boolean) => {
        set({ isOnline: online });
        if (online) {
          get().syncTransactions();
        }
      },
      
      syncTransactions: async () => {
        const { transactions, isOnline } = get();
        if (!isOnline) return;
        
        const queuedTransactions = transactions.filter(txn => txn.status === 'queued');
        
        // Mock sync - replace with Supabase later
        for (const txn of queuedTransactions) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
          get().updateTransactionStatus(txn.id, 'synced');
        }
      }
    }),
    {
      name: 'transaction-storage',
    }
  )
);

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useTransactionStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useTransactionStore.getState().setOnlineStatus(false);
  });
}