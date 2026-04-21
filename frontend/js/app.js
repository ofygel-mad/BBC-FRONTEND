// Shared layout, auth, navigation

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const ICONS = {
  requests:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="16" rx="1"/><rect x="10" y="3" width="5" height="11" rx="1"/><rect x="17" y="3" width="4" height="13" rx="1"/></svg>`,
  statistics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  journal:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  billing:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M14.5 8.5a2.5 2.5 0 00-5 0c0 1.7 5 2.3 5 4a2.5 2.5 0 01-5 0"/></svg>`,
  management: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33 1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82 1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  profile:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  logout:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>`,
  clients:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
  employees:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  categories: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 10h16M4 14h10"/></svg>`,
  positions:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`,
  chevron:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
  plus:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  menu_ic:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  close:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

// ─── Nav structure ────────────────────────────────────────────────────────────
const NAV_MAIN = [
  { id: 'requests',   label: 'Заявки',      href: 'requests.html',   icon: 'requests' },
  { id: 'statistics', label: 'Статистика',  href: 'statistics.html', icon: 'statistics' },
  { id: 'journal',    label: 'Журнал',      href: 'journal.html',    icon: 'journal' },
  { id: 'billing',    label: 'Биллинг',     href: 'billing.html',    icon: 'billing' },
  {
    id: 'management', label: 'Управление',  icon: 'management',
    sub: [
      { id: 'clients',    label: 'Клиенты',          href: 'clients.html' },
      { id: 'categories', label: 'Категории заявок',  href: 'categories.html' },
      { id: 'positions',  label: 'Должности',         href: 'positions.html' },
      { id: 'employees',  label: 'Сотрудники',        href: 'employees.html' },
    ],
  },
];

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function getToken()  { return localStorage.getItem('sm_token'); }
export function getUser()   { try { return JSON.parse(localStorage.getItem('sm_user')); } catch { return null; } }
export function setAuth(token, user) {
  localStorage.setItem('sm_token', token);
  localStorage.setItem('sm_user', JSON.stringify(user));
}
export function clearAuth() {
  localStorage.removeItem('sm_token');
  localStorage.removeItem('sm_user');
}
export function checkAuth() {
  if (!getToken()) { window.location.href = 'index.html'; return false; }
  return true;
}
export function logout() {
  clearAuth();
  window.location.href = 'index.html';
}

// ─── App shell ────────────────────────────────────────────────────────────────
export function renderSidebar(activeId) {
  const mgmtIds = ['management', 'clients', 'categories', 'positions', 'employees'];
  const isMgmt  = mgmtIds.includes(activeId);

  let root = document.getElementById('app-header-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'app-header-root';
    document.body.prepend(root);
  }

  const logoDots = _makeLogoDots();

  const mgmtItem = NAV_MAIN.find(i => i.id === 'management');
  const subItems = mgmtItem.sub.map(s => `
    <a href="${s.href}" class="drawer-sub-item${s.id === activeId ? ' active' : ''}">${s.label}</a>`
  ).join('');

  const navItems = NAV_MAIN.map(item => {
    const isActive = item.id === activeId || (item.id === 'management' && isMgmt);
    if (item.id === 'management') {
      return `
        <button class="drawer-item${isActive ? ' active' : ''}" id="drawer-mgmt-btn">
          <span class="drawer-item-icon">${ICONS[item.icon]}</span>
          <span>${item.label}</span>
          <span class="drawer-chevron${isMgmt ? ' open' : ''}">${ICONS.chevron}</span>
        </button>
        <div class="drawer-submenu${isMgmt ? ' open' : ''}" id="drawer-submenu">${subItems}</div>`;
    }
    return `<a href="${item.href}" class="drawer-item${isActive ? ' active' : ''}">
      <span class="drawer-item-icon">${ICONS[item.icon]}</span><span>${item.label}</span></a>`;
  }).join('');

  root.innerHTML = `
    <header class="app-header">
      <button class="app-header-btn" id="drawer-open-btn" aria-label="Меню">${ICONS.menu_ic}</button>
      <div class="app-header-logo">${logoDots}</div>
      <button class="app-header-btn app-header-add" id="header-add-btn" aria-label="Добавить">${ICONS.plus}</button>
    </header>

    <div class="drawer-overlay" id="drawer-overlay"></div>

    <div class="drawer" id="app-drawer">
      <div class="drawer-header">
        <div class="drawer-logo">${_makeLogoDots()}</div>
        <button class="drawer-close" id="drawer-close-btn" aria-label="Закрыть">${ICONS.close}</button>
      </div>
      <nav class="drawer-nav">
        ${navItems}
        <div class="drawer-divider"></div>
        <button class="drawer-item" id="drawer-profile-btn">
          <span class="drawer-item-icon">${ICONS.profile}</span><span>Профиль</span>
        </button>
        <button class="drawer-item" id="drawer-logout-btn">
          <span class="drawer-item-icon">${ICONS.logout}</span><span>Выйти</span>
        </button>
      </nav>
    </div>`;

  document.getElementById('drawer-open-btn').onclick  = openDrawer;
  document.getElementById('drawer-close-btn').onclick = closeDrawer;
  document.getElementById('drawer-overlay').onclick   = closeDrawer;

  document.getElementById('header-add-btn').onclick = () =>
    document.dispatchEvent(new CustomEvent('header:add'));

  const mgmtBtn = document.getElementById('drawer-mgmt-btn');
  if (mgmtBtn) {
    mgmtBtn.onclick = () => {
      document.getElementById('drawer-submenu')?.classList.toggle('open');
      mgmtBtn.querySelector('.drawer-chevron')?.classList.toggle('open');
    };
  }

  document.getElementById('drawer-profile-btn').onclick = () => {
    closeDrawer();
    _openProfileOverlay();
  };

  document.getElementById('drawer-logout-btn').onclick = logout;
}

function _makeLogoDots() {
  const dots = Array.from({ length: 9 }, (_, i) =>
    `<div class="logo-dot" style="animation-delay:${(i * 0.1).toFixed(1)}s"></div>`
  ).join('');
  return `<div class="logo-dots">${dots}</div>`;
}

function openDrawer() {
  document.getElementById('app-drawer')?.classList.add('open');
  document.getElementById('drawer-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('app-drawer')?.classList.remove('open');
  document.getElementById('drawer-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

async function _openProfileOverlay() {
  document.getElementById('profile-overlay')?.remove();

  const user = getUser() || {};
  let profile = { name: user.name, email: user.email, positions: [], categories: [], clients: [] };
  try {
    const { getProfile } = await import('./api.js');
    const data = await getProfile();
    if (data) profile = { ...profile, ...data };
  } catch { /* use fallback */ }

  const fmt = arr => arr?.length ? arr.join(', ') : '—';

  const overlay = document.createElement('div');
  overlay.id = 'profile-overlay';
  overlay.className = 'profile-overlay';
  overlay.innerHTML = `
    <button class="profile-overlay-close" id="profile-close-btn" aria-label="Закрыть">${ICONS.close}</button>
    <h2 class="profile-overlay-title">Профиль пользователя</h2>
    <div class="profile-field">
      <div class="profile-field-label">Имя</div>
      <div class="profile-field-value">${profile.name || '—'}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">Электронная почта</div>
      <div class="profile-field-value">${profile.email || '—'}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">Должности</div>
      <div class="profile-field-value profile-field-accent">${fmt(profile.positions)}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">Категории заявок</div>
      <div class="profile-field-value">${fmt(profile.categories)}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">Клиенты</div>
      <div class="profile-field-value">${fmt(profile.clients)}</div>
    </div>`;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  document.getElementById('profile-close-btn').onclick = () => {
    overlay.remove();
    document.body.style.overflow = '';
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export function formatMoney(amount) {
  return new Intl.NumberFormat('ru-KZ', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(amount);
}
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function showToast(message, type = 'success') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'toast';
  t.className = `toast${type === 'error' ? ' toast-error' : ''}`;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3200);
}
export function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
export function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
export function confirmDelete(msg) {
  return window.confirm(msg || 'Удалить этот элемент?');
}
export function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
export function avatarColor(name = '') {
  const colors = ['#fd0047', '#0175c2', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#be185d'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
}
