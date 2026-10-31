import { el, safeHref } from './dom.js';
import { Badge } from './Badge.js';

export function ResearchCard({ paper, href, onOpen, language = 'ko', compact = false }) {
  const title = href ? el('a', { href: safeHref(href) }, paper.title) : el('span', {}, paper.title);
  const action = onOpen ? el('button', { type: 'button', className: 'text-action', onClick: () => onOpen(paper), 'aria-label': `${language === 'ko' ? '서지정보 보기' : 'View citation'}: ${paper.title}` }, language === 'ko' ? '서지정보 보기 →' : 'View citation →') : null;
  return el('article', { className: compact ? 'publication-row' : 'research-card' },
    el('p', { className: 'metadata' }, `${paper.year} · ${paper.journal} · ${paper.citation}`),
    el('h3', { className: 'publication-title', lang: 'en' }, title),
    paper.summary ? el('p', {}, paper.summary) : null,
    el('div', { className: 'research-card__footer' }, el('div', { className: 'tag-list' }, paper.tags.map((label) => Badge({ label, tone: 'teal' }))), action));
}
