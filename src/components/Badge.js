import { el } from './dom.js';

export function Badge({ label, tone = 'neutral' }) {
  return el('span', { className: `badge badge--${tone}` }, label);
}
