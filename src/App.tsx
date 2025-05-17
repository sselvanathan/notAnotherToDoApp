import { Sidebar } from './components/Sidebar';
import { TodoList } from './components/TodoList';

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <TodoList />
    </div>
  );
}

export default App;