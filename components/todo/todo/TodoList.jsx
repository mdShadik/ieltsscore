'use client';
import { useState } from 'react';
import { Check, Trash2, Plus } from 'lucide-react';

export default function TodoList({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    onAddTodo({ task: task.trim(), priority });
    setTask('');
  };

  return (
    <div className="bg-[#141414] p-4 sm:p-6 rounded-2xl shadow-lg border border-[#222] space-y-4">
      <h3 className="text-lg font-bold text-white">Tasks & Reminders</h3>

      {/* Quick Add */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a new task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          <option value="low" className="bg-[#141414] text-white">Low</option>
          <option value="medium" className="bg-[#141414] text-white">Medium</option>
          <option value="high" className="bg-[#141414] text-white">High</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition flex items-center justify-center shrink-0 shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Todo List */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6 border border-dashed border-[#222] rounded-xl">No pending tasks.</p>
        ) : (
          todos.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-[#222] bg-[#1a1a1a]/50 hover:bg-[#1c1c1c] transition">
              <div className="flex items-center space-x-3 min-w-0">
                <button
                  onClick={() => onToggleTodo(t.id, !t.completed)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                    t.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-[#444] bg-[#141414] hover:border-indigo-500'
                  }`}
                >
                  {t.completed && <Check className="w-3.5 h-3.5" />}
                </button>
                <span className={`text-sm ${t.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                  {t.task}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 shrink-0">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                  t.priority === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                  t.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}>
                  {t.priority}
                </span>
                <button onClick={() => onDeleteTodo(t.id)} className="text-gray-500 hover:text-rose-400 p-1 transition">
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