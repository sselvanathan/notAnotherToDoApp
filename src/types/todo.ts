export interface Todo {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoFile {
  id: string;
  name: string;
  todos: Todo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoFolder {
  id: string;
  name: string;
  files: TodoFile[];
  isExpanded?: boolean;
}
