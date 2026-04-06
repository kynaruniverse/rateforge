import React from 'react';
import ReactDOM from 'react-dom';

const { useState, useEffect } = React;

// ─────────────────────────────────────────────────────────────────────────────
// 1. COMPONENTS
//
// A component is a function that returns JSX — a syntax that looks like HTML
// but lets you embed JavaScript expressions inside { curly braces }.
// ─────────────────────────────────────────────────────────────────────────────

function Greeting ({ name }) {
  return <h2 className="greeting">Hello, {name}!</h2>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PROPS
//
// Props are the inputs to a component. They flow one way: parent → child.
// Destructure them in the function signature for cleaner code.
// ─────────────────────────────────────────────────────────────────────────────

function Badge ({ label, count }) {
  return (
    <span className="badge">
      {label}: <strong>{count}</strong>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. useState — LOCAL STATE
//
// useState(initialValue) returns [currentValue, setter].
// Calling the setter re-renders the component with the new value.
// ─────────────────────────────────────────────────────────────────────────────

function AddTodo ({ onAdd }) {
  const [text, setText] = useState('');

  function handleSubmit (e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');        // clear the input after adding
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        className="add-input"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What needs to be done?"
      />
      <button className="btn btn-primary" type="submit">Add</button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LISTS AND KEYS
//
// Render arrays with .map(). Each item needs a unique `key` prop so React can
// track which items changed, were added, or removed efficiently.
// ─────────────────────────────────────────────────────────────────────────────

function TodoItem ({ todo, onToggle, onDelete }) {
  return (
    <li className={'todo-item' + (todo.done ? ' done' : '')}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
      />
      <span className="todo-text">{todo.text}</span>
      <button className="btn btn-delete" onClick={() => onDelete(todo.id)}>✕</button>
    </li>
  );
}

function TodoList ({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return <p className="empty">Nothing here. Add a task above!</p>;
  }
  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. useEffect — SIDE EFFECTS
//
// useEffect runs after every render (or when specified dependencies change).
// Use it for localStorage, timers, network requests, subscriptions, etc.
//
// The dependency array controls when the effect re-runs:
//   []         → runs once on mount
//   [a, b]     → runs when a or b changes
//   (omitted)  → runs after every render
// ─────────────────────────────────────────────────────────────────────────────

function useSavedTodos () {
  const [todos, setTodos] = useState(() => {
    // Lazy initialiser: read from localStorage once on first render
    try {
      return JSON.parse(localStorage.getItem('react-todos')) || [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    // Persist to localStorage whenever todos change
    localStorage.setItem('react-todos', JSON.stringify(todos));
  }, [todos]);

  return [todos, setTodos];
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. COMPOSITION — PUTTING IT ALL TOGETHER
//
// Components compose just like functions. The top-level component owns the
// shared state and passes pieces of it down as props.
// ─────────────────────────────────────────────────────────────────────────────

var nextId = 1;

function TodoApp () {
  const [todos, setTodos] = useSavedTodos();
  const [filter, setFilter] = useState('all');  // 'all' | 'active' | 'done'

  function addTodo (text) {
    setTodos(prev => [...prev, { id: nextId++, text, done: false }]);
  }

  function toggleTodo (id) {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
  }

  function deleteTodo (id) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function clearDone () {
    setTodos(prev => prev.filter(t => !t.done));
  }

  const filtered = todos.filter(t =>
    filter === 'all' ? true :
      filter === 'active' ? !t.done :
        t.done
  );

  const remaining = todos.filter(t => !t.done).length;
  const doneCount = todos.length - remaining;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
        <Greeting name="Developer" />
        <div className="badges">
          <Badge label="remaining" count={remaining} />
          <Badge label="done" count={doneCount} />
        </div>
      </header>

      <AddTodo onAdd={addTodo} />

      <div className="filters">
        {['all', 'active', 'done'].map(f => (
          <button
            key={f}
            className={'btn' + (filter === f ? ' active' : '')}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        {doneCount > 0 && (
          <button className="btn btn-clear" onClick={clearDone}>
            clear done
          </button>
        )}
      </div>

      <TodoList todos={filtered} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
}

// Mount — React 18+ uses createRoot instead of the legacy ReactDOM.render()
ReactDOM.createRoot(document.getElementById('root')).render(<TodoApp />);
