const labels = {
  '2026': '2026 赛季工程',
  '2027': '2027 场地仿真',
  docs: '学习路线与技术文档'
};

const tones = [
  'tone-blue',
  'tone-indigo',
  'tone-green',
  'tone-orange',
  'tone-teal',
  'tone-pink',
  'tone-purple'
];

function getSchoolTone(school) {
  let hash = 2166136261;
  for (let i = 0; i < school.length; i++) {
    hash ^= school.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return tones[Math.abs(hash) % tones.length];
}

const results = document.querySelector('#results');
const search = document.querySelector('#search');
const searchClearBtn = document.querySelector('#search-clear');
const navSearchBtn = document.querySelector('#nav-search-btn');
const filters = [...document.querySelectorAll('[data-filter]')];
const platformFilters = [...document.querySelectorAll('[data-platform]')];
const toggleAllBtn = document.querySelector('#toggle-all');
const resetBtn = document.querySelector('#reset-filters');
const schoolJumper = document.querySelector('#school-jumper');
const schoolCountBadge = document.querySelector('#school-count-badge');
const themeToggle = document.querySelector('#theme-toggle');
const toastEl = document.querySelector('#ios-toast');

let category = 'all';
let platformCategory = 'all';
let selectedSchool = 'all';
let allExpanded = true;
let toastTimer = null;

function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content) node.textContent = content;
  if (className) node.className = className;
  return node;
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2400);
}

function getPlatformInfo(url) {
  if (!url) return { label: '待补充', btn: '待补链接', group: '其他' };
  try {
    const host = new URL(url).hostname;
    if (host.includes('github.com')) {
      return { label: 'GitHub', btn: 'GitHub', group: 'GitHub' };
    }
    if (host.includes('oshwhub.com')) {
      return { label: '立创开源', btn: '立创开源', group: '立创开源' };
    }
    if (host.includes('feishu.cn')) {
      return { label: '飞书文档', btn: '飞书阅读', group: '飞书文档' };
    }
    if (host.includes('bbs.robomaster.com')) {
      return { label: 'RM 论坛', btn: '论坛原文', group: '论坛 / 博客' };
    }
    if (host.includes('forum.aidlux.com')) {
      return { label: 'AidLux', btn: '社区原文', group: '论坛 / 博客' };
    }
    return { label: '技术博客', btn: '阅读文章', group: '论坛 / 博客' };
  } catch {
    return { label: '技术博客', btn: '阅读文章', group: '论坛 / 博客' };
  }
}

function classifyDomain(name, desc = '', url = '', type = '') {
  const t = `${name} ${desc} ${url}`.toLowerCase();
  if (type === '2027' || /gazebo|仿真|地图/.test(t)) {
    return { key: 'sim', label: '场地仿真', cls: 'dom-sim' };
  }
  if (/oshwhub|主控板|电调|电源管理|拓展板|硬件开源|pcb/.test(t)) {
    return { key: 'hw', label: '开源硬件', cls: 'dom-hw' };
  }
  if (/\brl\b|强化学习|sim2real|点足|轮足|四足|himloco|himdog/.test(t)) {
    return { key: 'rl', label: '强化学习 · 足式', cls: 'dom-rl' };
  }
  if (/机械结构|设计报告/.test(t)) {
    return { key: 'mech', label: '机械设计', cls: 'dom-mech' };
  }
  if (/下位机|单片机|驱动库|电机驱动|serial|串口|stm32|g474|fdcan|foc|舵向控制器/.test(t)) {
    return { key: 'mcu', label: '嵌入式 · 驱控', cls: 'dom-mcu' };
  }
  if (/上位机|ros|导航|yolo|fsm|决策|感知/.test(t)) {
    return { key: 'ros', label: 'ROS 2 · 算法', cls: 'dom-ros' };
  }
  if (type === 'docs' || /教学|入门|思训课|开源帖|解析/.test(t)) {
    return { key: 'docs', label: '学习教程', cls: 'dom-docs' };
  }
  return { key: 'ros', label: '机器人工程', cls: 'dom-ros' };
}

function domainIconSvg(key) {
  const icons = {
    sim: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    hw: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
    rl: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    mech: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    mcu: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    ros: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    docs: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
  };
  return icons[key] || icons.ros;
}

function projectRow([name, url, description], type) {
  const row = element('li', '', 'proj-row');
  const link = element(url ? 'a' : 'div', '', 'proj-link');

  if (url) {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  const dom = classifyDomain(name, description, url, type);
  const iconBox = element('span', '', `proj-icon ${dom.cls}`);
  iconBox.setAttribute('aria-hidden', 'true');
  iconBox.innerHTML = domainIconSvg(dom.key);

  const body = element('div', '', 'proj-body');
  const nameRow = element('div', '', 'proj-name-row');
  nameRow.append(
    element('span', name, 'proj-name'),
    element('span', `· ${dom.label}`, 'proj-dom-label')
  );
  body.append(nameRow);
  if (description) {
    body.append(element('p', description, 'proj-desc'));
  }

  const info = getPlatformInfo(url);
  const getBtn = element(
    'span',
    url ? `${info.btn} ↗` : info.btn,
    `get-btn ${url ? '' : 'is-muted'}`.trim()
  );

  link.append(iconBox, body, getBtn);
  row.append(link);
  return row;
}

function syncToggleBtnState() {
  if (!toggleAllBtn || !results) return;
  const cards = [...results.querySelectorAll('details.univ-card')];
  if (!cards.length) {
    toggleAllBtn.hidden = true;
    return;
  }
  toggleAllBtn.hidden = false;
  const everyOpen = cards.every(card => card.open);
  allExpanded = everyOpen;
  toggleAllBtn.textContent = everyOpen ? '全部收起' : '全部展开';
}

function buildSchoolJumper() {
  if (!schoolJumper) return;
  const schoolMap = new Map();
  for (const [type, school, , items] of catalog) {
    if (category !== 'all' && type !== category) continue;
    const validCount = items.filter(item => {
      const info = getPlatformInfo(item[1]);
      return platformCategory === 'all' || info.group === platformCategory;
    }).length;
    if (validCount > 0) {
      schoolMap.set(school, (schoolMap.get(school) || 0) + validCount);
    }
  }

  if (schoolCountBadge) {
    schoolCountBadge.textContent = `${schoolMap.size} 所`;
  }

  schoolJumper.replaceChildren();
  if (schoolMap.size === 0) return;

  const allBtn = element('button', '', `sb-item ${selectedSchool === 'all' ? 'active' : ''}`.trim());
  allBtn.type = 'button';
  const allLeft = element('span', '全部高校', 'sb-left');
  const allCount = element('span', String(schoolMap.size), 'sb-count');
  allBtn.append(allLeft, allCount);
  allBtn.addEventListener('click', () => {
    selectedSchool = 'all';
    render();
  });
  schoolJumper.append(allBtn);

  for (const [school, count] of schoolMap.entries()) {
    const btn = element('button', '', `sb-item ${selectedSchool === school ? 'active' : ''}`.trim());
    btn.type = 'button';
    const left = element('span', '', 'sb-left');
    const dot = element('span', '', `sb-dot ${getSchoolTone(school)}`);
    dot.setAttribute('aria-hidden', 'true');
    left.append(dot, element('span', school));

    const countEl = element('span', String(count), 'sb-count');
    btn.append(left, countEl);
    btn.addEventListener('click', () => {
      selectedSchool = selectedSchool === school ? 'all' : school;
      render();
    });
    schoolJumper.append(btn);
  }
}

function render() {
  if (!results) return;
  const rawQuery = search ? search.value : '';
  if (searchClearBtn) {
    searchClearBtn.hidden = !rawQuery.length;
  }

  const terms = rawQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hasActiveFilter = category !== 'all' || platformCategory !== 'all' || selectedSchool !== 'all' || terms.length > 0;
  if (resetBtn) resetBtn.hidden = !hasActiveFilter;

  buildSchoolJumper();

  const matches = catalog
    .filter(([type, school]) => (category === 'all' || type === category) && (selectedSchool === 'all' || school === selectedSchool))
    .map(([type, school, subtitle, items]) => [
      type,
      school,
      subtitle,
      items.filter(item => {
        const info = getPlatformInfo(item[1]);
        const dom = classifyDomain(item[0], item[2], item[1], type);
        const platformMatch = platformCategory === 'all' || info.group === platformCategory;
        const termMatch = terms.every(term =>
          [labels[type], school, subtitle, info.label, dom.label, ...item].join(' ').toLowerCase().includes(term)
        );
        return platformMatch && termMatch;
      })
    ])
    .filter(([, , , items]) => items.length);

  results.replaceChildren();
  const totalResources = matches.reduce((count, entry) => count + entry[3].length, 0);
  const totalSchools = new Set(matches.map(entry => entry[1])).size;
  const statusEl = document.querySelector('#status');
  if (statusEl) {
    statusEl.textContent = `${totalSchools} 所高校 · ${totalResources} 项开源资源`;
  }

  if (!matches.length) {
    results.append(element('p', '未找到匹配的开源项目，请尝试调整搜索词或还原筛选条件。', 'empty'));
    syncToggleBtnState();
    return;
  }

  const shouldOpen = terms.length > 0 || selectedSchool !== 'all' || allExpanded;

  for (const [type, label] of Object.entries(labels)) {
    const entries = matches.filter(entry => entry[0] === type);
    if (!entries.length) continue;

    const section = element('section', '', 'cat-group');
    const groupHead = element('div', '', 'cat-group-head');
    const groupCount = entries.reduce((sum, e) => sum + e[3].length, 0);
    groupHead.append(
      element('h3', label, 'cat-group-title'),
      element('span', `${groupCount} 项资源`, 'cat-group-count')
    );
    section.append(groupHead);

    const stack = element('div', '', 'univ-stack');
    for (const [, school, subtitle, items] of entries) {
      const card = element('details', '', 'univ-card');
      card.open = shouldOpen;
      card.addEventListener('toggle', syncToggleBtnState);

      const summary = element('summary', '', 'univ-summary');
      const identity = element('div', '', 'univ-identity');
      const avatar = element('span', school.slice(0, 1), `univ-avatar ${getSchoolTone(school)}`);
      avatar.setAttribute('aria-hidden', 'true');

      const titleWrap = element('div', '', 'univ-title-wrap');
      titleWrap.append(element('h4', school));
      if (subtitle) {
        titleWrap.append(element('p', subtitle, 'univ-sub'));
      }
      identity.append(avatar, titleWrap);

      const rightBox = element('div', '', 'univ-right');
      rightBox.append(
        element('span', `${items.length} 项`, 'univ-count'),
        element('span', '', 'univ-chevron')
      );

      summary.append(identity, rightBox);
      card.append(summary);

      const list = element('ul', '', 'proj-list');
      list.append(...items.map(item => projectRow(item, type)));
      card.append(list);
      stack.append(card);
    }

    section.append(stack);
    results.append(section);
  }

  syncToggleBtnState();
}

for (const filter of filters) {
  filter.addEventListener('click', () => {
    category = filter.dataset.filter;
    selectedSchool = 'all';
    for (const button of filters) {
      const active = button.dataset.filter === category;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('active', active);
    }
    render();
  });
}

for (const pFilter of platformFilters) {
  pFilter.addEventListener('click', () => {
    platformCategory = pFilter.dataset.platform;
    selectedSchool = 'all';
    for (const button of platformFilters) {
      const active = button.dataset.platform === platformCategory;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('active', active);
    }
    render();
  });
}

if (toggleAllBtn) {
  toggleAllBtn.addEventListener('click', () => {
    const cards = [...results.querySelectorAll('details.univ-card')];
    const nextState = !cards.every(c => c.open);
    allExpanded = nextState;
    for (const card of cards) card.open = nextState;
    syncToggleBtnState();
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    category = 'all';
    platformCategory = 'all';
    selectedSchool = 'all';
    if (search) search.value = '';
    if (searchClearBtn) searchClearBtn.hidden = true;
    allExpanded = true;
    for (const button of filters) {
      const active = button.dataset.filter === 'all';
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('active', active);
    }
    for (const button of platformFilters) {
      const active = button.dataset.platform === 'all';
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('active', active);
    }
    render();
    showToast('已重置全部筛选条件');
  });
}

if (search) {
  search.addEventListener('input', render);
}

if (searchClearBtn && search) {
  searchClearBtn.addEventListener('click', () => {
    search.value = '';
    searchClearBtn.hidden = true;
    search.focus();
    render();
  });
}

function focusSearchInput() {
  if (!search) return;
  search.scrollIntoView({ behavior: 'smooth', block: 'center' });
  search.focus({ preventScroll: true });
}

if (navSearchBtn) {
  navSearchBtn.addEventListener('click', focusSearchInput);
}

window.addEventListener('keydown', event => {
  if (event.key === '/' && search && document.activeElement !== search) {
    event.preventDefault();
    focusSearchInput();
  }
});

// Apple iOS 26 Liquid Glass 外观切换（默认 light）
const themeMeta = document.querySelector('meta[name="theme-color"]');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeMeta) {
    themeMeta.setAttribute('content', theme === 'dark' ? '#000000' : '#F5F5F7');
  }
}

const savedTheme = localStorage.getItem('rc-apple-theme');
applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('rc-apple-theme', next);
  });
}

// 顶部更新日期、Hero 统计条与侧边栏计数
const updated = document.querySelector('#catalog-updated');
if (updated && typeof catalogUpdated !== 'undefined') {
  updated.dateTime = catalogUpdated;
  updated.textContent = catalogUpdated;
}

if (typeof catalog !== 'undefined') {
  const schoolCount = new Set(catalog.map(entry => entry[1])).size;
  const allItems = catalog.flatMap(entry => entry[3]);
  const githubCount = allItems.filter(([, url]) => url && url.includes('github.com')).length;
  const hwCount = allItems.filter(([, url]) => url && url.includes('oshwhub.com')).length;

  const heroMetricsEl = document.querySelector('#hero-metrics');
  if (heroMetricsEl) {
    const metrics = [
      [schoolCount, '所高校'],
      [allItems.length, '项开源'],
      [githubCount, 'GitHub 仓库'],
      [hwCount, '立创硬件']
    ];
    heroMetricsEl.replaceChildren();
    for (const [num, label] of metrics) {
      const item = element('div', '', 'metric-item');
      item.append(element('strong', String(num)), element('span', label));
      heroMetricsEl.append(item);
    }
  }

  for (const el of document.querySelectorAll('[data-count-filter]')) {
    const key = el.dataset.countFilter;
    const count = catalog
      .filter(([type]) => key === 'all' || type === key)
      .reduce((sum, [, , , items]) => sum + items.length, 0);
    el.textContent = String(count);
  }

  for (const el of document.querySelectorAll('[data-count-platform]')) {
    const key = el.dataset.countPlatform;
    const count = allItems.filter(item => key === 'all' || getPlatformInfo(item[1]).group === key).length;
    el.textContent = String(count);
  }
}

// 复制维护者 QQ 并触发灵动岛 Toast
const copyBtn = document.querySelector('#copy');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText('2478920603');
      showToast('✓ 已复制维护者 QQ · 2478920603');
      if (status) {
        status.textContent = ' · 已复制';
        setTimeout(() => {
          status.textContent = '';
        }, 2400);
      }
    } catch {
      showToast('维护者 QQ · 2478920603');
    }
  });
}

render();
