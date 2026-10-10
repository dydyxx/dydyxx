import { useState } from 'react';
import useStore from '../store/useStore';

export default function ListManager({ onSelectList }) {
  const lists = useStore((s) => s.lists);
  const createList = useStore((s) => s.createList);
  const deleteList = useStore((s) => s.deleteList);
  const renameList = useStore((s) => s.renameList);
  const setActiveList = useStore((s) => s.setActiveList);

  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    const name = newListName.trim();
    if (!name) return;
    const id = createList(name);
    setNewListName('');
    setActiveList(id);
    onSelectList();
  };

  const handleRename = (id) => {
    if (editName.trim()) {
      renameList(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleSelect = (id) => {
    setActiveList(id);
    onSelectList();
  };

  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mes listes de courses</h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Nouvelle liste..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          onClick={handleCreate}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
        >
          Créer
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg">Aucune liste</p>
          <p className="text-sm mt-1">Créez votre première liste de courses</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center p-4">
                <button
                  onClick={() => handleSelect(list.id)}
                  className="flex-1 text-left"
                >
                  {editingId === list.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleRename(list.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(list.id)}
                      className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <p className="font-medium text-gray-800">{list.name}</p>
                      <p className="text-sm text-gray-500">
                        {list.items.length} article{list.items.length !== 1 ? 's' : ''} ·{' '}
                        {new Date(list.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(list.id);
                      setEditName(list.name);
                    }}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Supprimer "${list.name}" ?`)) {
                        deleteList(list.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
