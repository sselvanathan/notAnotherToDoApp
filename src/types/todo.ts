export interface Todo {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoFolder {
  id: string;
  name: string;
  todos: Todo[];
}