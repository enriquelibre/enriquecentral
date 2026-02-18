import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '../types';

export function Finances() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [account, setAccount] = useState<'personal' | 'business'>('personal');

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const categories = {
    expense: ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Otros'],
    income: ['Salario', 'Freelance', 'Inversiones', 'Ventas', 'Otros']
  };

  useEffect(() => {
    fetchTransactions();
  }, [account]);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('transactions').select('*').eq('user_id', user.id).eq('account', account).order('date', { ascending: false }).limit(50);
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('transactions').insert({
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date,
        user_id: user.id,
        account: account,
      });

      setFormData({ type: 'expense', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0] });
      setShowForm(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm('¿Eliminar esta transacción?')) return;
    await supabase.from('transactions').delete().eq('id', id);
    fetchTransactions();
  };

  const stats = {
    income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    expense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
  };
  const balance = stats.income - stats.expense;

  const expensesByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nueva transacción</span>
        </button>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg">
        <button onClick={() => setAccount('personal')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${account === 'personal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Personal</button>
        <button onClick={() => setAccount('business')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${account === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Negocio</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">Ingresos</p>
          <p className="text-lg font-bold text-green-600">${stats.income.toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">Gastos</p>
          <p className="text-lg font-bold text-red-600">${stats.expense.toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">Balance</p>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>${balance.toLocaleString()}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Distribución de gastos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((_item, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nueva transacción</h2>
              <button onClick={() => setShowForm(false)}><span className="text-2xl text-gray-400">&times;</span></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`flex-1 py-2 rounded-lg font-medium ${formData.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>Ingreso</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`flex-1 py-2 rounded-lg font-medium ${formData.type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>Gasto</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field" required>
                  <option value="">Seleccionar...</option>
                  {categories[formData.type].map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-field" required />
              </div>

              <button type="submit" className="w-full btn-primary">Guardar transacción</button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Transacciones recientes</h3>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay transacciones</p>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {transaction.type === 'income' ? <ArrowUpRight className="w-5 h-5 text-green-600" /> : <ArrowDownRight className="w-5 h-5 text-red-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </span>
                <button onClick={() => deleteTransaction(transaction.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
