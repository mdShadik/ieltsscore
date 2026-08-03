'use client';

import { useState, useEffect } from 'react';
import { getTodos, addTodo, toggleTodo, deleteTodo } from '@/lib/db';
import TodoList from '@/components/todo/todo/TodoList';
import { CheckSquare, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const td = await getTodos();
      setTodos(td);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTodo = async (t) => {
    await addTodo(t);
    await loadData();
  };

  const handleToggleTodo = async (id, state) => {
    await toggleTodo(id, state);
    await loadData();
  };

  const handleDeleteTodo = async (id) => {
    await deleteTodo(id);
    await loadData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/manage"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <CheckSquare className="w-3.5 h-3.5" /> Tasks & Reminders
        </span>
      </div>

      {loading ? (
        <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl text-xs text-gray-500 animate-pulse">
          Loading tasks...
        </div>
      ) : (
        <TodoList
          todos={todos}
          onAddTodo={handleAddTodo}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      )}
    </div>
  );
}
