import { renderSidebar, checkAuth, avatarColor } from './app.js';
import { getRequests, getClients, getEmployees } from './api.js';

if (!checkAuth()) throw new Error('not auth');
renderSidebar('statistics');

function renderClients(clients, requests) {
  const rows = clients.map(c => {
    const reqs    = requests.filter(r => r.clientId === c.id);
    const cActive = reqs.filter(r => r.status === 'new' || r.status === 'waiting').length;
    const cProc   = reqs.filter(r => r.status === 'review' || r.status === 'doing').length;
    const bg      = avatarColor(c.name);
    const letter  = c.name.charAt(0).toUpperCase();
    return `
      <div class="client-stat-item">
        <div class="client-stat-header">
          <div class="client-avatar" style="background:${bg}">${letter}</div>
          <span class="client-stat-name">${c.name}</span>
        </div>
        <div class="client-stat-rows">
          <div class="client-stat-row"><span>Активных заявок</span><span>${cActive}</span></div>
          <div class="client-stat-row"><span>В обработке</span><span>${cProc}</span></div>
          <div class="client-stat-row"><span>Всего заявок</span><span>${reqs.length}</span></div>
        </div>
      </div>`;
  }).join('');

  document.getElementById('tab-clients').innerHTML = rows || '<p class="text-muted">Нет данных</p>';
}

function renderEmployees(employees, requests) {
  const rows = employees.map(e => {
    const reqs    = requests.filter(r => r.assigneeId === e.id);
    const eActive = reqs.filter(r => r.status === 'new' || r.status === 'waiting').length;
    const eProc   = reqs.filter(r => r.status === 'review' || r.status === 'doing').length;
    const bg      = avatarColor(e.name);
    const letter  = e.name.charAt(0).toUpperCase();
    return `
      <div class="client-stat-item">
        <div class="client-stat-header">
          <div class="client-avatar" style="background:${bg}">${letter}</div>
          <span class="client-stat-name">${e.name}</span>
        </div>
        <div class="client-stat-rows">
          <div class="client-stat-row"><span>Должность</span><span>${e.position ?? '&mdash;'}</span></div>
          <div class="client-stat-row"><span>Активных заявок</span><span>${eActive}</span></div>
          <div class="client-stat-row"><span>В обработке</span><span>${eProc}</span></div>
        </div>
      </div>`;
  }).join('');

  document.getElementById('tab-employees').innerHTML = rows || '<p class="text-muted">Нет данных</p>';
}

async function init() {
  const [requests, clients, employees] = await Promise.all([
    getRequests().catch(() => []),
    getClients().catch(() => []),
    getEmployees().catch(() => []),
  ]);

  const active  = requests.filter(r => r.status === 'new' || r.status === 'waiting');
  const process = requests.filter(r => r.status === 'review' || r.status === 'doing');

  const activeClients  = new Set(active.map(r => r.clientId)).size;
  const processClients = new Set(process.map(r => r.clientId)).size;

  document.getElementById('cnt-active').textContent          = active.length;
  document.getElementById('cnt-active-clients').textContent  = `Клиентов: ${activeClients}`;
  document.getElementById('cnt-process').textContent         = process.length;
  document.getElementById('cnt-process-clients').textContent = `Клиентов: ${processClients}`;

  renderClients(clients, requests);
  renderEmployees(employees, requests);
}

init();

document.getElementById('stats-tabs').addEventListener('click', e => {
  const btn = e.target.closest('.stats-tab');
  if (!btn) return;
  const tab = btn.dataset.tab;
  document.querySelectorAll('.stats-tab').forEach(b => b.classList.toggle('active', b === btn));
  document.getElementById('tab-clients').classList.toggle('hidden', tab !== 'clients');
  document.getElementById('tab-employees').classList.toggle('hidden', tab !== 'employees');
});
