import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useStore from '../store/useStore';
import { CATEGORIES } from '../data/categories';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

export default function Statistics() {
  const history = useStore((s) => s.history);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const stats = useMemo(() => {
    let filtered = history;
    if (startDate) filtered = filtered.filter((h) => new Date(h.date) >= new Date(startDate));
    if (endDate) filtered = filtered.filter((h) => new Date(h.date) <= new Date(endDate + 'T23:59:59'));

    const categoryTotals = {};
    let total = 0;

    filtered.forEach((entry) => {
      entry.items.forEach((item) => {
        const amount = item.price * item.quantity;
        total += amount;
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amount;
      });
    });

    const pieData = Object.entries(categoryTotals)
      .map(([catId, value]) => {
        const cat = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
        return { name: cat.name, value: Math.round(value * 100) / 100, color: cat.color, icon: cat.icon };
      })
      .sort((a, b) => b.value - a.value);

    return { total, entries: filtered.length, pieData };
  }, [history, startDate, endDate]);

  if (history.length === 0) {
    return (
      <div className="max-w-lg mx-auto p-4 pb-24">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistiques</h2>
        <div className="text-center py-16 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg">Aucune donnée</p>
          <p className="text-sm mt-1">Validez des achats pour voir les statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistiques</h2>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
        <p className="text-sm text-gray-500 mb-2">Filtrer par période</p>
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="flex items-center text-gray-400 text-sm">au</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="bg-emerald-600 rounded-2xl p-5 mb-4 text-white">
        <p className="text-emerald-200 text-sm">Total des dépenses</p>
        <p className="text-3xl font-bold mt-1">{stats.total.toFixed(2)}€</p>
        <p className="text-emerald-200 text-sm mt-1">{stats.entries} achat{stats.entries > 1 ? 's' : ''}</p>
      </div>

      {stats.pieData.length > 0 && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Répartition par catégorie</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value.toFixed(2)}€`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-3">
              {stats.pieData.map((item, i) => {
                const pct = stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(0) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700 flex-1">{item.icon} {item.name}</span>
                    <span className="text-sm font-medium text-gray-800">{item.value.toFixed(2)}€</span>
                    <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Montants par catégorie</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.pieData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${v}€`} fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="icon"
                  width={30}
                  fontSize={16}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => `${value.toFixed(2)}€`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                  {stats.pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
