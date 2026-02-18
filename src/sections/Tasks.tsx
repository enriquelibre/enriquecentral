import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, CheckCircle2, Circle, Trash2, Edit2, X, Filter } from 'lucide-react';
import type { Task } from '../types';

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Task['category'],
    priority: 'medium' as Task['priority'],
    due_date: '',
  });

  useEffect(() => {
    fetchTasks();
    const channel = supabase.channel('tasks_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchTasks()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingTask) {
        await supabase.from('tasks').update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          priority: formData.priority,
          due_date: formData.due_date || null,
        }).eq('id', editingTask.id);
      } else {
        await supabase.from('tasks').insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          priority: formData.priority,
          status: 'pending',
          due_date: formData.due_date || null,
        });
      }

      setFormData({ title: '', description: '', category: 'personal', priority: 'medium', due_date: '' });
      setShowForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nueva tarea</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-400" />
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${filter === f ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Completadas'}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingTask ? 'Editar tarea' : 'Nueva tarea'}</h2>
              <button onClick={() => { setShowForm(false); setEditingTask(null); setFormData({ title: '', description: '', category: 'personal', priority: 'medium', due_date: '' }); }}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Task['category'] })} className="input-field">
                    <option value="personal">Personal</option>
                    <option value="work">Trabajo</option>
                    <option value="health">Salud</option>
                    <option value="finance">Finanzas</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })} className="input-field">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
                <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="input-field" />
              </div>

              <button type="submit" className="w-full btn-primary">{editingTask ? 'Guardar cambios' : 'Crear tarea'}</button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay tareas {filter !== 'all' ? 'en este filtro' : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className={`card flex items-start gap-3 ${task.status === 'completed' ? 'opacity-60' : ''}`}>
              <button onClick={() => toggleTaskStatus(task)} className="mt-1">
                {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-gray-400" />}
              </button>

              <div className="flex-1 min-w-0">
                <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</h3>
                {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{task.category}</span>
                  {task.due_date && <span className="text-xs text-gray-400">{new Date(task.due_date).toLocaleDateString()}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingTask(task); setFormData({ title: task.title, description: task.description || '', category: task.category, priority: task.priority, due_date: task.due_date || '' }); setShowForm(true); }} className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
