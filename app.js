// ═════════════════════════════════════════════════════════════
// MI ASISTENTE - APP.JS (LÓGICA COMPLETA)
// ═════════════════════════════════════════════════════════════

let currentView = 1;
let projView = 1;
let budgetView = 1;
let currentSection = 'habitos';

let categories = [];
let habits = [];
let projects = [];
let budgets = [];

let currentCatIdx = -1;
let currentHabitIdx = -1;
let currentProjIdx = -1;
let currentBudgetIdx = -1;
let currentBudgetCatIdx = -1;
let currentBudgetSubIdx = -1;
let currentTaskIdx = -1;

let editingCatIdx = -1;
let editingHabitIdx = -1;
let editingProjIdx = -1;
let editingBudgetIdx = -1;
let deleteTarget = null;

const EMOJIS_CAT = ['💪', '🧠', '🏃', '🎵', '📚', '🎨', '💻', '🏋️', '🧘', '⚽', '🚴', '📱'];
const EMOJIS_HABIT = ['🌅', '💧', '📖', '🎯', '🏆', '⏰', '💪', '🧘', '🚶', '🍎', '😴', '💊'];
const EMOJIS_PROJ = ['🚀', '📱', '🎯', '💼', '🏠', '📝', '🎓', '💡', '🌟', '🔧', '📊', '✏️'];
const EMOJIS_BUDGET = ['🛒', '🍔', '🚗', '🏠', '👕', '💊', '✈️', '🎮', '📚', '💅', '🎁', '🍕'];

const COLORS = [
  {bg: '#7c6af5', text: '#fff'},
  {bg: '#4ecdc4', text: '#fff'},
  {bg: '#f5a623', text: '#000'},
  {bg: '#ff6b6b', text: '#fff'},
  {bg: '#a78bfa', text: '#fff'},
  {bg: '#fb923c', text: '#fff'},
  {bg: '#38bdf8', text: '#fff'},
  {bg: '#22d3ee', text: '#000'}
];

// INICIALIZACIÓN
function init() {
  loadData();
  renderCatList();
  renderProjList();
  renderBudgetList();
  initEmojis();
  updateNavigation();
  switchSection('habitos');
}

// HELPERS
function getLocalDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function bgClose(event, overlayId) {
  if (event.target.id === overlayId) {
    document.getElementById(overlayId).classList.remove('open');
  }
}

// NAVEGACIÓN
function goTo(view) {
  currentView = view;
  updateViews();
}

function goToProj(view) {
  projView = view;
  updateProjViews();
}

function goToBudget(view) {
  budgetView = view;
  updateBudgetViews();
}

function switchSection(section) {
  currentSection = section;
  updateNavigation();
  
  // Mostrar/ocultar secciones
  document.getElementById('v1').parentElement.style.display = section === 'habitos' ? 'block' : 'none';
  document.getElementById('pv1').parentElement.style.display = section === 'proyectos' ? 'block' : 'none';
  document.getElementById('bv1').parentElement.style.display = section === 'presupuestos' ? 'block' : 'none';
  
  if (section === 'habitos') {
    currentView = 1;
    updateViews();
  } else if (section === 'proyectos') {
    projView = 1;
    updateProjViews();
  } else if (section === 'presupuestos') {
    budgetView = 1;
    updateBudgetViews();
  }
}

function updateNavigation() {
  document.getElementById('navHabitos').classList.remove('active');
  document.getElementById('navProyectos').classList.remove('active');
  document.getElementById('navPresupuestos').classList.remove('active');
  
  if (currentSection === 'habitos') {
    document.getElementById('navHabitos').classList.add('active');
  } else if (currentSection === 'proyectos') {
    document.getElementById('navProyectos').classList.add('active');
  } else if (currentSection === 'presupuestos') {
    document.getElementById('navPresupuestos').classList.add('active');
  }
}

function updateViews() {
  const views = ['v1', 'v2', 'v3'];
  views.forEach((v, idx) => {
    const view = document.getElementById(v);
    if (idx + 1 === currentView) {
      view.classList.remove('slide-right');
    } else {
      view.classList.add('slide-right');
    }
  });
  
  if (currentView === 2) renderHabitList();
  if (currentView === 3) renderCalendar();
}

function updateProjViews() {
  const views = ['pv1', 'pv2', 'pv3'];
  views.forEach((v, idx) => {
    const view = document.getElementById(v);
    if (idx + 1 === projView) {
      view.classList.remove('slide-right');
    } else {
      view.classList.add('slide-right');
    }
  });
  
  if (projView === 1) renderProjList();
  if (projView === 2) renderTaskList();
  if (projView === 3) renderSubtaskList();
}

function updateBudgetViews() {
  const views = ['bv1', 'bv2', 'bv3', 'bv4'];
  views.forEach((v, idx) => {
    const view = document.getElementById(v);
    if (idx + 1 === budgetView) {
      view.classList.remove('slide-right');
    } else {
      view.classList.add('slide-right');
    }
  });
  
  if (budgetView === 1) renderBudgetList();
  if (budgetView === 2) renderBudgetCatList();
  if (budgetView === 3) renderBudgetSubList();
  if (budgetView === 4) renderShoppingList();
}

// DATOS
function loadData() {
  const saved = localStorage.getItem('appData');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      categories = data.categories || [];
      habits = data.habits || [];
      projects = data.projects || [];
      budgets = data.budgets || [];
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }
}

function saveData() {
  const data = { categories, habits, projects, budgets };
  localStorage.setItem('appData', JSON.stringify(data));
}

function exportData() {
  const data = { categories, habits, projects, budgets, exportDate: new Date().toISOString() };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `respaldo-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓ Respaldo exportado');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      categories = data.categories || [];
      habits = data.habits || [];
      projects = data.projects || [];
      budgets = data.budgets || [];
      saveData();
      location.reload();
    } catch (err) {
      showToast('❌ Error al importar');
    }
  };
  reader.readAsText(file);
}

// EMOJIS
function initEmojis() {
  renderEmojiGrid('catEmojiGrid', EMOJIS_CAT, 'cat');
  renderEmojiGrid('habitEmojiGrid', EMOJIS_HABIT, 'habit');
  renderEmojiGrid('projEmojiGrid', EMOJIS_PROJ, 'proj');
  renderEmojiGrid('budgetEmojiGrid', EMOJIS_BUDGET, 'budget');
  renderEmojiGrid('budgetCatEmojiGrid', EMOJIS_CAT, 'budgetCat');
  renderColorGrid('catBgRow', 'cat');
  renderColorGrid('habitColorRow', 'habit');
  renderColorGrid('projBgRow', 'proj');
  renderColorGrid('budgetColorRow', 'budget');
}

function renderEmojiGrid(containerId, emojis, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  
  emojis.forEach((emoji, idx) => {
    const btn = document.createElement('div');
    btn.className = 'eo';
    btn.textContent = emoji;
    btn.onclick = () => selectEmoji(type, idx);
    container.appendChild(btn);
  });
  
  // Select first by default
  if (container.firstChild) {
    container.firstChild.classList.add('sel');
  }
}

function renderColorGrid(containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  
  COLORS.forEach((color, idx) => {
    const btn = document.createElement('div');
    btn.className = 'co';
    btn.style.background = color.bg;
    btn.dataset.color = color.bg;
    btn.onclick = () => selectColor(type, idx);
    container.appendChild(btn);
  });
  
  // Select first by default
  if (container.firstChild) {
    container.firstChild.classList.add('sel');
  }
}

function renderBgColorGrid(containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  
  COLORS.forEach((color, idx) => {
    const btn = document.createElement('div');
    btn.className = 'bgco';
    btn.style.background = color.bg;
    btn.dataset.color = color.bg;
    btn.onclick = () => selectBgColor(type, idx);
    container.appendChild(btn);
  });
  
  // Select first by default
  if (container.firstChild) {
    container.firstChild.classList.add('sel');
  }
}

function selectEmoji(type, idx) {
  const grids = {
    'cat': 'catEmojiGrid',
    'habit': 'habitEmojiGrid',
    'proj': 'projEmojiGrid',
    'budget': 'budgetEmojiGrid',
    'budgetCat': 'budgetCatEmojiGrid'
  };
  
  const grid = document.getElementById(grids[type]);
  if (!grid) return;
  
  grid.querySelectorAll('.eo').forEach((el, i) => {
    el.classList.toggle('sel', i === idx);
  });
}

function selectColor(type, idx) {
  const grids = {
    'habit': 'habitColorRow',
  };
  
  const grid = document.getElementById(grids[type]);
  if (!grid) return;
  
  grid.querySelectorAll('.co').forEach((el, i) => {
    el.classList.toggle('sel', i === idx);
  });
}

function selectBgColor(type, idx) {
  const grids = {
    'cat': 'catBgRow',
    'proj': 'projBgRow',
    'budget': 'budgetColorRow'
  };
  
  const grid = document.getElementById(grids[type]);
  if (!grid) return;
  
  grid.querySelectorAll('.bgco').forEach((el, i) => {
    el.classList.toggle('sel', i === idx);
  });
}

function selectGoalPreset(days) {
  document.getElementById('fGoalDays').value = days;
  document.querySelectorAll('.gp').forEach(el => {
    el.classList.remove('sel');
  });
  event?.target?.classList.add('sel');
}

function syncGoalInput() {
  document.querySelectorAll('.gp').forEach(el => {
    el.classList.remove('sel');
  });
}

// ═══ HÁBITOS ═══

function renderCatList() {
  const container = document.getElementById('catList');
  if (!container) return;
  container.innerHTML = '';
  
  if (categories.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-ico">📂</div>
        <div class="empty-txt">No hay categorías<br/>Crea una para empezar</div>
      </div>
    `;
    updateCatSub();
    return;
  }
  
  categories.forEach((cat, idx) => {
    const catHabits = habits.filter(h => h.catIdx === idx);
    const completed = catHabits.filter(h => h.progress >= h.goalDays).length;
    const pct = catHabits.length === 0 ? 0 : Math.round((completed / catHabits.length) * 100);
    
    const card = document.createElement('div');
    card.className = 'cat-card';
    card.onclick = () => {
      currentCatIdx = idx;
      currentView = 2;
      updateViews();
    };
    
    card.innerHTML = `
      <div class="cat-card-top">
        <div class="cat-left">
          <div class="cat-emoji">${cat.emoji}</div>
          <div>
            <div class="cat-name">${cat.name}</div>
            <div class="cat-count">${catHabits.length} hábito${catHabits.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="cat-pct">${pct}%</div>
      </div>
      <div class="cat-prog">
        <div class="cat-prog-fill" style="width: ${pct}%; background: ${cat.color || '#7c6af5'};"></div>
      </div>
      <div class="cat-prog-stats">
        <span>${completed} completados</span>
        <span>${catHabits.length - completed} en progreso</span>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  updateCatSub();
}

function updateCatSub() {
  const total = habits.length;
  const completed = habits.filter(h => h.progress >= h.goalDays).length;
  const elem = document.getElementById('v1Sub');
  if (elem) elem.textContent = `${completed} de ${total} hábitos completados`;
}

function openCatModal() {
  editingCatIdx = -1;
  document.getElementById('catModalTitle').textContent = 'Nueva Categoría';
  document.getElementById('fcName').value = '';
  renderBgColorGrid('catBgRow', 'cat');
  document.getElementById('catOverlay').classList.add('open');
  selectEmoji('cat', 0);
}

function editCurCat() {
  if (currentCatIdx < 0) return;
  editingCatIdx = currentCatIdx;
  const cat = categories[currentCatIdx];
  
  document.getElementById('catModalTitle').textContent = 'Editar Categoría';
  document.getElementById('fcName').value = cat.name;
  renderBgColorGrid('catBgRow', 'cat');
  document.getElementById('catOverlay').classList.add('open');
  
  selectEmoji('cat', EMOJIS_CAT.indexOf(cat.emoji));
  selectBgColor('cat', COLORS.findIndex(c => c.bg === cat.color));
}

function closeCatModal() {
  document.getElementById('catOverlay').classList.remove('open');
  editingCatIdx = -1;
}

function saveCat() {
  const name = document.getElementById('fcName').value.trim();
  if (!name) {
    showToast('❌ Nombre requerido');
    return;
  }
  
  const emoji = document.querySelector('#catEmojiGrid .eo.sel');
  const emojiText = emoji ? emoji.textContent : '��';
  
  const color = document.querySelector('#catBgRow .bgco.sel');
  const colorValue = color ? color.dataset.color : '#7c6af5';
  
  if (editingCatIdx >= 0) {
    categories[editingCatIdx] = { name, emoji: emojiText, color: colorValue };
  } else {
    categories.push({ name, emoji: emojiText, color: colorValue });
  }
  
  saveData();
  renderCatList();
  closeCatModal();
  showToast('✓ Categoría guardada');
}

function askDeleteCat() {
  if (currentCatIdx < 0) return;
  deleteTarget = { type: 'cat', idx: currentCatIdx };
  
  const cat = categories[currentCatIdx];
  const catHabits = habits.filter(h => h.catIdx === currentCatIdx);
  
  document.getElementById('confTitle').textContent = 'Eliminar categoría';
  document.getElementById('confMsg').textContent = 
    `Se eliminarán ${catHabits.length} hábito(s). Esta acción no se puede deshacer.`;
  document.getElementById('confWrap').classList.add('open');
}

function doDelete() {
  if (!deleteTarget) return;
  
  if (deleteTarget.type === 'cat') {
    const idx = deleteTarget.idx;
    habits = habits.filter(h => h.catIdx !== idx);
    categories.splice(idx, 1);
    currentView = 1;
    updateViews();
    renderCatList();
  } else if (deleteTarget.type === 'habit') {
    habits.splice(deleteTarget.idx, 1);
    renderHabitList();
  } else if (deleteTarget.type === 'proj') {
    projects.splice(deleteTarget.idx, 1);
    projView = 1;
    updateProjViews();
  } else if (deleteTarget.type === 'task') {
    projects[deleteTarget.projIdx].tasks.splice(deleteTarget.taskIdx, 1);
    renderTaskList();
  }
  
  saveData();
  closeConf();
  showToast('✓ Eliminado');
}

function closeConf() {
  document.getElementById('confWrap').classList.remove('open');
  deleteTarget = null;
}

function renderHabitList() {
  if (currentCatIdx < 0) return;
  
  const cat = categories[currentCatIdx];
  const catHabits = habits.filter(h => h.catIdx === currentCatIdx);
  
  document.getElementById('v2Emoji').textContent = cat.emoji;
  document.getElementById('v2Name').textContent = cat.name;
  
  const completed = catHabits.filter(h => h.progress >= h.goalDays).length;
  document.getElementById('v2Sub').textContent = 
    `${completed} de ${catHabits.length} completados`;
  
  const container = document.getElementById('habitList');
  container.innerHTML = '';
  
  if (catHabits.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-ico">✨</div>
        <div class="empty-txt">Sin hábitos en esta categoría</div>
      </div>
    `;
    return;
  }
  
  catHabits.forEach((habit) => {
    const absIdx = habits.indexOf(habit);
    const pct = (habit.progress / habit.goalDays) * 100;
    
    const row = document.createElement('div');
    row.className = 'habit-row';
    row.style.borderLeftColor = habit.color;
    row.onclick = () => {
      currentHabitIdx = absIdx;
      currentView = 3;
      updateViews();
    };
    
    row.innerHTML = `
      <div class="row-emoji">${habit.emoji}</div>
      <div class="row-info">
        <div class="row-name">${habit.name}</div>
        <div class="row-meta">
          <span class="row-badge" style="background: ${habit.color}25; color: ${habit.color};">
            ${habit.progress}/${habit.goalDays}
          </span>
          <span style="font-size:11px;color:var(--muted)">${getLocalDate(habit.endDate)}</span>
        </div>
        <div class="mini-prog">
          <div class="mini-fill" style="width: ${pct}%; background: ${habit.color};"></div>
        </div>
      </div>
      <div class="row-arrow">›</div>
    `;
    
    container.appendChild(row);
  });
}

function openHabitModal() {
  if (currentCatIdx < 0) return;
  editingHabitIdx = -1;
  
  document.getElementById('habitModalTitle').textContent = 'Nuevo Hábito';
  document.getElementById('fHName').value = '';
  document.getElementById('fGoalDays').value = '30';
  document.getElementById('fStartDate').valueAsDate = new Date();
  document.getElementById('fEndDate').valueAsDate = new Date(Date.now() + 30 * 86400000);
  
  document.getElementById('fHabitCat').innerHTML = '';
  categories.forEach((cat, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = cat.name;
    if (idx === currentCatIdx) opt.selected = true;
    document.getElementById('fHabitCat').appendChild(opt);
  });
  
  renderColorGrid('habitColorRow', 'habit');
  renderEmojiGrid('habitEmojiGrid', EMOJIS_HABIT, 'habit');
  
  // Renderizar goal presets
  const presetsContainer = document.getElementById('goalPresets');
  presetsContainer.innerHTML = '';
  [7, 14, 21, 30, 60, 90].forEach(days => {
    const btn = document.createElement('button');
    btn.className = 'gp';
    btn.textContent = `${days} días`;
    btn.onclick = () => selectGoalPreset(days);
    if (days === 30) btn.classList.add('sel');
    presetsContainer.appendChild(btn);
  });
  
  document.getElementById('habitOverlay').classList.add('open');
}

function editCurHabit() {
  if (currentHabitIdx < 0) return;
  editingHabitIdx = currentHabitIdx;
  const habit = habits[currentHabitIdx];
  
  document.getElementById('habitModalTitle').textContent = 'Editar Hábito';
  document.getElementById('fHName').value = habit.name;
  document.getElementById('fGoalDays').value = habit.goalDays;
  document.getElementById('fStartDate').valueAsDate = new Date(habit.startDate + 'T00:00:00');
  document.getElementById('fEndDate').valueAsDate = new Date(habit.endDate + 'T00:00:00');
  
  document.getElementById('fHabitCat').innerHTML = '';
  categories.forEach((cat, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = cat.name;
    if (idx === habit.catIdx) opt.selected = true;
    document.getElementById('fHabitCat').appendChild(opt);
  });
  
  renderColorGrid('habitColorRow', 'habit');
  renderEmojiGrid('habitEmojiGrid', EMOJIS_HABIT, 'habit');
  
  document.getElementById('habitOverlay').classList.add('open');
  selectEmoji('habit', EMOJIS_HABIT.indexOf(habit.emoji));
  selectColor('habit', COLORS.findIndex(c => c.bg === habit.color));
}

function closeHabitModal() {
  document.getElementById('habitOverlay').classList.remove('open');
  editingHabitIdx = -1;
}

function saveHabit() {
  const name = document.getElementById('fHName').value.trim();
  const goalDays = parseInt(document.getElementById('fGoalDays').value) || 0;
  const catIdx = parseInt(document.getElementById('fHabitCat').value);
  const startDate = document.getElementById('fStartDate').valueAsDate;
  const endDate = document.getElementById('fEndDate').valueAsDate;
  
  if (!name || goalDays <= 0 || isNaN(catIdx)) {
    showToast('❌ Datos incompletos');
    return;
  }
  
  const emoji = document.querySelector('#habitEmojiGrid .eo.sel');
  const emojiText = emoji ? emoji.textContent : '🎯';
  
  const color = document.querySelector('#habitColorRow .co.sel');
  const colorValue = color ? color.dataset.color : '#7c6af5';
  
  if (editingHabitIdx >= 0) {
    habits[editingHabitIdx] = {
      ...habits[editingHabitIdx],
      name,
      emoji: emojiText,
      goalDays,
      color: colorValue,
      catIdx,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  } else {
    habits.push({
      name,
      emoji: emojiText,
      goalDays,
      color: colorValue,
      catIdx,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      progress: 0,
      completedDates: []
    });
  }
  
  saveData();
  renderHabitList();
  renderCatList();
  closeHabitModal();
  showToast('✓ Hábito guardado');
}

function askDeleteHabit() {
  if (currentHabitIdx < 0) return;
  deleteTarget = { type: 'habit', idx: currentHabitIdx };
  
  const habit = habits[currentHabitIdx];
  document.getElementById('confTitle').textContent = 'Eliminar hábito';
  document.getElementById('confMsg').textContent = `¿Eliminar "${habit.name}"?`;
  document.getElementById('confWrap').classList.add('open');
}

// CALENDARIO
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

function renderCalendar() {
  if (currentHabitIdx < 0) return;
  
  const habit = habits[currentHabitIdx];
  
  document.getElementById('calEmoji').textContent = habit.emoji;
  document.getElementById('calName').textContent = habit.name;
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  document.getElementById('monthLabel').textContent = 
    `${monthNames[calendarMonth]} ${calendarYear}`;
  
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  
  const stats = calculateCalendarStats(habit, calendarYear, calendarMonth);
  
  document.getElementById('calStats').innerHTML = `
    <div class="cstat">
      <div class="cstat-num">${stats.completed}</div>
      <div class="cstat-lbl">Este mes</div>
    </div>
    <div class="cstat">
      <div class="cstat-num">${habit.progress}</div>
      <div class="cstat-lbl">Total</div>
    </div>
    <div class="cstat">
      <div class="cstat-num">${habit.goalDays}</div>
      <div class="cstat-lbl">Meta</div>
    </div>
  `;
  
  const grid = document.getElementById('calGrid');
  grid.innerHTML = `
    <div class="cal-days-hdr">
      <div class="cdl">Dom</div>
      <div class="cdl">Lun</div>
      <div class="cdl">Mar</div>
      <div class="cdl">Mié</div>
      <div class="cdl">Jue</div>
      <div class="cdl">Vie</div>
      <div class="cdl">Sab</div>
    </div>
    <div class="cal-grid" id="calDays"></div>
  `;
  
  const calDays = document.getElementById('calDays');
  
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cday empty';
    calDays.appendChild(empty);
  }
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isDone = habit.completedDates.includes(dateStr);
    const isToday = dateStr === todayStr;
    const isFuture = new Date(dateStr) > today;
    
    const btn = document.createElement('button');
    btn.className = 'cday';
    btn.textContent = day;
    
    if (isDone) btn.classList.add('done');
    if (isToday) btn.classList.add('today');
    if (isFuture) btn.classList.add('future');
    
    btn.onclick = () => toggleDay(dateStr, habit);
    calDays.appendChild(btn);
  }
  
  const pct = (habit.progress / habit.goalDays) * 100;
  const progDiv = document.createElement('div');
  progDiv.style.cssText = 'margin-top: 20px; padding: 0 14px;';
  progDiv.innerHTML = `
    <div class="cal-prog-label">
      <span>Progreso general</span>
      <span>${Math.round(pct)}%</span>
    </div>
    <div class="cal-prog-bar">
      <div class="cal-prog-fill" style="width: ${pct}%; background: ${habit.color};"></div>
    </div>
  `;
  grid.appendChild(progDiv);
}

function calculateCalendarStats(habit, year, month) {
  const startDay = new Date(year, month, 1);
  const endDay = new Date(year, month + 1, 0);
  
  const completed = habit.completedDates.filter(date => {
    const d = new Date(date + 'T00:00:00');
    return d >= startDay && d <= endDay;
  }).length;
  
  return { completed };
}

function toggleDay(dateStr, habit) {
  const idx = habit.completedDates.indexOf(dateStr);
  if (idx >= 0) {
    habit.completedDates.splice(idx, 1);
    habit.progress = Math.max(0, habit.progress - 1);
  } else {
    habit.completedDates.push(dateStr);
    habit.progress++;
  }
  
  saveData();
  renderCalendar();
  renderCatList();
}

function changeMonth(delta) {
  calendarMonth += delta;
  if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear--;
  } else if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear++;
  }
  renderCalendar();
}

// ═══ PROYECTOS ═══

function renderProjList() {
  const container = document.getElementById('projList');
  if (!container) return;
  container.innerHTML = '';
  
  if (projects.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-ico">🚀</div>
        <div class="empty-txt">Sin proyectos<br/>Crea uno para empezar</div>
      </div>
    `;
    document.getElementById('pv1Sub').textContent = '0 proyectos';
    return;
  }
  
  projects.forEach((proj, idx) => {
    const tasks = proj.tasks || [];
    const completed = tasks.filter(t => t.done).length;
    const pct = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
    
    const card = document.createElement('div');
    card.className = 'proj-card';
    card.style.background = `linear-gradient(135deg, ${proj.bgColor}20, transparent)`;
    card.style.borderColor = proj.bgColor;
    card.onclick = () => {
      currentProjIdx = idx;
      projView = 2;
      updateProjViews();
    };
    
    card.innerHTML = `
      <div class="proj-card-top">
        <div class="proj-left">
          <div class="proj-emoji">${proj.emoji}</div>
          <div>
            <div class="proj-name">${proj.name}</div>
            <div class="proj-sub">${tasks.length} tarea${tasks.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="proj-pct">${pct}%</div>
      </div>
      <div class="proj-bar">
        <div class="proj-bar-fill" style="background: ${proj.bgColor}; width: ${pct}%;"></div>
      </div>
      <div class="proj-footer">
        <span>${completed} completadas</span>
        <span>${tasks.length - completed} pendientes</span>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  document.getElementById('pv1Sub').textContent = `${projects.length} proyecto${projects.length !== 1 ? 's' : ''}`;
}

function openProjModal() {
  editingProjIdx = -1;
  document.getElementById('projModalTitle').textContent = 'Nuevo Proyecto';
  document.getElementById('fpName').value = '';
  document.getElementById('fpDesc').value = '';
  renderEmojiGrid('projEmojiGrid', EMOJIS_PROJ, 'proj');
  renderBgColorGrid('projBgRow', 'proj');
  document.getElementById('projOverlay').classList.add('open');
}

function editCurProj() {
  if (currentProjIdx < 0) return;
  editingProjIdx = currentProjIdx;
  const proj = projects[currentProjIdx];
  
  document.getElementById('projModalTitle').textContent = 'Editar Proyecto';
  document.getElementById('fpName').value = proj.name;
  document.getElementById('fpDesc').value = proj.description || '';
  renderEmojiGrid('projEmojiGrid', EMOJIS_PROJ, 'proj');
  renderBgColorGrid('projBgRow', 'proj');
  document.getElementById('projOverlay').classList.add('open');
  
  selectEmoji('proj', EMOJIS_PROJ.indexOf(proj.emoji));
  selectBgColor('proj', COLORS.findIndex(c => c.bg === proj.bgColor));
}

function closeProjModal() {
  document.getElementById('projOverlay').classList.remove('open');
  editingProjIdx = -1;
}

function saveProj() {
  const name = document.getElementById('fpName').value.trim();
  if (!name) {
    showToast('❌ Nombre requerido');
    return;
  }
  
  const emoji = document.querySelector('#projEmojiGrid .eo.sel');
  const emojiText = emoji ? emoji.textContent : '🚀';
  
  const bgColor = document.querySelector('#projBgRow .bgco.sel');
  const bgColorValue = bgColor ? bgColor.dataset.color : '#7c6af5';
  
  const description = document.getElementById('fpDesc').value.trim();
  
  if (editingProjIdx >= 0) {
    projects[editingProjIdx] = {
      ...projects[editingProjIdx],
      name,
      emoji: emojiText,
      bgColor: bgColorValue,
      description
    };
  } else {
    projects.push({
      name,
      emoji: emojiText,
      bgColor: bgColorValue,
      description,
      tasks: []
    });
  }
  
  saveData();
  renderProjList();
  closeProjModal();
  showToast('✓ Proyecto guardado');
}

function askDeleteProj() {
  if (currentProjIdx < 0) return;
  deleteTarget = { type: 'proj', idx: currentProjIdx };
  
  const proj = projects[currentProjIdx];
  document.getElementById('confTitle').textContent = 'Eliminar proyecto';
  document.getElementById('confMsg').textContent = `¿Eliminar "${proj.name}" y todas sus tareas?`;
  document.getElementById('confWrap').classList.add('open');
}

function renderTaskList() {
  if (currentProjIdx < 0) return;
  
  const proj = projects[currentProjIdx];
  const tasks = proj.tasks || [];
  
  document.getElementById('pv2Emoji').textContent = proj.emoji;
  document.getElementById('pv2Name').textContent = proj.name;
  
  const completed = tasks.filter(t => t.done).length;
  document.getElementById('pv2Sub').textContent = 
    `${completed} de ${tasks.length} completadas`;
  
  const pct = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
  
  document.getElementById('pv2Stats').innerHTML = `
    <div class="pstat">
      <div class="pstat-num">${completed}</div>
      <div class="pstat-lbl">Completadas</div>
    </div>
    <div class="pstat">
      <div class="pstat-num">${tasks.length}</div>
      <div class="pstat-lbl">Total</div>
    </div>
    <div class="pstat">
      <div class="pstat-num">${pct}%</div>
      <div class="pstat-lbl">Progreso</div>
    </div>
  `;
  
  const container = document.getElementById('taskList2');
  container.innerHTML = '';
  
  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-ico">✏️</div>
        <div class="empty-txt">Sin tareas<br/>Crea una para empezar</div>
      </div>
    `;
    return;
  }
  
  tasks.forEach((task, idx) => {
    const subtasks = task.subtasks || [];
    const completedSub = subtasks.filter(s => s.done).length;
    const progressPct = subtasks.length === 0 ? 0 : Math.round((completedSub / subtasks.length) * 100);
    
    const item = document.createElement('div');
    item.className = 'task-item';
    
    const checkBtn = document.createElement('div');
    checkBtn.className = 'task-check';
    if (task.done) checkBtn.classList.add('done');
    checkBtn.textContent = '✓';
    checkBtn.onclick = (e) => {
      e.stopPropagation();
      task.done = !task.done;
      saveData();
      renderTaskList();
    };
    item.appendChild(checkBtn);
    
    const content = document.createElement('div');
    content.className = 'task-content';
    content.onclick = () => {
      currentTaskIdx = idx;
      projView = 3;
      updateProjViews();
    };
    
    let html = `<div class="task-title ${task.done ? 'done' : ''}">${task.name}</div>`;
    if (task.note) html += `<div class="task-note">${task.note}</div>`;
    if (task.priority) {
      const priClass = `pri-${task.priority}`;
      html += `<div class="task-priority ${priClass}">${task.priority}</div>`;
    }
    if (subtasks.length > 0) {
      html += `<div class="task-prog-mini"><div class="task-prog-mini-fill" style="width: ${progressPct}%;"></div></div>`;
    }
    
    content.innerHTML = html;
    item.appendChild(content);
    
    container.appendChild(item);
  });
}

function editCurPtask() {
  // TODO: Implement task editing
}

function askDeleteCurTask() {
  if (currentProjIdx < 0 || currentTaskIdx < 0) return;
  deleteTarget = { type: 'task', projIdx: currentProjIdx, taskIdx: currentTaskIdx };
  
  const task = projects[currentProjIdx].tasks[currentTaskIdx];
  document.getElementById('confTitle').textContent = 'Eliminar tarea';
  document.getElementById('confMsg').textContent = `¿Eliminar "${task.name}"?`;
  document.getElementById('confWrap').classList.add('open');
}

function renderSubtaskList() {
  if (currentProjIdx < 0 || currentTaskIdx < 0) return;
  
  const task = projects[currentProjIdx].tasks[currentTaskIdx];
  const subtasks = task.subtasks || [];
  
  document.getElementById('pv3Title').textContent = task.name;
  
  const completedSub = subtasks.filter(s => s.done).length;
  document.getElementById('pv3Meta').textContent = `${completedSub} de ${subtasks.length} subtareas`;
  
  if (task.note) {
    document.getElementById('pv3Note').textContent = task.note;
    document.getElementById('pv3Note').style.display = 'block';
  } else {
    document.getElementById('pv3Note').style.display = 'none';
  }
  
  const pct = subtasks.length === 0 ? 0 : Math.round((completedSub / subtasks.length) * 100);
  document.getElementById('pv3Progress').innerHTML = `
    <div style="font-size:12px;color:var(--muted);margin-bottom:6px;">Progreso: ${pct}%</div>
    <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
      <div style="height:100%;background:var(--accent3);width:${pct}%;transition:width .5s;border-radius:3px;"></div>
    </div>
  `;
  
  const container = document.getElementById('subtaskList');
  container.innerHTML = '';
  
  if (subtasks.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-ico">📋</div>
        <div class="empty-txt">Sin subtareas</div>
      </div>
    `;
    return;
  }
  
  subtasks.forEach((sub, idx) => {
    const item = document.createElement('div');
    item.className = 'subtask-item';
    
    const checkBtn = document.createElement('div');
    checkBtn.className = 'sub-check';
    if (sub.done) checkBtn.classList.add('done');
    checkBtn.textContent = '✓';
    checkBtn.onclick = (e) => {
      e.stopPropagation();
      sub.done = !sub.done;
      saveData();
      renderSubtaskList();
    };
    item.appendChild(checkBtn);
    
    const title = document.createElement('div');
    title.className = `sub-title ${sub.done ? 'done' : ''}`;
    title.textContent = sub.name;
    item.appendChild(title);
    
    const delBtn = document.createElement('button');
    delBtn.className = 'sub-del';
    delBtn.textContent = '×';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      subtasks.splice(idx, 1);
      saveData();
      renderSubtaskList();
    };
    item.appendChild(delBtn);
    
    container.appendChild(item);
  });
}

// ═══ PRESUPUESTOS ═══

function renderBudgetList() {
  const container = document.getElementById('budgetList');
  if (!container) return;
  container.innerHTML = '';
  
  if (budgets.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-ico">💰</div>
        <div class="empty-txt">Sin presupuestos<br/>Crea uno para empezar</div>
      </div>
    `;
    document.getElementById('bv1Sub').textContent = '0 presupuestos';
    return;
  }
  
  budgets.forEach((budget, idx) => {
    const spent = (budget.categories || []).reduce((sum, cat) => {
      return sum + ((cat.items || []).reduce((s, item) => s + (item.selectedOption?.price || item.basePrice || 0), 0));
    }, 0);
    
    const pct = budget.total === 0 ? 0 : Math.round((spent / budget.total) * 100);
    const remaining = Math.max(0, budget.total - spent);
    
    const card = document.createElement('div');
    card.className = 'budget-card';
    card.style.borderColor = budget.bgColor;
    card.style.background = `linear-gradient(135deg, ${budget.bgColor}15, transparent)`;
    card.onclick = () => {
      currentBudgetIdx = idx;
      budgetView = 2;
      updateBudgetViews();
    };
    
    card.innerHTML = `
      <div class="budget-name">${budget.emoji} ${budget.name}</div>
      <div class="budget-total-lbl">Total</div>
      <div class="budget-amount">$${spent.toFixed(2)} / $${budget.total.toFixed(2)}</div>
      <div class="budget-balance">
        <div class="b-stat">
          <div class="b-stat-num">$${spent.toFixed(2)}</div>
          <div class="b-stat-lbl">Gastado</div>
        </div>
        <div class="b-stat">
          <div class="b-stat-num">$${remaining.toFixed(2)}</div>
          <div class="b-stat-lbl">Disponible</div>
        </div>
        <div class="b-stat">
          <div class="b-stat-num">${pct}%</div>
          <div class="b-stat-lbl">Usado</div>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  document.getElementById('bv1Sub').textContent = `${budgets.length} presupuesto${budgets.length !== 1 ? 's' : ''}`;
}

function openBudgetModal() {
  editingBudgetIdx = -1;
  document.getElementById('budgetModalTitle').textContent = 'Nuevo Presupuesto';
  document.getElementById('fbName').value = '';
  document.getElementById('fbTotal').value = '';
  document.getElementById('storeTagsList').innerHTML = '';
  document.getElementById('newStoreName').value = '';
  renderEmojiGrid('budgetEmojiGrid', EMOJIS_BUDGET, 'budget');
  renderBgColorGrid('budgetColorRow', 'budget');
  document.getElementById('budgetOverlay').classList.add('open');
}

function editCurBudget() {
  if (currentBudgetIdx < 0) return;
  editingBudgetIdx = currentBudgetIdx;
  const budget = budgets[currentBudgetIdx];
  
  document.getElementById('budgetModalTitle').textContent = 'Editar Presupuesto';
  document.getElementById('fbName').value = budget.name;
  document.getElementById('fbTotal').value = budget.total;
  
  document.getElementById('storeTagsList').innerHTML = '';
  (budget.stores || []).forEach(store => {
    const tag = document.createElement('div');
    tag.style.cssText = 'background:var(--card);border:1px solid var(--border);padding:6px 12px;border-radius:20px;font-size:12px;display:inline-block;';
    tag.textContent = store;
    document.getElementById('storeTagsList').appendChild(tag);
  });
  
  document.getElementById('newStoreName').value = '';
  renderEmojiGrid('budgetEmojiGrid', EMOJIS_BUDGET, 'budget');
  renderBgColorGrid('budgetColorRow', 'budget');
  document.getElementById('budgetOverlay').classList.add('open');
  
  selectEmoji('budget', EMOJIS_BUDGET.indexOf(budget.emoji));
  selectBgColor('budget', COLORS.findIndex(c => c.bg === budget.bgColor));
}

function closeBudgetModal() {
  document.getElementById('budgetOverlay').classList.remove('open');
  editingBudgetIdx = -1;
}

function saveBudget() {
  const name = document.getElementById('fbName').value.trim();
  const total = parseFloat(document.getElementById('fbTotal').value) || 0;
  
  if (!name || total <= 0) {
    showToast('❌ Datos incompletos');
    return;
  }
  
  const emoji = document.querySelector('#budgetEmojiGrid .eo.sel');
  const emojiText = emoji ? emoji.textContent : '💰';
  
  const bgColor = document.querySelector('#budgetColorRow .bgco.sel');
  const bgColorValue = bgColor ? bgColor.dataset.color : '#f5a623';
  
  const stores = Array.from(document.querySelectorAll('#storeTagsList > div')).map(el => el.textContent);
  
  if (editingBudgetIdx >= 0) {
    budgets[editingBudgetIdx] = {
      ...budgets[editingBudgetIdx],
      name,
      total,
      emoji: emojiText,
      bgColor: bgColorValue,
      stores
    };
  } else {
    budgets.push({
      name,
      total,
      emoji: emojiText,
      bgColor: bgColorValue,
      stores,
      categories: [],
      shoppingEnabled: false
    });
  }
  
  saveData();
  renderBudgetList();
  closeBudgetModal();
  showToast('✓ Presupuesto guardado');
}

function askDeleteCurBudget() {
  if (currentBudgetIdx < 0) return;
  deleteTarget = { type: 'budget', idx: currentBudgetIdx };
  
  const budget = budgets[currentBudgetIdx];
  document.getElementById('confTitle').textContent = 'Eliminar presupuesto';
  document.getElementById('confMsg').textContent = `¿Eliminar "${budget.name}" y todos sus gastos?`;
  document.getElementById('confWrap').classList.add('open');
}

function addBudgetStore() {
  const input = document.getElementById('newStoreName');
  const name = input.value.trim();
  if (!name) return;
  
  const tag = document.createElement('div');
  tag.style.cssText = 'background:var(--card);border:1px solid var(--border);padding:6px 12px;border-radius:20px;font-size:12px;display:inline-block;';
  tag.textContent = name;
  document.getElementById('storeTagsList').appendChild(tag);
  input.value = '';
}

function renderBudgetCatList() {
  if (currentBudgetIdx < 0) return;
  
  const budget = budgets[currentBudgetIdx];
  const cats = budget.categories || [];
  
  document.getElementById('bv2Name').textContent = `${budget.emoji} ${budget.name}`;
  
  const spent = cats.reduce((sum, cat) => {
    return sum + ((cat.items || []).reduce((s, item) => s + (item.selectedOption?.price || item.basePrice || 0), 0));
  }, 0);
  const remaining = Math.max(0, budget.total - spent);
  const pct = budget.total === 0 ? 0 : Math.round((spent / budget.total) * 100);
  
  document.getElementById('bv2Sub').textContent = `$${spent.toFixed(2)} de $${budget.total.toFixed(2)} gastados`;
  
  document.getElementById('bv2Summary').innerHTML = `
    <div class="budget-summary">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px;color:var(--muted);">
        <span>Gastado</span>
        <span>${pct}%</span>
      </div>
      <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:10px;">
        <div style="height:100%;background:${budget.bgColor};width:${pct}%;border-radius:3px;transition:width .5s;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);">
        <span>Disponible: $${remaining.toFixed(2)}</span>
        <span>Total: $${budget.total.toFixed(2)}</span>
      </div>
    </div>
  `;
  
  const container = document.getElementById('budgetCatList');
  container.innerHTML = '';
  
  if (cats.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-ico">📂</div>
        <div class="empty-txt">Sin categorías</div>
      </div>
    `;
    return;
  }
  
  cats.forEach((cat, idx) => {
    const catSpent = (cat.items || []).reduce((s, item) => s + (item.selectedOption?.price || item.basePrice || 0), 0);
    const catPct = (catSpent / budget.total) * 100;
    
    const row = document.createElement('div');
    row.className = 'cat-budget-row';
    row.onclick = () => {
      currentBudgetCatIdx = idx;
      budgetView = 3;
      updateBudgetViews();
    };
    
    row.innerHTML = `
      <div class="cb-name">${cat.emoji} ${cat.name}</div>
      <div class="cb-pct-bar">
        <div class="cb-pct-fill" style="width: ${catPct}%; background: ${budget.bgColor};"></div>
      </div>
      <div class="cb-meta">
        <span>$${catSpent.toFixed(2)}</span>
        <span>${(cat.items || []).length} gasto${(cat.items || []).length !== 1 ? 's' : ''}</span>
      </div>
    `;
    
    container.appendChild(row);
  });
}

function openBudgetCatModal() {
  if (currentBudgetIdx < 0) return;
  document.getElementById('budgetCatModalTitle').textContent = 'Nueva Categoría';
  document.getElementById('fbcName').value = '';
  renderEmojiGrid('budgetCatEmojiGrid', EMOJIS_CAT, 'budgetCat');
  document.getElementById('budgetCatOverlay').classList.add('open');
}

function closeBudgetCatModal() {
  document.getElementById('budgetCatOverlay').classList.remove('open');
}

function saveBudgetCat() {
  const name = document.getElementById('fbcName').value.trim();
  if (!name) {
    showToast('❌ Nombre requerido');
    return;
  }
  
  const emoji = document.querySelector('#budgetCatEmojiGrid .eo.sel');
  const emojiText = emoji ? emoji.textContent : '📂';
  
  const budget = budgets[currentBudgetIdx];
  if (!budget.categories) budget.categories = [];
  
  budget.categories.push({
    name,
    emoji: emojiText,
    items: []
  });
  
  saveData();
  renderBudgetCatList();
  closeBudgetCatModal();
  showToast('✓ Categoría agregada');
}

function editCurBudgetCat() {
  // TODO
}

function askDeleteCurBudgetCat() {
  if (currentBudgetIdx < 0 || currentBudgetCatIdx < 0) return;
  deleteTarget = { type: 'budgetCat', budgetIdx: currentBudgetIdx, catIdx: currentBudgetCatIdx };
  
  const cat = budgets[currentBudgetIdx].categories[currentBudgetCatIdx];
  document.getElementById('confTitle').textContent = 'Eliminar categoría';
  document.getElementById('confMsg').textContent = `¿Eliminar "${cat.name}" y sus gastos?`;
  document.getElementById('confWrap').classList.add('open');
}

function renderBudgetSubList() {
  if (currentBudgetIdx < 0 || currentBudgetCatIdx < 0) return;
  
  const budget = budgets[currentBudgetIdx];
  const cat = budget.categories[currentBudgetCatIdx];
  const items = cat.items || [];
  
  document.getElementById('bv3CatName').textContent = `${cat.emoji} ${cat.name}`;
  
  const catSpent = items.reduce((s, item) => s + (item.selectedOption?.price || item.basePrice || 0), 0);
  document.getElementById('bv3CatSub').textContent = `$${catSpent.toFixed(2)} gastados`;
  
  document.getElementById('bv3Summary').innerHTML = `
    <div class="budget-summary">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:8px;">
        <span>Subtotal</span>
        <span>$${catSpent.toFixed(2)}</span>
      </div>
    </div>
  `;
  
  const container = document.getElementById('budgetSubList');
  container.innerHTML = '';
  
  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-ico">🛍️</div>
        <div class="empty-txt">Sin gastos</div>
      </div>
    `;
    return;
  }
  
  items.forEach((item, idx) => {
    const price = item.selectedOption?.price || item.basePrice || 0;
    
    const row = document.createElement('div');
    row.className = 'sub-budget-item';
    