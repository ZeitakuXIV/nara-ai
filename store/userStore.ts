import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserBiometrics {
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
  setBiometrics: (data: Partial<UserBiometrics>) => void;
  toggleAllergy: (allergy: string) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
}

const initialState: UserBiometrics & { isOnboarded: boolean } = {
  gender: null,
  age: 0,
  height: 170,
  weight: 65,
  activity: null,
  location: '',
  allergies: [],
  goal: null,
  isOnboarded: false,
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
      completeOnboarding: () => set({ isOnboarded: true }),
      resetProfile: () => set(initialState),
    }),
    {
      name: 'nara-user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
