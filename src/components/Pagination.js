import { el } from './dom.js';
import { Button } from './Button.js';

export function Pagination({ page = 1, total, pageSize = 20, onChange, language = 'ko' }) {
  const count = Math.ceil(total / pageSize);
  if (count < 2) return el('div');
  const node = el('nav', { className: 'pagination', 'aria-label': language === 'ko' ? '결과 페이지' : 'Result pages' });
  node.append(Button({ label: language === 'ko' ? '이전' : 'Previous', variant: 'secondary', size: 'small', disabled: page === 1, onClick: () => onChange(page - 1) }));
  for (let i = 1; i <= count; i++) {
    const button = Button({ label: String(i), size: 'small', variant: page === i ? 'primary' : 'text', onClick: () => onChange(i) });
    button.setAttribute('aria-label', language === 'ko' ? `${i}페이지` : `Page ${i}`);
    if (page === i) button.setAttribute('aria-current', 'page');
    node.append(button);
  }
  node.append(Button({ label: language === 'ko' ? '다음' : 'Next', variant: 'secondary', size: 'small', disabled: page === count, onClick: () => onChange(page + 1) }));
  return node;
}
