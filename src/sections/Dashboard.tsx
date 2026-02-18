import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Task, Transaction } from '../types';

interface DashboardStats {
  tasks: { total: number; completed: number; pending: number };
  finances: { income: number; expense: number; balance: number };
  contacts: number;
  events: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', user.id);
      const tasks: Task[] = tasksData || [];
      const completedTasks = tasks.filter((t) => t.status === 'completed').length;
      const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;

      const { data: transData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const transactions: Transaction[] = transData || [];
      const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      const { count: contactsCount } = await supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const { data: events } = await supabase.from('events').select('*').eq('user_id', user.id).gte('start_date', new Date().toISOString()).order('start_date', { ascending: true }).limit(5);

      setStats({
        tasks: { total: tasks.length, completed: completedTasks, pending: pendingTasks },
        finances: { income, expense, balance: income - expense },
        contacts: contactsCount || 0,
        events: events?.length || 0,
      });

      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">{format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
            <span className="text-xs text-gray-500">Tareas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.tasks.pending || 0}</p>
          <p className="text-xs text-gray-500">pendientes</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-xs text-gray-500">Balance</span>
          </div>
          <p className={`text-2xl font-bold ${stats?.finances.balance && stats.finances.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${stats?.finances.balance.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500">este mes</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-gray-500">Contactos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.contacts || 0}</p>
          <p className="text-xs text-gray-500">en CRM</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-gray-500">Eventos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.events || 0}</p>
          <p className="text-xs text-gray-500">próximos</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Tareas recientes</h3>
          {recentTasks.length > 0 ? (
            <ul className="space-y-3">
              {recentTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : task.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1">
                    <p className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                    <p className="text-xs text-gray-500">{task.category}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay tareas recientes</p>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Resumen financiero</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Ingresos</span>
              </div>
              <span className="font-semibold text-green-600">+${stats?.finances.income.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
                <span className="text-sm text-gray-700">Gastos</span>
              </div>
              <span className="font-semibold text-red-600">-${stats?.finances.expense.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
