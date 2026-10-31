import { el } from './dom.js';
import { Button } from './Button.js';

export function Alert({ title, message, tone = 'info', dismissible = false }) {
  const node = el('div', { className: `alert alert--${tone}`, role: tone === 'danger' ? 'alert' : 'status' },
    el('span', { className: 'alert__symbol', 'aria-hidden': 'true' }, tone === 'success' ? '✓' : '!'),
    el('div', {}, title ? el('strong', {}, title) : null, message ? el('p', {}, message) : null));
  if (dismissible) node.append(Button({ label: '닫기', variant: 'text', size: 'small', onClick: () => node.remove() }));
  return node;
}
