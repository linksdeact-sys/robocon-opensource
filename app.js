const labels = { '2026': '2026 项目 / 工程', '2027': '2027 项目 / 工程', docs: '学习文档' };
const results = document.querySelector('#results');
const search = document.querySelector('#search');
const filters = [...document.querySelectorAll('[data-filter]')];
let category = 'all';

function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content) node.textContent = content;
  if (className) node.className = className;
  return node;
}

function resource([name, url, description]) {
  const row = element('li', '', 'resource');
  const title = element(url ? 'a' : 'span', name, 'resource-title');
  if (url) {
    title.href = url;
    const host = new URL(url).hostname;
    const platform = { 'github.com': 'GitHub', 'oshwhub.com': '立创开源硬件平台', 'bbs.robomaster.com': 'RoboMaster 论坛', 'forum.aidlux.com': 'AidLux 论坛' }[host] || '站外文章';
    title.append(element('span', platform + ' ↗', 'source'));
  } else {
    title.append(element('span', '待补链接', 'source'));
  }
  row.append(title);
  if (description) row.append(element('p', description));
  return row;
}

function render() {
  const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = catalog
    .filter(([type]) => category === 'all' || type === category)
    .map(([type, school, subtitle, items]) => [
      type, school, subtitle, items.filter(item =>
        terms.every(term => [labels[type], school, subtitle, ...item].join(' ').toLowerCase().includes(term)))
    ])
    .filter(([, , , items]) => items.length);

  results.replaceChildren();
  document.querySelector('#status').textContent =
    '显示 ' + matches.reduce((count, entry) => count + entry[3].length, 0) + ' 条资源';
  if (!matches.length) {
    results.append(element('p', '没有找到符合条件的资源，试试其他关键词。', 'empty'));
    return;
  }

  for (const [type, label] of Object.entries(labels)) {
    const entries = matches.filter(entry => entry[0] === type);
    if (!entries.length) continue;
    const section = element('section', '', 'group');
    section.append(element('h3', label, 'group-title'));
    const grid = element('div', '', 'grid');
    for (const [, school, subtitle, items] of entries) {
      const card = element('details', '', 'card');
      card.open = terms.length > 0;
      const summary = element('summary');
      const heading = element('div');
      heading.append(element('h4', school));
      if (subtitle) heading.append(element('p', subtitle, 'subtitle'));
      summary.append(heading, element('span', items.length + ' 项', 'item-count'));
      card.append(summary);
      const list = element('ul');
      list.append(...items.map(resource));
      card.append(list);
      grid.append(card);
    }
    section.append(grid);
    results.append(section);
  }
}

for (const filter of filters) {
  filter.addEventListener('click', () => {
    category = filter.dataset.filter;
    for (const button of filters) button.setAttribute('aria-pressed', String(button === filter));
    render();
  });
}
search.addEventListener('input', render);

document.querySelector('#stats').append(
  element('span', new Set(catalog.map(entry => entry[1])).size + ' 所高校'),
  element('span', catalog.reduce((sum, entry) => sum + entry[3].length, 0) + ' 条资源')
);

document.querySelector('#copy').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('2478920603');
    status.textContent = '已复制 QQ 号';
  } catch {
    status.textContent = '请手动复制 QQ 号 2478920603';
  }
});

render();

const trailPreference = matchMedia('(any-pointer: fine) and (prefers-reduced-motion: no-preference)');
let lastDot = 0;

window.addEventListener('pointermove', event => {
  if (!trailPreference.matches || event.pointerType !== 'mouse' || event.timeStamp - lastDot < 24) return;
  lastDot = event.timeStamp;
  const dot = element('span', '', 'cursor-trail');
  dot.setAttribute('aria-hidden', 'true');
  dot.style.left = event.clientX + 'px';
  dot.style.top = event.clientY + 'px';
  dot.addEventListener('animationend', () => dot.remove(), { once: true });
  dot.addEventListener('animationcancel', () => dot.remove(), { once: true });
  document.body.append(dot);
}, { passive: true });
