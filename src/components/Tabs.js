import { el, uid } from './dom.js';

export function Tabs({ label, items, onChange }) {
  const id = uid('tabs');
  const buttons = [];
  const panels = [];
  const bar = el('div', { role: 'tablist', 'aria-label': label, className: 'tabs__bar' });
  function activate(index, moveFocus = false) {
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (moveFocus) buttons[index].focus();
    onChange?.(items[index].value);
  }
  items.forEach((item, i) => {
    const panel = el('section', { id: `${id}-panel-${i}`, role: 'tabpanel', 'aria-labelledby': `${id}-tab-${i}`, tabIndex: 0, className: 'tabs__panel' }, item.content);
    const button = el('button', {
      id: `${id}-tab-${i}`, type: 'button', role: 'tab', 'aria-controls': panel.id,
      onClick: () => activate(i),
      onKeydown: (event) => {
        const targets = { ArrowRight: (i + 1) % items.length, ArrowLeft: (i + items.length - 1) % items.length, Home: 0, End: items.length - 1 };
        if (event.key in targets) { event.preventDefault(); activate(targets[event.key], true); }
      },
    }, item.label);
    buttons.push(button); panels.push(panel); bar.append(button);
  });
  const node = el('div', { className: 'tabs' }, bar, panels);
  activate(0);
  return node;
}
