import { el, safeHref } from './dom.js';
import { Badge } from './Badge.js';

export function SectionHeading({ title, description, badge, href, linkLabel, id }) {
  return el('div', { className: 'section-heading' },
    el('div', {}, el('div', { className: 'section-heading__title' }, el('h2', { id, tabIndex: id ? -1 : undefined }, title), badge ? Badge({ label: badge }) : null),
      description ? el('p', { className: 'muted' }, description) : null),
    href ? el('a', { href: safeHref(href), className: 'section-heading__link' }, linkLabel, ' →') : null);
}
