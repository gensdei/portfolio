import { el } from './dom.js';
import { Badge } from './Badge.js';

export function PatentList({ items, language = 'ko' }) {
  const en = language === 'en';
  // 같은 표를 작은 화면에서 라벨이 있는 목록처럼 배치해 정보 중복을 피한다.
  const labels = en ? ['Filing date', 'Application number', 'Status'] : ['출원일', '출원번호', '상태'];
  return el('table', { className: 'patent-table' },
    el('caption', { className: 'sr-only' }, en ? 'Patent application history' : '특허 출원 이력'),
    el('thead', {}, el('tr', {}, labels.map((label) => el('th', { scope: 'col' }, label)))),
    el('tbody', {}, items.map((item) => el('tr', {},
      el('td', { 'data-label': labels[0] }, item.date),
      el('td', { 'data-label': labels[1], className: 'long-value' }, item.number),
      el('td', { 'data-label': labels[2] }, Badge({ label: en ? 'Filed' : '출원' }))))));
}
