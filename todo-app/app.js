'use strict';

/* ─── State ──────────────────────────────────────────────────── */
const STORAGE_KEY = 'todos';
let todos = loadFromStorage();

/* ─── DOM refs ───────────────────────────────────────────────── */
const addForm     = document.getElementById('addForm');
const todoInput   = document.getElementById('todoInput');
const todoList    = document.getElementById('todoList');
const todoCount   = document.getElementById('todoCount');
const emptyState  = document.getElementById('emptyState');
const clearAllBtn = document.getElementById('clearAllBtn');

/* ─── Persistence ────────────────────────────────────────────── */
function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/* ─── Escape HTML (XSS prevention) ──────────────────────────── */
function escHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ─── Render ─────────────────────────────────────────────────── */
function render() {
  todoList.innerHTML = todos.map((todo, index) => `
    <li class="todo-item${todo.done ? ' done' : ''}" data-index="${index}">
      <input
        type="checkbox"
        class="todo-checkbox"
        ${todo.done ? 'checked' : ''}
        aria-label="Mark as done"
        data-action="toggle"
      />
      <span class="todo-text">${escHtml(todo.text)}</span>
      <button
        class="btn-delete"
        title="Delete todo"
        data-action="delete"
        aria-label="Delete todo"
      >🗑</button>
    </li>`).join('');

  const count = todos.length;
  const done  = todos.filter(t => t.done).length;
  todoCount.textContent = count === 0
    ? ''
    : `${done}/${count} completed`;

  emptyState.classList.toggle('hidden', count > 0);
  clearAllBtn.classList.toggle('hidden', count === 0);
}

/* ─── Actions ────────────────────────────────────────────────── */
function addTodo(text) {
  todos.push({ text: text.trim(), done: false });
  saveToStorage();
  render();
}

function deleteTodo(index) {
  if (index < 0 || index >= todos.length) return;
  todos.splice(index, 1);
  saveToStorage();
  render();
}

function toggleDone(index) {
  if (index < 0 || index >= todos.length) return;
  todos[index].done = !todos[index].done;
  saveToStorage();
  render();
}

function clearAll() {
  if (todos.length === 0) return;
  if (!confirm('Delete all todos? This cannot be undone.')) return;
  todos = [];
  saveToStorage();
  render();
}

/* ─── Event listeners ────────────────────────────────────────── */
addForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  addTodo(text);
  todoInput.value = '';
  todoInput.focus();
});

todoList.addEventListener('click', e => {
  const item = e.target.closest('[data-index]');
  if (!item) return;
  const index = parseInt(item.dataset.index, 10);
  const action = e.target.closest('[data-action]');
  if (action && action.dataset.action === 'delete') {
    deleteTodo(index);
  }
});

todoList.addEventListener('change', e => {
  const item = e.target.closest('[data-index]');
  if (!item) return;
  const index = parseInt(item.dataset.index, 10);
  if (e.target.dataset.action === 'toggle') {
    toggleDone(index);
  }
});

clearAllBtn.addEventListener('click', clearAll);

/* ─── Init ───────────────────────────────────────────────────── */
render();
