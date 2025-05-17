import React from 'react';
import { Download, Upload, Check, Trash2, FileText } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarkdownToolbar } from './MarkdownToolbar';
import { InteractiveCheckbox } from './InteractiveCheckbox';
import { Popover } from './Popover';

export const TodoList: React.FC = () => {
  const { 
    folders, 
    activeFolder, 
    activeFile, 
    addTodo, 
    toggleTodo, 
    deleteTodo, 
    exportToMarkdown, 
    importFromMarkdown, 
    updateTodoFromMarkdown,
    addFile
  } = useTodoStore();
  const [newTodo, setNewTodo] = React.useState({ title: '', content: '' });
  const [editingTodo, setEditingTodo] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');

  // Function to handle inserting markdown from toolbar for new todo
  const handleInsertMarkdown = (markdown: string) => {
    const textarea = document.getElementById('new-todo-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newTodo.content;
    const before = text.substring(0, start);
    const after = text.substring(end);

    setNewTodo({
      ...newTodo,
      content: before + markdown + after
    });

    // Focus back to textarea after inserting
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + markdown.length;
      textarea.selectionEnd = start + markdown.length;
    }, 0);
  };

  // Function to handle keydown events in the new todo textarea
  const handleNewTodoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, value } = textarea;

    // Get the current line
    const textBeforeCursor = value.substring(0, selectionStart);
    const lineStartPos = textBeforeCursor.lastIndexOf('\n') + 1;
    const currentLine = textBeforeCursor.substring(lineStartPos);

    // Check if the current line is a checkbox
    const checkboxRegex = /^(\s*)- \[[ x]\] (.*)/;
    const match = currentLine.match(checkboxRegex);

    if (e.key === 'Enter' && match) {
      e.preventDefault();

      const [, indent, text] = match;
      const newCheckbox = `\n${indent}- [ ] `;

      const newContent = value.substring(0, selectionStart) + newCheckbox + value.substring(selectionStart);

      setNewTodo({
        ...newTodo,
        content: newContent
      });

      // Set cursor position after the new checkbox
      setTimeout(() => {
        textarea.focus();
        const newPosition = selectionStart + newCheckbox.length;
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
      }, 0);

      return;
    }

    if (e.key === 'Tab' && match && !e.shiftKey) {
      e.preventDefault();

      const [, indent, text] = match;
      const newIndent = indent + '  ';
      const newLine = `${newIndent}- [ ] ${text}`;

      const contentBeforeLine = value.substring(0, lineStartPos);
      const contentAfterLine = value.substring(lineStartPos + currentLine.length);

      const newContent = contentBeforeLine + newLine + contentAfterLine;

      setNewTodo({
        ...newTodo,
        content: newContent
      });

      // Set cursor position at the end of the new line
      setTimeout(() => {
        textarea.focus();
        const newPosition = lineStartPos + newLine.length;
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
      }, 0);
    }
  };

  // Function to handle inserting markdown from toolbar for edit todo
  const handleInsertEditMarkdown = (markdown: string) => {
    const textarea = document.getElementById('edit-todo-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editContent;
    const before = text.substring(0, start);
    const after = text.substring(end);

    setEditContent(before + markdown + after);

    // Focus back to textarea after inserting
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + markdown.length;
      textarea.selectionEnd = start + markdown.length;
    }, 0);
  };

  // Function to handle keydown events in the edit todo textarea
  const handleEditTodoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, value } = textarea;

    // Get the current line
    const textBeforeCursor = value.substring(0, selectionStart);
    const lineStartPos = textBeforeCursor.lastIndexOf('\n') + 1;
    const currentLine = textBeforeCursor.substring(lineStartPos);

    // Check if the current line is a checkbox
    const checkboxRegex = /^(\s*)- \[[ x]\] (.*)/;
    const match = currentLine.match(checkboxRegex);

    if (e.key === 'Enter' && match) {
      e.preventDefault();

      const [, indent, text] = match;
      const newCheckbox = `\n${indent}- [ ] `;

      const newContent = value.substring(0, selectionStart) + newCheckbox + value.substring(selectionStart);

      setEditContent(newContent);

      // Set cursor position after the new checkbox
      setTimeout(() => {
        textarea.focus();
        const newPosition = selectionStart + newCheckbox.length;
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
      }, 0);

      return;
    }

    if (e.key === 'Tab' && match && !e.shiftKey) {
      e.preventDefault();

      const [, indent, text] = match;
      const newIndent = indent + '  ';
      const newLine = `${newIndent}- [ ] ${text}`;

      const contentBeforeLine = value.substring(0, lineStartPos);
      const contentAfterLine = value.substring(lineStartPos + currentLine.length);

      const newContent = contentBeforeLine + newLine + contentAfterLine;

      setEditContent(newContent);

      // Set cursor position at the end of the new line
      setTimeout(() => {
        textarea.focus();
        const newPosition = lineStartPos + newLine.length;
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
      }, 0);
    }
  };

  // Function to handle checkbox click in markdown content
  const handleCheckboxClick = (todoId: string, lineIndex: number, checked: boolean) => {
    if (!currentFile) return;

    const todo = currentFile.todos.find(t => t.id === todoId);
    if (!todo) return;

    const lines = todo.content.split('\n');
    if (lineIndex >= lines.length) return;

    const line = lines[lineIndex];
    const newLine = line.replace(/- \[[x ]\]/i, `- [${checked ? 'x' : ' '}]`);
    lines[lineIndex] = newLine;

    const newContent = lines.join('\n');
    updateTodoFromMarkdown(currentFile.id, todoId, `- [${todo.completed ? 'x' : ' '}] ${todo.title}\n${newContent}`);
  };

  // Find the current folder and file
  const currentFolder = folders.find(f => f.id === activeFolder);

  // Find the current file either by activeFile or the first file in the active folder
  const currentFile = activeFile 
    ? folders.flatMap(f => f.files).find(f => f.id === activeFile)
    : currentFolder?.files[0];

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentFile && newTodo.title.trim()) {
      addTodo(currentFile.id, {
        title: newTodo.title,
        content: newTodo.content,
        completed: false
      });
      setNewTodo({ title: '', content: '' });
    } else if (currentFolder && !currentFile && newTodo.title.trim()) {
      // If there's no current file but there is a folder, create a new file with this todo
      const newFileName = "New File";
      addFile(currentFolder.id, newFileName);
      // The addFile function sets the new file as active, so we can add the todo in the next render
      setTimeout(() => {
        const newFile = currentFolder.files.find(f => f.name === newFileName);
        if (newFile) {
          addTodo(newFile.id, {
            title: newTodo.title,
            content: newTodo.content,
            completed: false
          });
          setNewTodo({ title: '', content: '' });
        }
      }, 0);
    }
  };

  const handleExport = () => {
    if (!currentFile) return;
    const markdown = exportToMarkdown(currentFile.id);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFile.name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentFolder) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        importFromMarkdown(currentFolder.id, content);
      }
    };
    reader.readAsText(file);
  };

  const startEditing = (todo: { id: string; completed: boolean; title: string; content: string }) => {
    setEditingTodo(todo.id);
    setEditContent(`- [${todo.completed ? 'x' : ' '}] ${todo.title}\n${todo.content}`);
  };

  const handleSave = (todoId: string) => {
    if (!currentFile) return;
    updateTodoFromMarkdown(currentFile.id, todoId, editContent);
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

  if (!currentFile && currentFolder.files.length > 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a file from the sidebar to view todos
      </div>
    );
  }

  if (!currentFile && currentFolder.files.length === 0) {
    // Create a default file if there are no files
    setTimeout(() => {
      addFile(currentFolder.id, "Default File");
    }, 0);

    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Creating a default file...
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentFolder.name}</h2>
            <div className="text-gray-600 text-sm flex items-center">
              <FileText size={14} className="mr-1" />
              {currentFile?.name}
            </div>
          </div>
          <div className="flex gap-2">
            <Popover
              content={
                <div>
                  <div className="font-medium">Export</div>
                  <div className="text-gray-600">Export todos as a Markdown file</div>
                </div>
              }
            >
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Download size={20} />
              </button>
            </Popover>
            <Popover
              content={
                <div>
                  <div className="font-medium">Import</div>
                  <div className="text-gray-600">Import todos from a Markdown file</div>
                </div>
              }
            >
              <label className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                <Upload size={20} />
                <input
                  type="file"
                  accept=".md"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
            </Popover>
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
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <MarkdownToolbar onInsert={handleInsertMarkdown} />
            <textarea
              id="new-todo-content"
              value={newTodo.content}
              onChange={(e) => setNewTodo({ ...newTodo, content: e.target.value })}
              onKeyDown={handleNewTodoKeyDown}
              placeholder="Description (Markdown supported)"
              className="w-full h-24 px-4 py-2 border-t border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Todo
          </button>
        </form>

        <div className="space-y-4">
          {currentFile?.todos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${
                todo.completed ? 'border-green-500' : 'border-blue-500'
              }`}
            >
              <div className="flex items-center mb-2">
                <Popover
                  content={
                    <div>
                      <div className="font-medium">Toggle Status</div>
                      <div className="text-gray-600">{todo.completed ? 'Mark as incomplete' : 'Mark as complete'}</div>
                    </div>
                  }
                >
                  <button
                    onClick={() => toggleTodo(currentFile.id, todo.id)}
                    className={`p-2 rounded-full mr-2 ${
                      todo.completed ? 'bg-green-500 text-white' : 'border-2 border-gray-300'
                    }`}
                  >
                    {todo.completed && <Check size={16} />}
                  </button>
                </Popover>
                <h3 className={`text-lg font-medium flex-grow ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.title}
                </h3>
                <div className="flex gap-2">
                  {editingTodo === todo.id ? (
                    <Popover
                      content={
                        <div>
                          <div className="font-medium">Save</div>
                          <div className="text-gray-600">Save changes to this todo</div>
                        </div>
                      }
                    >
                      <button
                        onClick={() => handleSave(todo.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Save
                      </button>
                    </Popover>
                  ) : (
                    <Popover
                      content={
                        <div>
                          <div className="font-medium">Edit</div>
                          <div className="text-gray-600">Edit this todo</div>
                        </div>
                      }
                    >
                      <button
                        onClick={() => startEditing(todo)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Edit
                      </button>
                    </Popover>
                  )}
                  <Popover
                    content={
                      <div>
                        <div className="font-medium">Delete</div>
                        <div className="text-gray-600">Delete this todo</div>
                      </div>
                    }
                  >
                    <button
                      onClick={() => deleteTodo(currentFile.id, todo.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Popover>
                </div>
              </div>
              <div className="pl-10">
                {editingTodo === todo.id ? (
                  <div className="space-y-4">
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <MarkdownToolbar onInsert={handleInsertEditMarkdown} />
                      <textarea
                        id="edit-todo-content"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={handleEditTodoKeyDown}
                        className="w-full h-32 px-3 py-2 border-t border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="prose prose-sm bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Preview:</h4>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          li: ({ node, ...props }) => {
                            const { children } = props;
                            // Check if this is a task item (checkbox)
                            if (
                              node.children[0].type === 'paragraph' &&
                              node.children[0].children[0].type === 'text' &&
                              /^\[[ x]\]/.test(node.children[0].children[0].value)
                            ) {
                              const checked = node.children[0].children[0].value.startsWith('[x]');
                              // For preview, we don't need interactive checkboxes
                              return (
                                <li {...props}>
                                  <span className="inline-flex items-center">
                                    <span className={`inline-flex items-center justify-center w-4 h-4 mr-1 ${
                                      checked ? 'bg-green-500 text-white' : 'border border-gray-300 bg-white'
                                    } rounded`}>
                                      {checked && <Check size={12} />}
                                    </span>
                                    {children}
                                  </span>
                                </li>
                              );
                            }
                            return <li {...props} />;
                          }
                        }}
                      >
                        {editContent.split('\n').slice(1).join('\n')}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        li: ({ node, ...props }) => {
                          const { children } = props;
                          // Check if this is a task item (checkbox)
                          if (
                            node.children[0].type === 'paragraph' &&
                            node.children[0].children[0].type === 'text' &&
                            /^\[[ x]\]/.test(node.children[0].children[0].value)
                          ) {
                            const checked = node.children[0].children[0].value.startsWith('[x]');
                            // Get the line index to update the correct line
                            const content = todo.content;
                            const lines = content.split('\n');
                            const lineText = node.children[0].children[0].value;
                            const lineIndex = lines.findIndex(line => line.includes(lineText));

                            return (
                              <li {...props}>
                                <span className="inline-flex items-center">
                                  <InteractiveCheckbox 
                                    checked={checked} 
                                    onChange={() => handleCheckboxClick(todo.id, lineIndex, !checked)} 
                                  />
                                  {children}
                                </span>
                              </li>
                            );
                          }
                          return <li {...props} />;
                        }
                      }}
                    >
                      {todo.content}
                    </ReactMarkdown>
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
