import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
  compareList: string[];
  savedColleges: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  isInCompare: (id: string) => boolean;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      compareList: [],
      savedColleges: [],

      addToCompare: (id: string) => {
        const { compareList } = get();
        if (compareList.length < 3 && !compareList.includes(id)) {
          set({ compareList: [...compareList, id] });
        }
      },

      removeFromCompare: (id: string) => {
        set({ compareList: get().compareList.filter((c) => c !== id) });
      },

      clearCompare: () => set({ compareList: [] }),

      toggleSaved: (id: string) => {
        const { savedColleges } = get();
        if (savedColleges.includes(id)) {
          set({ savedColleges: savedColleges.filter((c) => c !== id) });
        } else {
          set({ savedColleges: [...savedColleges, id] });
        }
      },

      isSaved: (id: string) => get().savedColleges.includes(id),

      isInCompare: (id: string) => get().compareList.includes(id),
    }),
    {
      name: "mayra-international-store",
    }
  )
);
