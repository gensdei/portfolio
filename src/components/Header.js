import { el, safeHref, uid } from './dom.js';
import { Button } from './Button.js';
import { LanguageSwitch } from './LanguageSwitch.js';

export function Header({ name, links, active, language = 'ko', onLanguageChange }) {
  const en = language === 'en';
  const id = uid('navigation');
  const nav = el('nav', { id, className: 'site-nav', 'aria-label': en ? 'Main navigation' : '주요 메뉴' },
    links.map((link) => el('a', { href: safeHref(link.href), 'aria-current': link.id === active ? 'page' : undefined }, link.label)));
  const menu = Button({ label: en ? 'Menu' : '메뉴', variant: 'secondary', size: 'small', onClick: () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  } });
  menu.classList.add('menu-toggle');
  menu.setAttribute('aria-controls', id);
  menu.setAttribute('aria-expanded', 'false');
  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.focus(); }
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }
  });
  return el('header', { className: 'site-header' },
    el('a', { href: '#main', className: 'skip-link' }, en ? 'Skip to content' : '본문 바로가기'),
    el('div', { className: 'container header-inner' },
      el('a', { href: '#intro', className: 'site-name' }, name),
      el('div', { className: 'header-actions' }, LanguageSwitch({ value: language, onChange: onLanguageChange }), menu), nav));
}
