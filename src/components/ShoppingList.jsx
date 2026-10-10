import { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import { CATEGORIES } from '../data/categories';
import AddItemBar from './AddItemBar';
import ItemForm from './ItemForm';

function CategoryGroup({ categoryId, items, listId, onEdit }) {
  const toggleItemCart = useStore((s) => s.toggleItemCart);
  const removeItem = useStore((s) => s.removeItem);
  const [collapsed, setCollapsed] = useState(false);

  const category = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];

  return (
    <div className="mb-3">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide"
      >
        <span>{category.icon}</span>
        <span>{category.name}</span>
        <span className="ml-auto text-xs font-normal bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="space-y-1.5 px-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                item.inCart
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              <button
                onClick={() => toggleItemCart(listId, item.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.inCart
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-gray-300 hover:border-emerald-400'
                }`}
              >
                {item.inCart && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <span className="text-lg">{item.icon}</span>

              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${item.inCart ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.quantity} {item.unit}
                  {item.notes && ` · ${item.notes}`}
                </p>
              </div>

              {item.price > 0 && (
                <span className={`text-sm font-semibold flex-shrink-0 ${item.inCart ? 'text-emerald-600' : 'text-gray-700'}`}>
                  {(item.price * item.quantity).toFixed(2)}€
                </span>
              )}

              <div className="flex gap-0.5 flex-shrink-0">
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => removeItem(listId, item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShoppingList() {
  const lists = useStore((s) => s.lists);
  const activeListId = useStore((s) => s.activeListId);
  const validateList = useStore((s) => s.validateList);
  const activeList = lists.find((l) => l.id === activeListId);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const grouped = useMemo(() => {
    if (!activeList) return {};
    const groups = {};
    activeList.items.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [activeList]);

  const stats = useMemo(() => {
    if (!activeList) return { totalItems: 0, cartItems: 0, totalPrice: 0, cartPrice: 0 };
    const cartItems = activeList.items.filter((i) => i.inCart);
    return {
      totalItems: activeList.items.length,
      cartItems: cartItems.length,
      totalPrice: activeList.items.reduce((s, i) => s + i.price * i.quantity, 0),
      cartPrice: cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
    };
  }, [activeList]);

  if (!activeList) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 p-8">
        <div className="text-center">
          <svg className="w-20 h-20 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p className="text-lg">Sélectionnez ou créez une liste</p>
        </div>
      </div>
    );
  }

  const categoryOrder = CATEGORIES.map((c) => c.id);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <AddItemBar listId={activeList.id} onOpenForm={() => { setEditItem(null); setShowForm(true); }} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto py-3">
          {activeList.items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <p>Liste vide</p>
              <p className="text-sm mt-1">Ajoutez des articles avec la barre de recherche</p>
            </div>
          ) : (
            categoryOrder
              .filter((catId) => grouped[catId])
              .map((catId) => (
                <CategoryGroup
                  key={catId}
                  categoryId={catId}
                  items={grouped[catId]}
                  listId={activeList.id}
                  onEdit={(item) => { setEditItem(item); setShowForm(true); }}
                />
              ))
          )}
        </div>
      </div>

      {activeList.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-emerald-600">{stats.cartItems}</span>/{stats.totalItems} articles
              </p>
              <p className="text-lg font-bold text-gray-800">
                {stats.cartPrice.toFixed(2)}€
                {stats.totalPrice > 0 && stats.totalPrice !== stats.cartPrice && (
                  <span className="text-sm font-normal text-gray-400 ml-1">/ {stats.totalPrice.toFixed(2)}€</span>
                )}
              </p>
            </div>
            {stats.cartItems > 0 && (
              <button
                onClick={() => validateList(activeList.id)}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Valider le panier
              </button>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <ItemForm
          listId={activeList.id}
          editItem={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        />
      )}
    </div>
  );
}
