// TungMeow — shared nav renderer, included on every page.
// Usage: call renderNav('dashboard') after DOM is ready, with #sidebar-slot and #bottomnav-slot present.

const TM_ICONS = {
  dashboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" rx="2.5" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="3" width="8" height="5" rx="2.5" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="10" width="8" height="11" rx="2.5" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="13" width="8" height="8" rx="2.5" stroke="currentColor" stroke-width="1.8"/></svg>',
  transactions: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9.5H21" stroke="currentColor" stroke-width="1.8"/><path d="M7 14H12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  add: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 8V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 12H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  accounts: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7C4 5.34315 5.34315 4 7 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V7Z" stroke="currentColor" stroke-width="1.8"/><path d="M4 9H20" stroke="currentColor" stroke-width="1.8"/><circle cx="15.5" cy="14.5" r="1.4" fill="currentColor"/></svg>',
  settings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 13.5C19.7 13 19.9 12.5 20 12C19.9 11.5 19.7 11 19.4 10.5L20.6 8.6C20.2 7.9 19.7 7.3 19.1 6.7L17 7.6C16.5 7.3 16 7 15.5 6.8L15.1 4.6C14.4 4.5 13.7 4.4 13 4.4L12 6.3C11.3 6.3 10.7 6.4 10 6.6L8.7 5C8 5.2 7.3 5.6 6.7 6L7.3 8.2C6.8 8.6 6.4 9 6.1 9.5L3.9 9.2C3.5 9.8 3.2 10.5 3 11.2L4.8 12.6C4.7 13.1 4.7 13.6 4.8 14.1L3.1 15.6C3.3 16.3 3.6 17 4 17.6L6.2 17.1C6.6 17.5 7 17.9 7.5 18.2L7.4 20.5C8.1 20.8 8.8 21 9.5 21.1L10.8 19.2C11.3 19.3 11.8 19.3 12.3 19.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const TM_CAT_LOGO = '<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="48" cy="48" r="46" fill="var(--orange-soft)"/><path d="M28 30 L20 14 L38 24 Z" fill="#3a2f28"/><path d="M68 30 L76 14 L58 24 Z" fill="#3a2f28"/><ellipse cx="48" cy="52" rx="30" ry="27" fill="#3a2f28"/><ellipse cx="38" cy="48" rx="4.2" ry="5.5" fill="#fefcf9"/><ellipse cx="58" cy="48" rx="4.2" ry="5.5" fill="#fefcf9"/><path d="M45 58 Q48 61 51 58" stroke="#fefcf9" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="30" cy="58" r="3" fill="var(--orange)"/><circle cx="66" cy="58" r="3" fill="var(--blue)"/></svg>';

const TM_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
  { key: 'transactions', label: 'Transactions', href: 'transactions.html' },
  { key: 'add', label: 'Add Entry', href: 'add-entry.html' },
  { key: 'accounts', label: 'Accounts', href: 'settings.html' },
  { key: 'settings', label: 'Settings', href: 'settings.html' },
];

function renderNav(activeKey) {
  const sidebarSlot = document.getElementById('sidebar-slot');
  const bottomSlot = document.getElementById('bottomnav-slot');

  if (sidebarSlot) {
    const items = TM_NAV_ITEMS.map(it => `
      <a class="nav-item ${it.key === activeKey ? 'active' : ''}" href="${it.href}">
        ${TM_ICONS[it.key]}
        <span>${it.label}</span>
      </a>`).join('');
    sidebarSlot.innerHTML = `
      <div class="sidebar-brand">
        <div style="width:34px;height:34px;">${TM_CAT_LOGO}</div>
        <div>
          <div class="word">TungMeow</div>
          <div class="sub">ตังค์เหมียว</div>
        </div>
      </div>
      ${items}
      <div class="sidebar-spacer"></div>
      <div class="sidebar-user">
        <div class="avatar">P</div>
        <div>
          <div class="name">P'Earth</div>
          <div class="status">Synced with Sheets</div>
        </div>
      </div>`;
  }

  if (bottomSlot) {
    const order = ['dashboard', 'transactions', 'add', 'accounts', 'settings'];
    const labels = { dashboard: 'Home', transactions: 'List', add: '', accounts: 'Accounts', settings: 'Settings' };
    const parts = order.map(key => {
      const item = TM_NAV_ITEMS.find(i => i.key === key);
      if (key === 'add') {
        return `<a class="tab fab-slot" href="${item.href}"><span class="fab">${TM_ICONS.add.replace(/currentColor/g, 'white')}</span></a>`;
      }
      return `<a class="tab ${key === activeKey ? 'active' : ''}" href="${item.href}">${TM_ICONS[key]}<span>${labels[key]}</span></a>`;
    }).join('');
    bottomSlot.innerHTML = parts;
  }
}
