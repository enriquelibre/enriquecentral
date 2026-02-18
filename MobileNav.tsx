import { LayoutDashboard, CheckSquare, Wallet, Users, Calendar, FileText, Target, BarChart3, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { ViewType } from '../types';

interface MobileNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

const navItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tareas', icon: CheckSquare },
  { id: 'finances', label: 'Finanzas', icon: Wallet },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'notes', label: 'Notas', icon: FileText },
  { id: 'goals', label: 'Metas', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function MobileNav({ currentView, onViewChange, onLogout, isAdmin }: MobileNavProps) {
  const { userName, userEmail, isAdmin: userIsAdmin } = useAuth();
  const admin = isAdmin || userIsAdmin;

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
        {/* Header con info de usuario */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-xl text-gray-900 block">LifeHub</span>
            </div>
          </div>

          {/* Info del usuario logueado */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userName || 'Usuario'}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
            {admin && (
              <div className="mt-2 flex items-center gap-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <Shield className="w-3 h-3" />
                  Administrador
                </span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                </li>
              );
            })}

            {admin && (
              <li>
                <button
                  onClick={() => onViewChange('admin')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'admin' 
                      ? 'bg-purple-50 text-purple-600' 
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Administración
                </button>
              </li>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${isActive ? 'text-primary-600' : 'text-gray-500'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
          {admin && (
            <button
              onClick={() => onViewChange('admin')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${currentView === 'admin' ? 'text-purple-600' : 'text-gray-500'}`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-xs">Admin</span>
            </button>
          )}
          <button onClick={() => onViewChange('more')} className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500">
            <span className="text-xl">•••</span>
            <span className="text-xs">Más</span>
          </button>
        </div>
      </nav>
    </>
  );
}
