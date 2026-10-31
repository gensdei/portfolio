import { el } from './dom.js';

export function Footer({ updatedAt, note }) {
  return el('footer', { className: 'site-footer' }, el('div', { className: 'container footer-inner' },
    el('p', {}, updatedAt), note ? el('p', {}, note) : null));
}
