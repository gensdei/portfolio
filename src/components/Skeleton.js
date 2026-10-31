import { el } from './dom.js';

export function Skeleton({ label = '목록을 불러오는 중입니다', count = 3 }) {
  return el('div', { role: 'status', className: 'skeleton-list' }, el('p', { className: 'sr-only' }, label),
    Array.from({ length: count }, () => el('div', { className: 'research-card skeleton', 'aria-hidden': 'true' },
      el('div', { className: 'skeleton__line skeleton__line--short' }), el('div', { className: 'skeleton__line' }), el('div', { className: 'skeleton__line' }))));
}
