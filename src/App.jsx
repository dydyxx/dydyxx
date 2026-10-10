import { useState } from 'react';
import Header from './components/Header';
import ListManager from './components/ListManager';
import ShoppingList from './components/ShoppingList';
import Statistics from './components/Statistics';
import History from './components/History';
import useStore from './store/useStore';

export default function App() {
  const activeListId = useStore((s) => s.activeListId);
  const [currentView, setCurrentView] = useState(activeListId ? 'list' : 'lists');

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleSelectList = () => {
    setCurrentView('list');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentView={currentView} onViewChange={handleViewChange} />

      <main className="flex-1 flex flex-col">
        {currentView === 'lists' && (
          <ListManager onSelectList={handleSelectList} />
        )}
        {currentView === 'list' && <ShoppingList />}
        {currentView === 'stats' && <Statistics />}
        {currentView === 'history' && <History />}
      </main>
    </div>
  );
}
