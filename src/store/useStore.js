import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useStore = create(
  persist(
    (set, get) => ({
      lists: [],
      activeListId: null,
      history: [],

      createList: (name) => {
        const newList = {
          id: uuidv4(),
          name,
          createdAt: new Date().toISOString(),
          items: [],
        };
        set((state) => ({
          lists: [...state.lists, newList],
          activeListId: newList.id,
        }));
        return newList.id;
      },

      deleteList: (listId) => {
        set((state) => ({
          lists: state.lists.filter((l) => l.id !== listId),
          activeListId: state.activeListId === listId ? null : state.activeListId,
        }));
      },

      renameList: (listId, newName) => {
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId ? { ...l, name: newName } : l
          ),
        }));
      },

      setActiveList: (listId) => set({ activeListId: listId }),

      addItem: (listId, item) => {
        const newItem = {
          id: uuidv4(),
          name: item.name,
          quantity: item.quantity || 1,
          unit: item.unit || 'pièce',
          price: item.price || 0,
          category: item.category || 'autre',
          notes: item.notes || '',
          icon: item.icon || '📦',
          inCart: false,
          addedAt: new Date().toISOString(),
        };
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId ? { ...l, items: [...l.items, newItem] } : l
          ),
        }));
      },

      updateItem: (listId, itemId, updates) => {
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: l.items.map((item) =>
                    item.id === itemId ? { ...item, ...updates } : item
                  ),
                }
              : l
          ),
        }));
      },

      removeItem: (listId, itemId) => {
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.filter((item) => item.id !== itemId) }
              : l
          ),
        }));
      },

      toggleItemCart: (listId, itemId) => {
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: l.items.map((item) =>
                    item.id === itemId ? { ...item, inCart: !item.inCart } : item
                  ),
                }
              : l
          ),
        }));
      },

      validateList: (listId) => {
        const state = get();
        const list = state.lists.find((l) => l.id === listId);
        if (!list) return;

        const cartItems = list.items.filter((item) => item.inCart);
        if (cartItems.length === 0) return;

        const historyEntry = {
          id: uuidv4(),
          listName: list.name,
          date: new Date().toISOString(),
          items: cartItems,
          total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        };

        set((state) => ({
          history: [...state.history, historyEntry],
          lists: state.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.filter((item) => !item.inCart) }
              : l
          ),
        }));
      },

      getActiveList: () => {
        const state = get();
        return state.lists.find((l) => l.id === state.activeListId) || null;
      },

      getListStats: (listId) => {
        const state = get();
        const list = state.lists.find((l) => l.id === listId);
        if (!list) return { totalItems: 0, cartItems: 0, totalPrice: 0, cartPrice: 0 };

        const cartItems = list.items.filter((i) => i.inCart);
        return {
          totalItems: list.items.length,
          cartItems: cartItems.length,
          totalPrice: list.items.reduce((s, i) => s + i.price * i.quantity, 0),
          cartPrice: cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
        };
      },

      getHistoryStats: (startDate, endDate) => {
        const state = get();
        let filtered = state.history;

        if (startDate) {
          filtered = filtered.filter((h) => new Date(h.date) >= new Date(startDate));
        }
        if (endDate) {
          filtered = filtered.filter((h) => new Date(h.date) <= new Date(endDate));
        }

        const categoryTotals = {};
        filtered.forEach((entry) => {
          entry.items.forEach((item) => {
            if (!categoryTotals[item.category]) {
              categoryTotals[item.category] = 0;
            }
            categoryTotals[item.category] += item.price * item.quantity;
          });
        });

        return {
          total: filtered.reduce((s, h) => s + h.total, 0),
          entries: filtered.length,
          categoryTotals,
        };
      },
    }),
    {
      name: 'shopping-list-storage',
    }
  )
);

export default useStore;
