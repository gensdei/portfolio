import { el, uid } from './dom.js';
import { Button } from './Button.js';

export function Dialog({ title, description, content, confirmLabel = '확인', onConfirm, danger = false }) {
  const id = uid('dialog');
  let trigger;
  const cancel = Button({ label: '취소', variant: 'secondary', onClick: () => node.close() });
  const confirm = Button({ label: confirmLabel, variant: danger ? 'danger' : 'primary', onClick: async () => {
    confirm.setBusy(true);
    try { await onConfirm?.(); node.close(); }
    catch { feedback.textContent = '작업을 완료하지 못했습니다. 다시 시도해주세요.'; }
    finally { confirm.setBusy(false); }
  } });
  const feedback = el('p', { role: 'alert', className: 'field__error' });
  const node = el('dialog', { className: 'dialog', 'aria-labelledby': `${id}-title`, 'aria-describedby': description ? `${id}-description` : undefined },
    el('h2', { id: `${id}-title` }, title),
    description ? el('p', { id: `${id}-description` }, description) : null,
    content, feedback, el('div', { className: 'button-group' }, cancel, confirm));
  // 기본 대화상자를 사용해 초점 제한과 Escape 닫기를 브라우저에 맡긴다.
  node.openDialog = () => { trigger = document.activeElement; node.showModal(); cancel.focus(); };
  node.addEventListener('close', () => trigger?.focus());
  return node;
}
