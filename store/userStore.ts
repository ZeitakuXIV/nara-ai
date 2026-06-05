import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { encryptData, decryptData } from '../utils/crypto';

export interface Recipe {
  id: string;
  title: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  scaling_reason: string;
  ingredients: Array<{ name: string; qty: string }>;
}

export interface UserBiometrics {
  userId: string | null;
  email: string | null;
  fullName: string | null;
  gender: 'male' | 'female' | null;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  activity: string | null;
  location: string;
  allergies: string[];
  goal: string | null;
}

interface UserStore extends UserBiometrics {
  isOnboarded: boolean;
  mealPlan: Recipe[] | null; // Persisted AI results
  setBiometrics: (data: Partial<UserBiometrics>) => void;
  toggleAllergy: (allergy: string) => void;
  setMealPlan: (plan: Recipe[]) => void;
  clearMealPlan: () => void; // Clear only meal plan, keep profile intact
  completeOnboarding: () => void;
  resetProfile: () => void;
}

const initialState: UserBiometrics & { isOnboarded: boolean; mealPlan: Recipe[] | null } = {
  userId: null,
  email: null,
  fullName: null,
  gender: null,
  age: 0,
  height: 170,
  weight: 65,
  activity: null,
  location: '',
  allergies: [],
  goal: null,
  isOnboarded: false,
  mealPlan: null,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,
      setBiometrics: (data) => set((state) => ({ ...state, ...data })),
      toggleAllergy: (allergy) => set((state) => ({
        allergies: state.allergies.includes(allergy)
          ? state.allergies.filter((a) => a !== allergy)
          : [...state.allergies, allergy],
      })),
      setMealPlan: (plan) => set({ mealPlan: plan }),
      clearMealPlan: () => set({ mealPlan: null }),
      completeOnboarding: () => set({ isOnboarded: true }),
      resetProfile: () => set(initialState),
    }),
    {
      name: 'nara-user-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const value = localStorage.getItem(name);
          if (!value) return null;
          return await decryptData(value);
        },
        setItem: async (name, value) => {
          const encrypted = await encryptData(value);
          localStorage.setItem(name, encrypted);
        },
        removeItem: async (name) => localStorage.removeItem(name),
      })),
    }
  )
);
