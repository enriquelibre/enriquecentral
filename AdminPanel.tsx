import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, DollarSign, CheckCircle, Loader2, Crown, UserX, UserCheck, Mail } from 'lucide-react';
import type { AppUser } from '../types';

export function AdminPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalTransactions: 0,
    adminUsers: 0,
    regularUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Obtener todos los perfiles con emails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Obtener todos los usuarios de auth (para tener emails si faltan)
      const { data: authUsers } = await supabase.auth.admin.listUsers();

      // Combinar datos
      const userMap = new Map();

      // Primero agregar perfiles
      profiles?.forEach(profile => {
        userMap.set(profile.id, {
          id: profile.id,
          email: profile.email || 'Sin email',
          full_name: profile.full_name,
          role: profile.role || 'user',
          created_at: profile.created_at,
          last_sign_in: null,
          tasks_count: 0,
          transactions_count: 0
        });
      });

      // Completar con datos de auth si falta email
      authUsers?.users?.forEach(authUser => {
        if (userMap.has(authUser.id)) {
          const user = userMap.get(authUser.id);
          if (!user.email || user.email === 'Sin email') {
            user.email = authUser.email || 'Sin email';
          }
          user.last_sign_in = authUser.last_sign_in_at;
        }
      });

      // Obtener estadísticas globales
      const { count: tasksCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
      const { count: transactionsCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true });

      // Calcular conteos por usuario
      const usersArray = Array.from(userMap.values());
      const usersWithStats = await Promise.all(
        usersArray.map(async (user) => {
          const { count: userTasks } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          const { count: userTransactions } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return {
            ...user,
            tasks_count: userTasks || 0,
            transactions_count: userTransactions || 0
          };
        })
      );

      setUsers(usersWithStats);
      setStats({
        totalUsers: usersWithStats.length,
        totalTasks: tasksCount || 0,
        totalTransactions: transactionsCount || 0,
        adminUsers: usersWithStats.filter(u => u.role === 'admin').length,
        regularUsers: usersWithStats.filter(u => u.role === 'user').length
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
      console.error('Error updating role:', error);
      return;
    }
    fetchAdminData();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestión de usuarios y estadísticas globales</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg">
          <Crown className="w-5 h-5" />
          <span className="font-medium">Modo Admin</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="text-xs text-gray-500">Total Usuarios</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          <p className="text-xs text-gray-500">{stats.adminUsers} admins, {stats.regularUsers} usuarios</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs text-gray-500">Tareas Totales</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
          <p className="text-xs text-gray-500">en el sistema</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-gray-500">Transacciones</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
          <p className="text-xs text-gray-500">registradas</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-gray-500">Actividad</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers > 0 ? Math.round((stats.totalTasks + stats.totalTransactions) / stats.totalUsers) : 0}</p>
          <p className="text-xs text-gray-500">promedio por usuario</p>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Usuarios Registrados ({users.length})
        </h3>

        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay usuarios registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Usuario</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rol</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tareas</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Transacciones</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Registro</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'admin' ? <Crown className="w-3 h-3" /> : null}
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{user.tasks_count}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{user.transactions_count}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleUserRole(user.id, user.role)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <><UserX className="w-4 h-4" /> Quitar Admin</>
                        ) : (
                          <><UserCheck className="w-4 h-4" /> Hacer Admin</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
