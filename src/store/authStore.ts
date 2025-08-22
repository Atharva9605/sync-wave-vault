import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  balance: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateBalance: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Mock login - replace with Supabase later
        if (email && password) {
          const user = {
            id: Date.now().toString(),
            email,
            balance: 5000.00
          };
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      register: async (email: string, password: string) => {
        // Mock register - replace with Supabase later
        if (email && password) {
          const user = {
            id: Date.now().toString(),
            email,
            balance: 1000.00
          };
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateBalance: (amount: number) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, balance: user.balance + amount } });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);