import { el, safeHref } from './dom.js';

export function Button({ label, variant = 'primary', size = 'default', disabled = false, onClick, type = 'button' }) {
  const node = el('button', { className: `button button--${variant} button--${size}`, type, disabled, onClick }, label);
  // 처리 중에는 원래의 사용 가능 상태를 보존하고 중복 실행을 막는다.
  node.setBusy = (busy, busyLabel = '처리 중…') => {
    if (busy && !node.hasAttribute('aria-busy')) {
      node.dataset.previousMinWidth = node.style.minWidth;
      node.style.minWidth = `${node.getBoundingClientRect().width}px`;
      node.dataset.previousDisabled = String(node.disabled);
      node.disabled = true;
      node.setAttribute('aria-busy', 'true');
      node.textContent = busyLabel;
    } else if (!busy && node.hasAttribute('aria-busy')) {
      node.disabled = node.dataset.previousDisabled === 'true';
      node.removeAttribute('aria-busy');
      node.style.minWidth = node.dataset.previousMinWidth || '';
      node.textContent = label;
    }
  };
  return node;
}

export function ButtonLink({ label, href, variant = 'primary', size = 'default' }) {
  return el('a', { className: `button button--${variant} button--${size}`, href: safeHref(href) }, label);
}
