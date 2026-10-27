const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const progressFill = document.getElementById('progressFill');
const today = document.getElementById('today');
const filterButtons = document.querySelectorAll('.filter');

let tasks = [];
let currentFilter = 'all';

try {
  tasks = JSON.parse(localStorage.getItem('daytask-tasks')) || [];
} catch {
  tasks = [];
}

today.textContent = new Intl.DateTimeFormat('en', {
  weekday: 'short', month: 'short', day: 'numeric'
}).format(new Date());

function saveTasks() {
  localStorage.setItem('daytask-tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement('li');
    item.className = `task-item${task.completed ? ' done' : ''}`;

    const check = document.createElement('button');
    check.className = 'check-btn';
    check.type = 'button';
    check.setAttribute('aria-label', task.completed ? 'Mark as active' : 'Mark as completed');
    check.textContent = task.completed ? '✓' : '';
    check.addEventListener('click', () => {
      tasks = tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
      saveTasks();
      renderTasks();
    });

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const remove = document.createElement('button');
    remove.className = 'delete-btn';
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Delete task');
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(check, text, remove);
    taskList.appendChild(item);
  });

  const completed = tasks.filter(task => task.completed).length;
  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  progressFill.style.width = tasks.length ? `${(completed / tasks.length) * 100}%` : '0%';
  emptyState.style.display = visibleTasks.length ? 'none' : 'block';
  if (!tasks.length) {
    emptyState.querySelector('h3').textContent = 'No tasks here yet';
    emptyState.querySelector('p').textContent = 'Add a task above and make today count.';
  } else if (!visibleTasks.length) {
    emptyState.querySelector('h3').textContent = 'Nothing to show';
    emptyState.querySelector('p').textContent = 'Try another filter to see your tasks.';
  }
}

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }
  tasks.unshift({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, completed: false });
  saveTasks();
  taskInput.value = '';
  currentFilter = 'all';
  filterButtons.forEach(button => button.classList.toggle('active', button.dataset.filter === 'all'));
  renderTasks();
  taskInput.focus();
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(b => b.classList.toggle('active', b === button));
    renderTasks();
  });
});

renderTasks();
