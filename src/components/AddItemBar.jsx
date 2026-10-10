import { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import { PRODUCT_SUGGESTIONS } from '../data/categories';

function normalize(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function AddItemBar({ listId, onOpenForm }) {
  const addItem = useStore((s) => s.addItem);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const q = normalize(query);
    const matches = PRODUCT_SUGGESTIONS.filter((p) => {
      const name = normalize(p.name);
      return name.includes(q) || name.replace(/s$/, '').includes(q.replace(/s$/, ''));
    }).slice(0, 8);
    setSuggestions(matches);
  }, [query]);

  const handleAddSuggestion = (product) => {
    addItem(listId, {
      name: product.name,
      category: product.category,
      icon: product.icon,
      quantity: 1,
      unit: 'pièce',
      price: 0,
    });
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleQuickAdd = () => {
    const name = query.trim();
    if (!name) return;

    const match = PRODUCT_SUGGESTIONS.find(
      (p) => normalize(p.name) === normalize(name)
    );
    addItem(listId, {
      name,
      category: match?.category || 'autre',
      icon: match?.icon || '📦',
      quantity: 1,
      unit: 'pièce',
      price: 0,
    });
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="sticky top-[52px] z-40 bg-gray-50 px-4 pt-3 pb-2">
      <div className="max-w-lg mx-auto relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              placeholder="Ajouter un article..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
            />
          </div>
          <button
            onClick={onOpenForm}
            className="px-3 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            title="Ajouter avec détails"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
            {suggestions.map((product, i) => (
              <button
                key={i}
                onClick={() => handleAddSuggestion(product)}
                className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
              >
                <span className="text-xl">{product.icon}</span>
                <span className="text-gray-700">{product.name}</span>
              </button>
            ))}
          </div>
        )}

        {showSuggestions && query.trim() && suggestions.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
            <button
              onClick={handleQuickAdd}
              className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex items-center gap-3 text-emerald-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter "{query.trim()}"
            </button>
          </div>
        )}
      </div>

      {!query && (
        <div className="max-w-lg mx-auto flex flex-wrap gap-2 mt-2">
          {PRODUCT_SUGGESTIONS.slice(0, 5).map((p, i) => (
            <button
              key={i}
              onClick={() => handleAddSuggestion(p)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <span>{p.icon}</span>
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
