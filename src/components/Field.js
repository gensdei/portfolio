import { el, uid } from './dom.js';

export function Field({ label, name, value = '', type = 'text', hint = '', required = false, placeholder = '', options }) {
  const id = uid('field');
  const control = el(options ? 'select' : type === 'textarea' ? 'textarea' : 'input', {
    id, name, className: 'field-control', required, placeholder,
    type: options || type === 'textarea' ? undefined : type,
  });
  if (options) for (const item of options) control.append(el('option', { value: item.value }, item.label));
  control.value = value;
  const help = hint ? el('p', { id: `${id}-hint`, className: 'field__hint' }, hint) : null;
  const error = el('p', { id: `${id}-error`, className: 'field__error', hidden: true });
  const node = el('div', { className: 'field' },
    el('label', { for: id }, label, required ? el('span', { className: 'field__required' }, '필수') : null), control, help, error);
  node.control = control;
  node.setError = (message = '') => {
    error.textContent = message;
    error.hidden = !message;
    control.setAttribute('aria-invalid', String(Boolean(message)));
    const descriptions = [help?.id, message ? error.id : null].filter(Boolean);
    if (descriptions.length) control.setAttribute('aria-describedby', descriptions.join(' '));
    else control.removeAttribute('aria-describedby');
  };
  node.setError();
  return node;
}
