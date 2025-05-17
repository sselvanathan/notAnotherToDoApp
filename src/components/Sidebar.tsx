import React, { useState } from 'react';
import { FolderPlus, FilePlus, FileText, Folder, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { Popover } from './Popover';

export const Sidebar: React.FC = () => {
  const { 
    folders, 
    activeFolder, 
    activeFile, 
    addFolder, 
    addFile, 
    deleteFile,
    setActiveFolder, 
    setActiveFile,
    toggleFolderExpanded
  } = useTodoStore();

  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [addingFileToFolderId, setAddingFileToFolderId] = useState<string | null>(null);

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName);
      setNewFolderName('');
    }
  };

  const handleAddFile = (e: React.FormEvent, folderId: string) => {
    e.preventDefault();
    if (newFileName.trim()) {
      addFile(folderId, newFileName);
      setNewFileName('');
      setAddingFileToFolderId(null);
    }
  };

  const handleFolderClick = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFolder(folderId);
  };

  const handleToggleExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFolderExpanded(folderId);
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Todo Lists</h1>
        <Popover
          content={
            <div>
              <div className="font-medium">New Folder</div>
              <div className="text-gray-600">Create a new folder</div>
            </div>
          }
        >
          <button
            onClick={() => document.getElementById('newFolderInput')?.focus()}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FolderPlus size={20} />
          </button>
        </Popover>
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
          <div key={folder.id} className="mb-2">
            <div 
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeFolder === folder.id && !activeFile ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <button
                onClick={(e) => handleToggleExpand(folder.id, e)}
                className="mr-1 p-1 hover:bg-gray-700 rounded transition-colors"
              >
                {folder.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              <button
                onClick={(e) => handleFolderClick(folder.id, e)}
                className="flex-1 flex items-center text-left"
              >
                <Folder size={16} className="mr-2" />
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-sm text-gray-400">
                  {folder.files.reduce((count, file) => count + file.todos.length, 0)}
                </span>
              </button>

              <Popover
                content={
                  <div>
                    <div className="font-medium">New File</div>
                    <div className="text-gray-600">Create a new file in this folder</div>
                  </div>
                }
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingFileToFolderId(folder.id);
                    setTimeout(() => {
                      document.getElementById(`newFileInput-${folder.id}`)?.focus();
                    }, 0);
                  }}
                  className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <FilePlus size={14} />
                </button>
              </Popover>
            </div>

            {addingFileToFolderId === folder.id && (
              <form 
                onSubmit={(e) => handleAddFile(e, folder.id)} 
                className="pl-8 pr-3 mt-1 mb-2"
              >
                <input
                  id={`newFileInput-${folder.id}`}
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="New File"
                  className="w-full bg-gray-800 text-white px-3 py-1 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onBlur={() => {
                    if (!newFileName.trim()) {
                      setAddingFileToFolderId(null);
                    }
                  }}
                />
              </form>
            )}

            {folder.isExpanded && (
              <div className="pl-8 space-y-1 mt-1">
                {folder.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center"
                  >
                    <button
                      onClick={() => setActiveFile(file.id)}
                      className={`flex-1 flex items-center px-3 py-1 rounded-lg text-sm transition-colors ${
                        activeFile === file.id ? 'bg-blue-600' : 'hover:bg-gray-800'
                      }`}
                    >
                      <FileText size={14} className="mr-2" />
                      <span className="truncate">{file.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{file.todos.length}</span>
                    </button>
                    <Popover
                      content={
                        <div>
                          <div className="font-medium">Delete File</div>
                          <div className="text-gray-600">Delete this file and all its todos</div>
                        </div>
                      }
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this file? All todos in this file will be deleted.')) {
                            deleteFile(file.id);
                          }
                        }}
                        className="ml-1 p-1 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </Popover>
                  </div>
                ))}

                {folder.files.length === 0 && (
                  <div className="text-xs text-gray-500 px-3 py-1">
                    No files yet
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {folders.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            No folders yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
};
