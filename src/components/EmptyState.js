import { el } from './dom.js';
import { Button } from './Button.js';

export function EmptyState({ title, description, actionLabel, onAction }) {
  return el('div', { className: 'empty-state' }, el('h3', {}, title),
    description ? el('p', { className: 'muted' }, description) : null,
    onAction ? Button({ label: actionLabel, variant: 'secondary', onClick: onAction }) : null);
}
