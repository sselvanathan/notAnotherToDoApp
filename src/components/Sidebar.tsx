import React from 'react';
import { FolderPlus, FileText } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';

export const Sidebar: React.FC = () => {
  const { folders, activeFolder, addFolder, setActiveFolder } = useTodoStore();
  const [newFolderName, setNewFolderName] = React.useState('');

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName);
      setNewFolderName('');
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Todo Lists</h1>
        <button
          onClick={() => document.getElementById('newFolderInput')?.focus()}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FolderPlus size={20} />
        </button>
      </div>

      <form onSubmit={handleAddFolder} className="mb-4">
        <input
          id="newFolderInput"
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New Folder"
          className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      <div className="flex-1 overflow-y-auto">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setActiveFolder(folder.id)}
            className={`w-full flex items-center px-3 py-2 rounded-lg mb-2 transition-colors ${
              activeFolder === folder.id ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <FileText size={16} className="mr-2" />
            <span className="truncate">{folder.name}</span>
            <span className="ml-auto text-sm text-gray-400">{folder.todos.length}</span>
          </button>
        ))}
      </div>
    </div>
  );
};