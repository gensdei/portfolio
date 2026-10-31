import { el } from './dom.js';

export function LanguageSwitch({ value = 'ko', onChange }) {
  const group = el('div', { className: 'language-switch', role: 'group', 'aria-label': '언어 / Language' });
  const buttons = ['ko', 'en'].map((language) => {
    const button = el('button', { type: 'button', lang: language, 'aria-pressed': String(value === language), onClick: () => {
      buttons.forEach((item, i) => item.setAttribute('aria-pressed', String(['ko', 'en'][i] === language)));
      onChange?.(language);
    } }, language === 'ko' ? '한국어' : 'English');
    group.append(button);
    return button;
  });
  return group;
}
