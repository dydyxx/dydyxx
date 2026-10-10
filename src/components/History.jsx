import { useState } from 'react';
import useStore from '../store/useStore';
import { CATEGORIES } from '../data/categories';

export default function History() {
  const history = useStore((s) => s.history);
  const [expandedId, setExpandedId] = useState(null);

  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleExport = () => {
    let text = 'HISTORIQUE DES ACHATS\n';
    text += '='.repeat(40) + '\n\n';

    sorted.forEach((entry) => {
      text += `${entry.listName} - ${new Date(entry.date).toLocaleDateString('fr-FR')}\n`;
      text += '-'.repeat(30) + '\n';
      entry.items.forEach((item) => {
        const cat = CATEGORIES.find((c) => c.id === item.category);
        text += `  ${item.icon} ${item.name} x${item.quantity} ${item.unit}`;
        if (item.price > 0) text += ` - ${(item.price * item.quantity).toFixed(2)}€`;
        text += '\n';
      });
      text += `  TOTAL: ${entry.total.toFixed(2)}€\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique-courses-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (history.length === 0) {
    return (
      <div className="max-w-lg mx-auto p-4 pb-24">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Historique</h2>
        <div className="text-center py-16 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">Aucun historique</p>
          <p className="text-sm mt-1">Les achats validés apparaîtront ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Historique</h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter
        </button>
      </div>

      <div className="space-y-3">
        {sorted.map((entry) => (
          <div key={entry.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              className="w-full p-4 text-left flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{entry.listName}</p>
                <p className="text-sm text-gray-500">
                  {new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}{entry.items.length} article{entry.items.length > 1 ? 's' : ''}
                </p>
              </div>
              <span className="font-bold text-emerald-600 text-lg flex-shrink-0">{entry.total.toFixed(2)}€</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${expandedId === entry.id ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedId === entry.id && (
              <div className="border-t border-gray-100 px-4 py-3">
                {entry.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} {item.unit}</p>
                    </div>
                    {item.price > 0 && (
                      <span className="text-sm font-medium text-gray-600">
                        {(item.price * item.quantity).toFixed(2)}€
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
