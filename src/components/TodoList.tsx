import React from 'react';
import { Download, Upload, Check, Trash2 } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const TodoList: React.FC = () => {
  const { folders, activeFolder, addTodo, toggleTodo, deleteTodo, exportToMarkdown, importFromMarkdown, updateTodoFromMarkdown } = useTodoStore();
  const [newTodo, setNewTodo] = React.useState({ title: '', content: '' });
  const [editingTodo, setEditingTodo] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');
  
  const currentFolder = folders.find(f => f.id === activeFolder);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentFolder && newTodo.title.trim()) {
      addTodo(currentFolder.id, {
        title: newTodo.title,
        content: newTodo.content,
        completed: false
      });
      setNewTodo({ title: '', content: '' });
    }
  };

  const handleExport = () => {
    if (!currentFolder) return;
    const markdown = exportToMarkdown(currentFolder.id);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFolder.name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        importFromMarkdown(content);
      }
    };
    reader.readAsText(file);
  };

  const startEditing = (todo: { id: string; completed: boolean; title: string; content: string }) => {
    setEditingTodo(todo.id);
    setEditContent(`- [${todo.completed ? 'x' : ' '}] ${todo.title}\n${todo.content}`);
  };

  const handleSave = (todoId: string) => {
    if (!currentFolder) return;
    updateTodoFromMarkdown(currentFolder.id, todoId, editContent);
    setEditingTodo(null);
    setEditContent('');
  };

  if (!currentFolder) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select or create a folder to get started
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{currentFolder.name}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Export as Markdown"
            >
              <Download size={20} />
            </button>
            <label className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
              <Upload size={20} />
              <input
                type="file"
                accept=".md"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleAddTodo} className="mb-6">
          <input
            type="text"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            placeholder="New Todo"
            className="w-full mb-2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={newTodo.content}
            onChange={(e) => setNewTodo({ ...newTodo, content: e.target.value })}
            placeholder="Description (Markdown supported)"
            className="w-full h-24 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Todo
          </button>
        </form>

        <div className="space-y-4">
          {currentFolder.todos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${
                todo.completed ? 'border-green-500' : 'border-blue-500'
              }`}
            >
              <div className="flex items-center mb-2">
                <button
                  onClick={() => toggleTodo(currentFolder.id, todo.id)}
                  className={`p-2 rounded-full mr-2 ${
                    todo.completed ? 'bg-green-500 text-white' : 'border-2 border-gray-300'
                  }`}
                >
                  {todo.completed && <Check size={16} />}
                </button>
                <h3 className={`text-lg font-medium flex-grow ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.title}
                </h3>
                <div className="flex gap-2">
                  {editingTodo === todo.id ? (
                    <button
                      onClick={() => handleSave(todo.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(todo)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(currentFolder.id, todo.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="pl-10">
                {editingTodo === todo.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="prose prose-sm bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Preview:</h4>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{editContent.split('\n').slice(1).join('\n')}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{todo.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};