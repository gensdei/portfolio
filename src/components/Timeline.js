import { el } from './dom.js';

export function Timeline({ items, label }) {
  return el('ol', { className: 'timeline', 'aria-label': label }, items.map((item) =>
    el('li', { className: 'timeline__item' },
      el('p', { className: 'metadata timeline__date' }, item.period),
      el('div', {}, el('h3', {}, item.institution), el('p', {}, item.role), item.description ? el('p', { className: 'muted' }, item.description) : null))));
}
