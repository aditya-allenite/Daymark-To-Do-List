const STORAGE_KEY = 'daymark.tasks.v1'

const form = document.querySelector('#task-form')
const input = document.querySelector('#task-input')
const list = document.querySelector('#task-list')
const emptyState = document.querySelector('#empty-state')
const clearCompletedButton = document.querySelector('#clear-completed')
const filterButtons = [...document.querySelectorAll('.filter')]

let tasks = loadTasks()
let currentFilter = 'all'

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter((task) => task && typeof task.id === 'string' && typeof task.text === 'string') : []
  } catch {
    return []
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function render() {
  const completed = tasks.filter((task) => task.completed).length
  const active = tasks.length - completed
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const visibleTasks = tasks.filter((task) => currentFilter === 'all' || (currentFilter === 'done' ? task.completed : !task.completed))

  document.querySelector('#task-count').textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`
  document.querySelector('#all-count').textContent = tasks.length
  document.querySelector('#active-count').textContent = active
  document.querySelector('#done-count').textContent = completed
  document.querySelector('#progress-percent').textContent = `${percent}%`
  document.querySelector('#progress-ring').style.setProperty('--progress', `${percent}%`)
  document.querySelector('#progress-title').textContent = tasks.length && active === 0 ? 'Beautifully done' : tasks.length ? 'You’re making progress' : 'A fresh start'
  document.querySelector('#progress-caption').textContent = tasks.length ? `${completed} of ${tasks.length} completed` : 'Add your first task'
  document.querySelector('#footer-summary').textContent = active ? `${active} ${active === 1 ? 'task' : 'tasks'} left to go` : tasks.length ? 'You did what you set out to do.' : 'Small steps count.'

  list.replaceChildren(...visibleTasks.map(createTaskElement))
  const isEmpty = visibleTasks.length === 0
  emptyState.hidden = !isEmpty
  if (isEmpty && tasks.length) {
    document.querySelector('#empty-title').textContent = currentFilter === 'done' ? 'Nothing completed just yet.' : 'All clear for now.'
    document.querySelector('#empty-copy').textContent = currentFilter === 'done' ? 'Finish a task and it will show up here.' : 'You have no tasks in progress.'
  } else {
    document.querySelector('#empty-title').textContent = 'Your day is yours.'
    document.querySelector('#empty-copy').textContent = 'Add a task above and start with one small win.'
  }
  clearCompletedButton.hidden = completed === 0
}

function createTaskElement(task) {
  const item = document.createElement('li')
  item.className = `task-item${task.completed ? ' completed' : ''}`
  const checkbox = document.createElement('button')
  checkbox.type = 'button'
  checkbox.className = 'task-check'
  checkbox.setAttribute('aria-label', task.completed ? `Mark ${task.text} as in progress` : `Complete ${task.text}`)
  checkbox.setAttribute('aria-pressed', String(task.completed))
  checkbox.textContent = '✓'
  checkbox.addEventListener('click', () => toggleTask(task.id))

  const text = document.createElement('span')
  text.className = 'task-text'
  text.textContent = task.text

  const remove = document.createElement('button')
  remove.type = 'button'
  remove.className = 'delete-task'
  remove.setAttribute('aria-label', `Delete ${task.text}`)
  remove.textContent = '×'
  remove.addEventListener('click', () => deleteTask(task.id))

  item.append(checkbox, text, remove)
  return item
}

function toggleTask(id) {
  tasks = tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task)
  saveTasks()
  render()
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id)
  saveTasks()
  render()
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const text = input.value.trim()
  if (!text) return
  tasks.unshift({ id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, text, completed: false })
  currentFilter = 'all'
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === 'all'
    button.classList.toggle('active', active)
    button.setAttribute('aria-pressed', String(active))
  })
  saveTasks()
  render()
  input.value = ''
  input.focus()
})

filterButtons.forEach((button) => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter
  filterButtons.forEach((item) => {
    const active = item === button
    item.classList.toggle('active', active)
    item.setAttribute('aria-pressed', String(active))
  })
  render()
}))

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed)
  saveTasks()
  render()
})

const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
document.querySelector('#today-label').textContent = dateLabel.format(new Date()).toUpperCase()
render()
