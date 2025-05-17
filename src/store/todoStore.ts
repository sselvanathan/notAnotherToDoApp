import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Todo, TodoFolder, TodoFile } from '../types/todo';

interface TodoState {
  folders: TodoFolder[];
  activeFolder: string | null;
  activeFile: string | null;
  addFolder: (name: string) => void;
  addFile: (folderId: string, name: string) => void;
  addTodo: (fileId: string, todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  toggleTodo: (fileId: string, todoId: string) => void;
  deleteTodo: (fileId: string, todoId: string) => void;
  deleteFile: (fileId: string) => void;
  deleteFolder: (folderId: string) => void;
  setActiveFolder: (folderId: string | null) => void;
  setActiveFile: (fileId: string | null) => void;
  toggleFolderExpanded: (folderId: string) => void;
  exportToMarkdown: (fileId: string) => string;
  importFromMarkdown: (folderId: string, markdown: string) => void;
  updateTodoFromMarkdown: (fileId: string, todoId: string, content: string) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      folders: [],
      activeFolder: null,
      activeFile: null,

      addFolder: (name) => set((state) => ({
        folders: [...state.folders, {
          id: crypto.randomUUID(),
          name,
          files: [],
          isExpanded: true
        }]
      })),

      addFile: (folderId, name) => set((state) => {
        const fileId = crypto.randomUUID();
        return {
          folders: state.folders.map(folder => 
            folder.id === folderId ? {
              ...folder,
              files: [...folder.files, {
                id: fileId,
                name,
                todos: [],
                createdAt: new Date(),
                updatedAt: new Date()
              }]
            } : folder
          ),
          activeFile: fileId
        };
      }),

      addTodo: (fileId, todo) => set((state) => {
        // Find the folder that contains the file
        const folderWithFile = state.folders.find(folder => 
          folder.files.some(file => file.id === fileId)
        );

        if (!folderWithFile) return state;

        return {
          folders: state.folders.map(folder => 
            folder.id === folderWithFile.id ? {
              ...folder,
              files: folder.files.map(file => 
                file.id === fileId ? {
                  ...file,
                  todos: [...file.todos, {
                    ...todo,
                    id: crypto.randomUUID(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }],
                  updatedAt: new Date()
                } : file
              )
            } : folder
          )
        };
      }),

      toggleTodo: (fileId, todoId) => set((state) => {
        // Find the folder that contains the file
        const folderWithFile = state.folders.find(folder => 
          folder.files.some(file => file.id === fileId)
        );

        if (!folderWithFile) return state;

        return {
          folders: state.folders.map(folder => 
            folder.id === folderWithFile.id ? {
              ...folder,
              files: folder.files.map(file => 
                file.id === fileId ? {
                  ...file,
                  todos: file.todos.map(todo =>
                    todo.id === todoId ? { 
                      ...todo, 
                      completed: !todo.completed,
                      updatedAt: new Date()
                    } : todo
                  ),
                  updatedAt: new Date()
                } : file
              )
            } : folder
          )
        };
      }),

      deleteTodo: (fileId, todoId) => set((state) => {
        // Find the folder that contains the file
        const folderWithFile = state.folders.find(folder => 
          folder.files.some(file => file.id === fileId)
        );

        if (!folderWithFile) return state;

        return {
          folders: state.folders.map(folder =>
            folder.id === folderWithFile.id ? {
              ...folder,
              files: folder.files.map(file => 
                file.id === fileId ? {
                  ...file,
                  todos: file.todos.filter(todo => todo.id !== todoId),
                  updatedAt: new Date()
                } : file
              )
            } : folder
          )
        };
      }),

      deleteFile: (fileId) => set((state) => {
        // Find the folder that contains the file
        const folderWithFile = state.folders.find(folder => 
          folder.files.some(file => file.id === fileId)
        );

        if (!folderWithFile) return state;

        // If the active file is being deleted, set activeFile to null
        const newActiveFile = state.activeFile === fileId ? null : state.activeFile;

        return {
          folders: state.folders.map(folder =>
            folder.id === folderWithFile.id ? {
              ...folder,
              files: folder.files.filter(file => file.id !== fileId)
            } : folder
          ),
          activeFile: newActiveFile
        };
      }),

      deleteFolder: (folderId) => set((state) => {
        // If the active folder is being deleted, set activeFolder to null
        const newActiveFolder = state.activeFolder === folderId ? null : state.activeFolder;

        // If any file in the folder is active, set activeFile to null
        const folderToDelete = state.folders.find(folder => folder.id === folderId);
        const fileIdsInFolder = folderToDelete?.files.map(file => file.id) || [];
        const newActiveFile = fileIdsInFolder.includes(state.activeFile || '') ? null : state.activeFile;

        return {
          folders: state.folders.filter(folder => folder.id !== folderId),
          activeFolder: newActiveFolder,
          activeFile: newActiveFile
        };
      }),

      setActiveFolder: (folderId) => set({ 
        activeFolder: folderId,
        // When changing folders, clear the active file
        activeFile: null
      }),

      setActiveFile: (fileId) => set((state) => {
        if (!fileId) return { activeFile: null };

        // Find the folder that contains the file
        const folderWithFile = state.folders.find(folder => 
          folder.files.some(file => file.id === fileId)
        );

        if (!folderWithFile) return state;

        return { 
          activeFolder: folderWithFile.id,
          activeFile: fileId
        };
      }),

      toggleFolderExpanded: (folderId) => set((state) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId ? {
            ...folder,
            isExpanded: !folder.isExpanded
          } : folder
        )
      })),

      exportToMarkdown: (fileId) => {
        const state = get();

        // Find the file
        let foundFile: TodoFile | undefined;
        for (const folder of state.folders) {
          const file = folder.files.find(f => f.id === fileId);
          if (file) {
            foundFile = file;
            break;
          }
        }

        if (!foundFile) return '';

        return `# ${foundFile.name}\n\n${foundFile.todos.map(todo => 
          `- [${todo.completed ? 'x' : ' '}] ${todo.title}\n  ${todo.content}`
        ).join('\n\n')}`;
      },

      importFromMarkdown: (folderId, markdown) => set((state) => {
        const lines = markdown.split('\n');
        const fileName = lines[0].replace('# ', '');
        const todos: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>[] = [];

        let currentTodo: Partial<Todo> | null = null;
        let contentLines: string[] = [];

        for (let i = 2; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('- [')) {
            if (currentTodo) {
              currentTodo.content = contentLines.join('\n').trim();
              todos.push(currentTodo as Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>);
              contentLines = [];
            }
            currentTodo = {
              title: line.slice(4).trim(),
              completed: line[2] === 'x',
              content: ''
            };
          } else if (currentTodo && line.trim()) {
            contentLines.push(line.trim());
          }
        }

        if (currentTodo) {
          currentTodo.content = contentLines.join('\n').trim();
          todos.push(currentTodo as Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>);
        }

        const fileId = crypto.randomUUID();
        const newFile: TodoFile = {
          id: fileId,
          name: fileName,
          todos: todos.map(todo => ({
            ...todo,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
          })),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return { 
          folders: state.folders.map(folder => 
            folder.id === folderId ? {
              ...folder,
              files: [...folder.files, newFile]
            } : folder
          ),
          activeFile: fileId
        };
      }),

      updateTodoFromMarkdown: (fileId, todoId, content) => set((state) => {
        const lines = content.split('\n');
        const titleLine = lines[0];
        const isCompleted = titleLine.match(/- \[x\]/i) !== null;
        const title = titleLine.replace(/- \[[x ]\] /i, '').trim();
        const todoContent = lines.slice(1).join('\n').trim();

        // Find the folder that contains the file
        const folderWithFile = state.folders.find(folder => 
          folder.files.some(file => file.id === fileId)
        );

        if (!folderWithFile) return state;

        return {
          folders: state.folders.map(folder =>
            folder.id === folderWithFile.id ? {
              ...folder,
              files: folder.files.map(file =>
                file.id === fileId ? {
                  ...file,
                  todos: file.todos.map(todo =>
                    todo.id === todoId ? {
                      ...todo,
                      title,
                      content: todoContent,
                      completed: isCompleted,
                      updatedAt: new Date()
                    } : todo
                  ),
                  updatedAt: new Date()
                } : file
              )
            } : folder
          )
        };
      })
    }),
    {
      name: 'todo-storage'
    }
  )
);
