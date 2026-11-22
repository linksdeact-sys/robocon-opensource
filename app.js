const labels = {
  '2026': '2026 赛季工程',
  '2027': '2027 场地仿真',
  docs: '学习路线与技术文档'
};

const domainLabels = {
  all: '全部方向',
  rl: '强化学习 · 足式',
  ros: 'ROS 2 · 算法',
  mcu: '嵌入式 · 驱控',
  hw: '开源硬件 PCB',
  sim: '场地仿真',
  docs: '教程与机械设计'
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
const filters = [...document.querySelectorAll('[data-filter]')];
const domainFilters = [...document.querySelectorAll('[data-domain]')];
const platformFilters = [...document.querySelectorAll('[data-platform]')];
const viewBtns = [...document.querySelectorAll('[data-view]')];
const toggleAllBtn = document.querySelector('#toggle-all');
const resetBtn = document.querySelector('#reset-filters');
const schoolJumper = document.querySelector('#school-jumper');
const schoolCountBadge = document.querySelector('#school-count-badge');
const activePillsEl = document.querySelector('#active-filter-pills');
const themeToggle = document.querySelector('#theme-toggle');
const toastEl = document.querySelector('#ios-toast');

let category = 'all';
let domainFilter = 'all';
let platformCategory = 'all';
let selectedSchool = 'all';
let viewMode = 'grouped';
let allExpanded = true;
let toastTimer = null;

// Bookmarks / Favorites persistence ('rc-pro-stars')
const STARS_STORAGE_KEY = 'rc-pro-stars';
let starredSet = new Set();
try {
  const savedStars = JSON.parse(localStorage.getItem(STARS_STORAGE_KEY) || '[]');
  if (Array.isArray(savedStars)) {
    starredSet = new Set(savedStars);
  }
} catch {
  starredSet = new Set();
}

function itemKey(type, school, name) {
  return `${type}::${school}::${name}`;
}

function saveStars() {
  try {
    localStorage.setItem(STARS_STORAGE_KEY, JSON.stringify([...starredSet]));
  } catch {
    // ignore storage quota errors
  }
}

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

function matchesDomainFilter(domKey, filterKey) {
  if (filterKey === 'all') return true;
  if (filterKey === 'docs') return domKey === 'docs' || domKey === 'mech';
  return domKey === filterKey;
}

function domainIconSvg(key) {
  const icons = {
    sim: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    hw: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
    rl: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    mech: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    mcu: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    ros: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    docs: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
  };
  return icons[key] || icons.ros;
}

function starSvg(isStarred) {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="${isStarred ? '#F59E0B' : 'none'}" stroke="${isStarred ? '#F59E0B' : 'currentColor'}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
}

let kpiStarStrong = null;

function updateStarCountsUI() {
  const count = starredSet.size;
  if (kpiStarStrong) {
    kpiStarStrong.textContent = String(count);
  }
  const starBadge = document.querySelector('[data-count-filter="starred"]');
  if (starBadge) {
    starBadge.textContent = String(count);
  }
}

function createStarButton(type, school, name) {
  const key = itemKey(type, school, name);
  const isStarred = starredSet.has(key);
  const btn = element('button', '', `star-btn ${isStarred ? 'is-starred' : ''}`.trim());
  btn.type = 'button';
  btn.setAttribute('aria-label', `收藏 ${name}`);
  btn.setAttribute('aria-pressed', String(isStarred));
  btn.innerHTML = starSvg(isStarred);

  btn.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const nextStarred = !starredSet.has(key);
    if (nextStarred) {
      starredSet.add(key);
      showToast(`已加入收藏 · ${name}`);
    } else {
      starredSet.delete(key);
      showToast(`已取消收藏 · ${name}`);
    }
    saveStars();
    updateStarCountsUI();
    btn.classList.toggle('is-starred', nextStarred);
    btn.setAttribute('aria-pressed', String(nextStarred));
    btn.innerHTML = starSvg(nextStarred);
    if (category === 'starred') {
      render();
    }
  });

  return btn;
}

function projectRow([name, url, description], type, school) {
  const row = element('li', '', 'proj-row');
  const inner = element('div', '', 'proj-row-inner');
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

  link.append(iconBox, body);

  const actions = element('div', '', 'proj-actions');
  const starBtn = createStarButton(type, school, name);
  const info = getPlatformInfo(url);
  let getAction;
  if (url) {
    getAction = element('a', `${info.btn} ↗`, 'get-btn');
    getAction.href = url;
    getAction.target = '_blank';
    getAction.rel = 'noopener noreferrer';
  } else {
    getAction = element('span', '待补链接', 'get-btn is-muted');
  }
  actions.append(starBtn, getAction);

  inner.append(link, actions);
  row.append(inner);
  return row;
}

function projectCard([name, url, description], type, school) {
  const card = element('article', '', 'repo-card');
  const dom = classifyDomain(name, description, url, type);
  const info = getPlatformInfo(url);

  const top = element('div', '', 'repo-card-top');
  const iconBox = element('span', '', `proj-icon ${dom.cls}`);
  iconBox.setAttribute('aria-hidden', 'true');
  iconBox.innerHTML = domainIconSvg(dom.key);

  const schoolPill = element('span', school, 'repo-school-pill');
  const starBtn = createStarButton(type, school, name);
  top.append(iconBox, schoolPill, starBtn);

  const mid = element('div', '', 'repo-card-mid');
  const titleEl = element('h4', '', 'grid-card-title');
  if (url) {
    const titleLink = element('a', name);
    titleLink.href = url;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener noreferrer';
    titleEl.append(titleLink);
  } else {
    titleEl.textContent = name;
  }
  mid.append(titleEl);
  if (description) {
    mid.append(element('p', description, 'proj-desc'));
  }

  const foot = element('div', '', 'repo-card-foot');
  const domLabel = element('span', dom.label, 'proj-dom-label');
  let getAction;
  if (url) {
    getAction = element('a', `${info.btn} ↗`, 'get-btn');
    getAction.href = url;
    getAction.target = '_blank';
    getAction.rel = 'noopener noreferrer';
  } else {
    getAction = element('span', '待补链接', 'get-btn is-muted');
  }
  foot.append(domLabel, getAction);

  card.append(top, mid, foot);
  return card;
}

function syncToggleBtnState() {
  if (!toggleAllBtn || !results) return;
  if (viewMode === 'cards') {
    toggleAllBtn.hidden = true;
    return;
  }
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

function syncSidebarButtonStates() {
  for (const btn of filters) {
    const active = btn.dataset.filter === category;
    btn.setAttribute('aria-pressed', String(active));
    btn.classList.toggle('active', active);
  }
  for (const btn of domainFilters) {
    const active = btn.dataset.domain === domainFilter;
    btn.setAttribute('aria-pressed', String(active));
    btn.classList.toggle('active', active);
  }
  for (const btn of platformFilters) {
    const active = btn.dataset.platform === platformCategory;
    btn.setAttribute('aria-pressed', String(active));
    btn.classList.toggle('active', active);
  }
  for (const btn of viewBtns) {
    const active = btn.dataset.view === viewMode;
    btn.setAttribute('aria-pressed', String(active));
    btn.classList.toggle('active', active);
  }
  for (const seg of document.querySelectorAll('[data-storage-platform]')) {
    const active = seg.dataset.storagePlatform === platformCategory;
    seg.classList.toggle('is-active', active);
    seg.setAttribute('aria-pressed', String(active));
  }
}

function buildSchoolJumper() {
  if (!schoolJumper || typeof catalog === 'undefined') return;
  const schoolMap = new Map();

  for (const [type, school, , items] of catalog) {
    if (category !== 'all' && category !== 'starred' && type !== category) continue;
    const validCount = items.filter(item => {
      if (category === 'starred' && !starredSet.has(itemKey(type, school, item[0]))) return false;
      const info = getPlatformInfo(item[1]);
      const dom = classifyDomain(item[0], item[2], item[1], type);
      const platformMatch = platformCategory === 'all' || info.group === platformCategory;
      const domMatch = matchesDomainFilter(dom.key, domainFilter);
      return platformMatch && domMatch;
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

  const allBtn = element('button', '', `sb-btn sb-item ${selectedSchool === 'all' ? 'active' : ''}`.trim());
  allBtn.type = 'button';
  allBtn.setAttribute('aria-pressed', String(selectedSchool === 'all'));
  allBtn.append(
    element('span', '全部高校', 'sb-text sb-left'),
    element('span', String(schoolMap.size), 'sb-badge sb-count')
  );
  allBtn.addEventListener('click', () => {
    selectedSchool = 'all';
    render();
  });
  schoolJumper.append(allBtn);

  for (const [school, count] of schoolMap.entries()) {
    const isActive = selectedSchool === school;
    const btn = element('button', '', `sb-btn sb-item ${isActive ? 'active' : ''}`.trim());
    btn.type = 'button';
    btn.setAttribute('aria-pressed', String(isActive));

    const left = element('span', '', 'sb-left');
    const dot = element('span', '', `sb-dot ${getSchoolTone(school)}`);
    dot.setAttribute('aria-hidden', 'true');
    left.append(dot, element('span', school, 'sb-text'));

    const badge = element('span', String(count), 'sb-badge sb-count');
    btn.append(left, badge);
    btn.addEventListener('click', () => {
      selectedSchool = selectedSchool === school ? 'all' : school;
      render();
    });
    schoolJumper.append(btn);
  }
}

function renderActiveFilterPills(terms) {
  if (!activePillsEl) return;
  activePillsEl.replaceChildren();

  const pills = [];

  if (category !== 'all') {
    const catName = category === 'starred' ? '我的收藏' : (labels[category] || category);
    pills.push({
      label: `分类: ${catName}`,
      clear: () => {
        category = 'all';
        render();
      }
    });
  }

  if (domainFilter !== 'all') {
    pills.push({
      label: `方向: ${domainLabels[domainFilter] || domainFilter}`,
      clear: () => {
        domainFilter = 'all';
        render();
      }
    });
  }

  if (platformCategory !== 'all') {
    pills.push({
      label: `平台: ${platformCategory}`,
      clear: () => {
        platformCategory = 'all';
        render();
      }
    });
  }

  if (selectedSchool !== 'all') {
    pills.push({
      label: `高校: ${selectedSchool}`,
      clear: () => {
        selectedSchool = 'all';
        render();
      }
    });
  }

  if (terms.length > 0 && search) {
    pills.push({
      label: `关键词: "${search.value.trim()}"`,
      clear: () => {
        search.value = '';
        if (searchClearBtn) searchClearBtn.hidden = true;
        render();
      }
    });
  }

  if (!pills.length) {
    activePillsEl.hidden = true;
    return;
  }

  activePillsEl.hidden = false;
  for (const pill of pills) {
    const chip = element('button', '', 'filter-chip');
    chip.type = 'button';
    chip.setAttribute('aria-label', `移除筛选 ${pill.label}`);
    chip.append(
      element('span', pill.label),
      element('span', '×', 'chip-close')
    );
    chip.addEventListener('click', pill.clear);
    activePillsEl.append(chip);
  }
}

function render() {
  if (!results || typeof catalog === 'undefined') return;
  const rawQuery = search ? search.value : '';
  if (searchClearBtn) {
    searchClearBtn.hidden = !rawQuery.length;
  }

  const terms = rawQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hasActiveFilter =
    category !== 'all' ||
    domainFilter !== 'all' ||
    platformCategory !== 'all' ||
    selectedSchool !== 'all' ||
    terms.length > 0;

  if (resetBtn) resetBtn.hidden = !hasActiveFilter;

  syncSidebarButtonStates();
  buildSchoolJumper();
  renderActiveFilterPills(terms);

  const matches = catalog
    .filter(([type, school]) => {
      const catMatch = category === 'all' || category === 'starred' || type === category;
      const schoolMatch = selectedSchool === 'all' || school === selectedSchool;
      return catMatch && schoolMatch;
    })
    .map(([type, school, subtitle, items]) => [
      type,
      school,
      subtitle,
      items.filter(item => {
        if (category === 'starred' && !starredSet.has(itemKey(type, school, item[0]))) {
          return false;
        }
        const info = getPlatformInfo(item[1]);
        const dom = classifyDomain(item[0], item[2], item[1], type);
        const platformMatch = platformCategory === 'all' || info.group === platformCategory;
        const domMatch = matchesDomainFilter(dom.key, domainFilter);
        const termMatch = terms.every(term =>
          [labels[type], school, subtitle, info.label, dom.label, ...item].join(' ').toLowerCase().includes(term)
        );
        return platformMatch && domMatch && termMatch;
      })
    ])
    .filter(([, , , items]) => items.length);

  results.replaceChildren();
  const totalResources = matches.reduce((count, entry) => count + entry[3].length, 0);
  const totalSchools = new Set(matches.map(entry => entry[1])).size;
  const statusEl = document.querySelector('#status');
  if (statusEl) {
    statusEl.textContent = `当前显示 ${totalSchools} 所高校 · 共 ${totalResources} 项开源工程`;
  }

  if (!matches.length) {
    const emptyBox = element('div', '', 'empty-state empty');
    if (category === 'starred' && starredSet.size === 0) {
      emptyBox.append(
        element('p', '还没有收藏任何项目，点击项目右侧的星标即可加入收藏夹。')
      );
      const backBtn = element('button', '返回全部开源', 'tool-pill');
      backBtn.type = 'button';
      backBtn.addEventListener('click', () => {
        category = 'all';
        render();
      });
      emptyBox.append(backBtn);
    } else {
      emptyBox.append(
        element('p', '未找到匹配的开源项目，请尝试调整搜索词或还原筛选条件。')
      );
    }
    results.append(emptyBox);
    syncToggleBtnState();
    return;
  }

  if (viewMode === 'cards') {
    const grid = element('div', '', 'cards-grid');
    for (const [type, school, , items] of matches) {
      for (const item of items) {
        grid.append(projectCard(item, type, school));
      }
    }
    results.append(grid);
    syncToggleBtnState();
    return;
  }

  const shouldOpen =
    terms.length > 0 ||
    selectedSchool !== 'all' ||
    category === 'starred' ||
    domainFilter !== 'all' ||
    allExpanded;

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
      list.append(...items.map(item => projectRow(item, type, school)));
      card.append(list);
      stack.append(card);
    }

    section.append(stack);
    results.append(section);
  }

  syncToggleBtnState();
}

// Sidebar & Toolbar Filter Listeners
for (const filter of filters) {
  filter.addEventListener('click', () => {
    category = filter.dataset.filter;
    selectedSchool = 'all';
    render();
  });
}

for (const dFilter of domainFilters) {
  dFilter.addEventListener('click', () => {
    domainFilter = dFilter.dataset.domain;
    selectedSchool = 'all';
    render();
  });
}

for (const pFilter of platformFilters) {
  pFilter.addEventListener('click', () => {
    platformCategory = pFilter.dataset.platform;
    selectedSchool = 'all';
    render();
  });
}

for (const vBtn of viewBtns) {
  vBtn.addEventListener('click', () => {
    viewMode = vBtn.dataset.view;
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
    domainFilter = 'all';
    platformCategory = 'all';
    selectedSchool = 'all';
    if (search) search.value = '';
    if (searchClearBtn) searchClearBtn.hidden = true;
    allExpanded = true;
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

// Theme Toggle ('rc-pro-theme')
const themeMeta = document.querySelector('meta[name="theme-color"]');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }
  if (themeMeta) {
    themeMeta.setAttribute('content', theme === 'dark' ? '#000000' : '#F5F5F7');
  }
}

const savedTheme = localStorage.getItem('rc-pro-theme');
applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('rc-pro-theme', next);
  });
}

// Updated Date, Hero Apple Storage-Bar Overview Card & Dynamic Sidebar Counts
const updated = document.querySelector('#catalog-updated');
if (updated && typeof catalogUpdated !== 'undefined') {
  updated.dateTime = catalogUpdated;
  updated.textContent = catalogUpdated;
}

if (typeof catalog !== 'undefined') {
  const schoolCount = new Set(catalog.map(entry => entry[1])).size;
  const allItemsWithMeta = catalog.flatMap(([type, school, subtitle, items]) =>
    items.map(item => ({ type, school, subtitle, item }))
  );
  const ruleLinks = [...document.querySelectorAll('#rules .ver-pill')];
  const rulebookCount = ruleLinks.length || 8;

  // 1. Hero KPIs (#hero-kpis)
  const heroKpisEl = document.querySelector('#hero-kpis');
  if (heroKpisEl) {
    heroKpisEl.replaceChildren();
    const kpiData = [
      { num: schoolCount, label: '收录高校', isStar: false },
      { num: allItemsWithMeta.length, label: '开源项目', isStar: false },
      { num: rulebookCount, label: '官方规则书', isStar: false },
      { num: starredSet.size, label: '我的收藏', isStar: true }
    ];
    for (const kpi of kpiData) {
      const box = element('div', '', 'kpi-box');
      const strong = element('strong', String(kpi.num));
      if (kpi.isStar) {
        kpiStarStrong = strong;
      }
      box.append(strong, element('span', kpi.label));
      heroKpisEl.append(box);
    }
  }

  // 2. Apple Storage Bar & Legend (#storage-bar, #storage-legend)
  const storageBarEl = document.querySelector('#storage-bar');
  const storageLegendEl = document.querySelector('#storage-legend');
  const platformSegments = [
    { group: 'GitHub', label: 'GitHub 仓库', segClass: 'seg-github' },
    { group: '立创开源', label: '立创开源硬件', segClass: 'seg-oshw' },
    { group: '飞书文档', label: '飞书知识库', segClass: 'seg-feishu' },
    { group: '论坛 / 博客', label: '社区与技术博客', segClass: 'seg-forum' }
  ];

  function togglePlatformFromStorage(group) {
    platformCategory = platformCategory === group ? 'all' : group;
    selectedSchool = 'all';
    render();
    const catalogSec = document.querySelector('#catalog');
    if (catalogSec && platformCategory !== 'all') {
      catalogSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (storageBarEl && storageLegendEl) {
    storageBarEl.replaceChildren();
    storageLegendEl.replaceChildren();

    for (const seg of platformSegments) {
      const count = allItemsWithMeta.filter(({ item }) => getPlatformInfo(item[1]).group === seg.group).length;

      const barBtn = element('button', '', `storage-seg ${seg.segClass}`);
      barBtn.type = 'button';
      barBtn.dataset.storagePlatform = seg.group;
      barBtn.style.flexGrow = String(Math.max(count, 1));
      barBtn.setAttribute('aria-label', `筛选 ${seg.label} (${count} 项)`);
      barBtn.title = `${seg.label}: ${count} 项`;
      barBtn.addEventListener('click', () => togglePlatformFromStorage(seg.group));
      storageBarEl.append(barBtn);

      const legBtn = element('button', '', 'legend-btn');
      legBtn.type = 'button';
      legBtn.dataset.storagePlatform = seg.group;
      legBtn.setAttribute('aria-label', `筛选 ${seg.label} (${count} 项)`);
      const dot = element('span', '', `legend-dot ${seg.segClass}`);
      dot.setAttribute('aria-hidden', 'true');
      legBtn.append(dot, element('span', seg.label), element('strong', String(count)));
      legBtn.addEventListener('click', () => togglePlatformFromStorage(seg.group));
      storageLegendEl.append(legBtn);
    }
  }

  // 3. Sidebar Counts ([data-count-filter], [data-count-domain], [data-count-platform])
  for (const el of document.querySelectorAll('[data-count-filter]')) {
    const key = el.dataset.countFilter;
    if (key === 'starred') {
      el.textContent = String(starredSet.size);
    } else {
      const count = catalog
        .filter(([type]) => key === 'all' || type === key)
        .reduce((sum, [, , , items]) => sum + items.length, 0);
      el.textContent = String(count);
    }
  }

  for (const el of document.querySelectorAll('[data-count-domain]')) {
    const key = el.dataset.countDomain;
    const count = allItemsWithMeta.filter(({ type, item }) => {
      const dom = classifyDomain(item[0], item[2], item[1], type);
      return matchesDomainFilter(dom.key, key);
    }).length;
    el.textContent = String(count);
  }

  for (const el of document.querySelectorAll('[data-count-platform]')) {
    const key = el.dataset.countPlatform;
    const count = allItemsWithMeta.filter(({ item }) =>
      key === 'all' || getPlatformInfo(item[1]).group === key
    ).length;
    el.textContent = String(count);
  }
}

// Native <dialog> Apple Spotlight Command Palette
const spotlightDialog = document.querySelector('#spotlight-dialog');
const modalSearch = document.querySelector('#modal-search');
const modalResults = document.querySelector('#modal-results');
const closeSpotlightBtn = document.querySelector('#close-spotlight');
const openSpotlightBtn = document.querySelector('#open-spotlight');
const heroCmdBtn = document.querySelector('#hero-cmd-btn');

let lastOpener = null;
let selectedModalIndex = 0;
let currentModalLinks = [];

function buildSpotlightIndex() {
  const index = [];

  // 1. Extract all 8 official rulebook PDFs from #rules .ver-pill
  for (const pill of document.querySelectorAll('#rules .ver-pill')) {
    const card = pill.closest('.story-card');
    const trackTitle = card?.querySelector('h3')?.textContent?.trim() || '官方比赛规则';
    const rowLabel = pill.closest('.tray-row')?.querySelector('.tray-label')?.textContent?.trim() || '规则书';
    const verText = pill.textContent.replace(/\s+/g, ' ').trim();
    index.push({
      title: `${trackTitle} · ${rowLabel} ${verText}`,
      subtitle: '2027 赛季 · 第 26 届 ROBOCON 官方规则 PDF',
      badge: '规则 PDF',
      url: pill.getAttribute('href'),
      keywords: `${trackTitle} ${rowLabel} ${verText} 规则 pdf 2027`.toLowerCase()
    });
  }

  // 2. Add all 41 catalog resources
  if (typeof catalog !== 'undefined') {
    for (const [type, school, subtitle, items] of catalog) {
      for (const [name, url, desc] of items) {
        if (!url) continue;
        const info = getPlatformInfo(url);
        const dom = classifyDomain(name, desc, url, type);
        index.push({
          title: `${school} · ${name}`,
          subtitle: `${subtitle ? subtitle + ' · ' : ''}${dom.label}${desc ? ' — ' + desc : ''}`,
          badge: info.label,
          url,
          keywords: `${school} ${subtitle} ${name} ${desc} ${dom.label} ${info.label} ${labels[type] || ''}`.toLowerCase()
        });
      }
    }
  }

  return index;
}

const spotlightIndex = buildSpotlightIndex();

function updateModalSelection(newIndex) {
  if (!currentModalLinks.length) return;
  selectedModalIndex = (newIndex + currentModalLinks.length) % currentModalLinks.length;
  currentModalLinks.forEach((link, idx) => {
    const selected = idx === selectedModalIndex;
    link.classList.toggle('is-selected', selected);
    link.setAttribute('aria-selected', String(selected));
    if (selected) {
      link.scrollIntoView({ block: 'nearest' });
    }
  });
}

function renderSpotlightResults() {
  if (!modalResults) return;
  const query = modalSearch ? modalSearch.value.trim().toLowerCase() : '';
  const terms = query.split(/\s+/).filter(Boolean);

  const matched = spotlightIndex
    .filter(entry => terms.every(t => entry.keywords.includes(t)))
    .slice(0, 12);

  modalResults.replaceChildren();
  currentModalLinks = [];
  selectedModalIndex = 0;

  if (!matched.length) {
    modalResults.append(element('div', '没有匹配的规则书或开源工程', 'modal-empty empty-state'));
    return;
  }

  matched.forEach((entry, idx) => {
    const item = element('a', '', `modal-item ${idx === 0 ? 'is-selected' : ''}`.trim());
    item.href = entry.url;
    item.target = '_blank';
    item.rel = 'noopener noreferrer';
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(idx === 0));

    const left = element('div', '', 'modal-item-main');
    left.append(
      element('div', entry.title, 'modal-item-title'),
      element('div', entry.subtitle, 'modal-item-sub')
    );

    const badge = element('span', entry.badge, 'modal-item-badge');
    item.append(left, badge);

    item.addEventListener('mouseenter', () => {
      updateModalSelection(idx);
    });

    modalResults.append(item);
    currentModalLinks.push(item);
  });
}

function openSpotlight() {
  if (!spotlightDialog) return;
  lastOpener = document.activeElement;
  if (!spotlightDialog.open) {
    spotlightDialog.showModal();
  }
  renderSpotlightResults();
  if (modalSearch) {
    modalSearch.focus();
    modalSearch.select();
  }
}

function closeSpotlight() {
  if (spotlightDialog && spotlightDialog.open) {
    spotlightDialog.close();
  }
}

if (openSpotlightBtn) {
  openSpotlightBtn.addEventListener('click', openSpotlight);
}

if (heroCmdBtn) {
  heroCmdBtn.addEventListener('click', event => {
    event.preventDefault();
    openSpotlight();
  });
}

if (closeSpotlightBtn) {
  closeSpotlightBtn.addEventListener('click', closeSpotlight);
}

if (spotlightDialog) {
  spotlightDialog.addEventListener('close', () => {
    if (lastOpener && typeof lastOpener.focus === 'function') {
      lastOpener.focus();
    }
  });

  spotlightDialog.addEventListener('click', event => {
    const surface = spotlightDialog.querySelector('.modal-surface');
    if (surface && !surface.contains(event.target)) {
      closeSpotlight();
    }
  });
}

if (modalSearch) {
  modalSearch.addEventListener('input', renderSpotlightResults);
  modalSearch.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      updateModalSelection(selectedModalIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      updateModalSelection(selectedModalIndex - 1);
    } else if (event.key === 'Enter' && currentModalLinks[selectedModalIndex]) {
      event.preventDefault();
      currentModalLinks[selectedModalIndex].click();
      closeSpotlight();
    }
  });
}

window.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (spotlightDialog && spotlightDialog.open) {
      closeSpotlight();
    } else {
      openSpotlight();
    }
    return;
  }

  const tag = document.activeElement?.tagName;
  const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;
  if (event.key === '/' && !isTyping) {
    event.preventDefault();
    openSpotlight();
  }
});

// Copy QQ & Dynamic Island Toast
const copyBtn = document.querySelector('#copy');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('2478920603');
      showToast('已复制维护者 QQ · 2478920603');
    } catch {
      showToast('维护者 QQ · 2478920603');
    }
  });
}

render();
