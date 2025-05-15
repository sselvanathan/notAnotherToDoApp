import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Todo, TodoFolder } from '../types/todo';

interface TodoState {
  folders: TodoFolder[];
  activeFolder: string | null;
  addFolder: (name: string) => void;
  addTodo: (folderId: string, todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  toggleTodo: (folderId: string, todoId: string) => void;
  deleteTodo: (folderId: string, todoId: string) => void;
  setActiveFolder: (folderId: string | null) => void;
  exportToMarkdown: (folderId: string) => string;
  importFromMarkdown: (markdown: string) => void;
  updateTodoFromMarkdown: (folderId: string, todoId: string, content: string) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      folders: [],
      activeFolder: null,
      
      addFolder: (name) => set((state) => ({
        folders: [...state.folders, {
          id: crypto.randomUUID(),
          name,
          todos: []
        }]
      })),

      addTodo: (folderId, todo) => set((state) => ({
        folders: state.folders.map(folder => 
          folder.id === folderId ? {
            ...folder,
            todos: [...folder.todos, {
              ...todo,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date()
            }]
          } : folder
        )
      })),

      toggleTodo: (folderId, todoId) => set((state) => ({
        folders: state.folders.map(folder => 
          folder.id === folderId ? {
            ...folder,
            todos: folder.todos.map(todo =>
              todo.id === todoId ? { 
                ...todo, 
                completed: !todo.completed,
                updatedAt: new Date()
              } : todo
            )
          } : folder
        )
      })),

      deleteTodo: (folderId, todoId) => set((state) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId ? {
            ...folder,
            todos: folder.todos.filter(todo => todo.id !== todoId)
          } : folder
        )
      })),

      setActiveFolder: (folderId) => set({ activeFolder: folderId }),

      exportToMarkdown: (folderId) => {
        const state = get();
        const folder = state.folders.find(f => f.id === folderId);
        if (!folder) return '';

        return `# ${folder.name}\n\n${folder.todos.map(todo => 
          `- [${todo.completed ? 'x' : ' '}] ${todo.title}\n  ${todo.content}`
        ).join('\n\n')}`;
      },

      importFromMarkdown: (markdown) => set((state) => {
        const lines = markdown.split('\n');
        const folderName = lines[0].replace('# ', '');
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

        const newFolder: TodoFolder = {
          id: crypto.randomUUID(),
          name: folderName,
          todos: todos.map(todo => ({
            ...todo,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        };

        return { folders: [...state.folders, newFolder] };
      }),

      updateTodoFromMarkdown: (folderId, todoId, content) => set((state) => {
        const lines = content.split('\n');
        const titleLine = lines[0];
        const isCompleted = titleLine.match(/- \[x\]/i) !== null;
        const title = titleLine.replace(/- \[[x ]\] /i, '').trim();
        const todoContent = lines.slice(1).join('\n').trim();

        return {
          folders: state.folders.map(folder =>
            folder.id === folderId ? {
              ...folder,
              todos: folder.todos.map(todo =>
                todo.id === todoId ? {
                  ...todo,
                  title,
                  content: todoContent,
                  completed: isCompleted,
                  updatedAt: new Date()
                } : todo
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