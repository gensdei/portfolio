import { el } from './dom.js';
import { Field } from './Field.js';
import { Button } from './Button.js';

export function SearchFilters({ values = {}, years, topics, onSearch, language = 'ko' }) {
  const en = language === 'en';
  const search = Field({ label: en ? 'Search publications' : '논문 검색', name: 'q', value: values.q, type: 'search', placeholder: en ? 'Title, journal, keyword' : '논문 제목, 학술지, 키워드' });
  const year = Field({ label: en ? 'Year' : '연도', name: 'year', value: values.year, options: [{ label: en ? 'All years' : '전체 연도', value: '' }, ...years.map((value) => ({ label: String(value), value: String(value) }))] });
  const topic = Field({ label: en ? 'Research area' : '연구 분야', name: 'topic', value: values.topic, options: [{ label: en ? 'All areas' : '전체 분야', value: '' }, ...topics.map((value) => ({ label: value, value }))] });
  // 제한된 삽입 화면에서도 외부 폼 전송 없이 검색 조건을 전달한다.
  const apply = () => onSearch({ q: search.control.value, year: year.control.value, topic: topic.control.value });
  const node = el('form', { className: 'search-filters', role: 'search', 'aria-label': en ? 'Publication filters' : '논문 검색 조건' }, search, year, topic,
    Button({ label: en ? 'Search' : '검색', onClick: apply }));
  node.addEventListener('submit', (event) => { event.preventDefault(); apply(); });
  search.control.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); apply(); } });
  return node;
}
