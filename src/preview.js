import { el } from './components/dom.js';
import { Button, ButtonLink, Badge, Alert, Field, Tabs, Dialog, Header, Footer, SectionHeading, ResearchCard, SearchFilters, Pagination, Timeline, PatentList, EmptyState, Skeleton } from './components/index.js';
import { publications, patents } from './data/publications.js';

const app = document.querySelector('#app');
let queryState = new URLSearchParams(location.search);
const params = () => new URLSearchParams(queryState);
let language = params().get('lang') === 'en' ? 'en' : 'ko';
const drafts = { ko: '생물정보학과 계산생물학을 연구하며, 기계학습·신호처리·네트워크 생물학에 관심을 두고 있습니다.', en: 'My research interests span bioinformatics and computational biology, with a focus on machine learning, signal processing, and network biology.' };
const t = (ko, en) => language === 'ko' ? ko : en;

// 주소의 검색 조건을 단일 상태로 사용해 새로고침과 뒤로 가기를 지원한다.
function updateUrl(changes) {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries(changes)) {
    if (value === '' || value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, String(value));
  }
  queryState = new URLSearchParams(url.search);
  // 대화 안의 제한된 미리보기에서는 주소 변경 없이 검색 상태를 유지한다.
  try { history.pushState(null, '', url); }
  catch (error) { if (error.name !== 'SecurityError') throw error; }
}

function openCitation(paper) {
  const dialog = Dialog({
    title: t('논문 서지정보', 'Publication citation'),
    description: t('사용자 제공 목록을 반영한 컴포넌트 예시입니다. DOI·개인 기여도는 아직 입력되지 않았습니다.', 'This component uses the supplied publication list. DOI and individual contributions have not been provided.'),
    content: el('div', { className: 'citation-detail' }, el('h3', { lang: 'en' }, paper.title), el('p', { className: 'metadata' }, `${paper.year} · ${paper.journal} · ${paper.citation}`)),
    confirmLabel: t('확인', 'Done'),
  });
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.openDialog();
}

function makeLibrary() {
  const root = el('div');
  function render(focus = false) {
    const query = params();
    const values = { q: query.get('q') || '', year: query.get('year') || '', topic: query.get('topic') || '' };
    const rows = publications.filter((paper) => (!values.year || String(paper.year) === values.year)
      && (!values.topic || paper.tags.includes(values.topic))
      && `${paper.title} ${paper.journal} ${paper.tags.join(' ')}`.toLowerCase().includes(values.q.trim().toLowerCase()));
    const page = Math.min(Math.max(1, Number.parseInt(query.get('page'), 10) || 1), Math.max(1, Math.ceil(rows.length / 20)));
    const apply = (changes) => { updateUrl(changes); render(true); };
    const reset = () => apply({ q: '', year: '', topic: '', page: '' });
    const heading = SectionHeading({ title: t('전체 연구·논문', 'All publications'), id: 'results-title', description: t('제공된 논문 33편 · 연구 분야 분류는 검토용 제안입니다.', '33 supplied publications · Topic assignments are draft suggestions.') });
    root.replaceChildren(heading,
      SearchFilters({ values, years: [...new Set(publications.map((p) => p.year))], topics: [...new Set(publications.flatMap((p) => p.tags))], language, onSearch: (next) => apply({ ...next, page: '' }) }),
      el('div', { className: 'results-summary' }, el('p', { role: 'status' }, t(`검색 결과 ${rows.length}편`, `${rows.length} publications found`)),
        Button({ label: t('조건 초기화', 'Clear filters'), variant: 'text', size: 'small', onClick: reset })),
      el('div', { className: 'screen-results' }, rows.length ? rows.slice((page - 1) * 20, page * 20).map((paper) => ResearchCard({ paper, compact: true, language, onOpen: openCitation })) : EmptyState({ title: t('조건에 맞는 연구가 없습니다', 'No publications match these filters'), actionLabel: t('조건 초기화', 'Clear filters'), onAction: reset })),
      el('div', { className: 'print-results' }, rows.map((paper) => ResearchCard({ paper, compact: true }))),
      Pagination({ page, total: rows.length, language, onChange: (next) => apply({ page: next }) }));
    if (focus) root.querySelector('#results-title').focus();
  }
  render();
  root.refresh = render;
  return root;
}

function makeEditor() {
  const output = el('div', { className: 'stack', 'aria-live': 'polite' });
  const fields = {};
  const editor = el('form', { className: 'admin-editor', onSubmit: (event) => event.preventDefault() });
  const languages = [{ value: 'ko', label: '한국어' }, { value: 'en', label: 'English' }];
  const tabs = Tabs({ label: t('자기소개 편집 언어', 'Biography language'), items: languages.map(({ value, label }) => {
    const field = Field({ label: value === 'ko' ? '자기소개' : 'Biography', name: `bio-${value}`, type: 'textarea', value: drafts[value], required: true, hint: value === 'ko' ? '이 예시는 현재 탭의 메모리에서만 초안을 보관합니다.' : 'This preview keeps drafts only in this tab’s memory.' });
    fields[value] = field;
    field.control.addEventListener('input', () => { drafts[value] = field.control.value; field.setError(); });
    return { value, label, content: field };
  }) });
  function validate() {
    let valid = true;
    for (const key of Object.keys(fields)) {
      const empty = !fields[key].control.value.trim();
      fields[key].setError(empty ? (key === 'ko' ? '자기소개를 입력해주세요.' : 'Please enter a biography.') : '');
      valid = valid && !empty;
    }
    if (!valid) {
      output.replaceChildren(Alert({ tone: 'danger', title: t('입력 내용을 확인해주세요', 'Check the form'), message: t('한국어와 영어 탭의 필수 항목을 확인해주세요.', 'Check the required fields in both language tabs.') }));
      for (const key of Object.keys(fields)) if (fields[key].control.getAttribute('aria-invalid') === 'true') {
        const index = key === 'ko' ? 0 : 1;
        tabs.querySelectorAll('[role="tab"]')[index].click();
        fields[key].control.focus(); break;
      }
    }
    return valid;
  }
  const save = Button({ label: t('초안 저장 예시', 'Try draft save'), variant: 'secondary', onClick: async () => {
    if (!validate()) return;
    save.setBusy(true, t('저장 중…', 'Saving…'));
    await new Promise((resolve) => setTimeout(resolve, 500));
    output.replaceChildren(Alert({ tone: 'success', title: t('메모리에 초안을 보관했습니다', 'Draft held in memory'), message: t('새로고침하면 초기화됩니다. 실제 서버 저장이나 공개 게시는 수행하지 않습니다.', 'Reloading resets this demo. No server write or publication was performed.'), dismissible: true }));
    save.setBusy(false);
  } });
  const preview = Button({ label: t('미리보기', 'Preview'), variant: 'secondary', onClick: () => {
    if (!validate()) return;
    const dialog = Dialog({ title: t('자기소개 미리보기', 'Biography preview'), description: t('현재 입력한 초안이며 공개되지 않습니다.', 'This is an unpublished draft.'), content: el('p', {}, drafts[language]), confirmLabel: t('확인', 'Done') });
    document.body.append(dialog);
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    dialog.openDialog();
  } });
  editor.append(Alert({ title: t('관리자 UI 예시', 'Admin UI preview'), message: t('실제 인증·게시 연결 전 단계입니다. 본인만 편집하는 권한 검사는 서버 구현 시 연결해야 합니다.', 'Authentication and publication are not connected. Owner authorization must be enforced on the server.') }),
    el('div', { className: 'tag-list' }, Badge({ label: t('초안', 'Draft') }), Badge({ label: t('번역 검토 전', 'Translation pending') })), tabs, output,
    el('div', { className: 'editor-actions button-group' }, save, preview, Button({ label: t('게시 · 서버 연결 필요', 'Publish · server required'), disabled: true })));
  return editor;
}

function makeShowcase() {
  const swatches = [['주요 색상', '--primary', '#17324D'], ['보조 색상', '--secondary', '#0F766E'], ['기본 본문', '--text', '#1F2937'], ['보조 배경', '--surface', '#F6F8FA']];
  const colors = el('div', { className: 'swatches' }, swatches.map(([label, token, hex]) =>
    el('div', { className: 'swatch' }, el('div', { className: 'swatch__color', style: `--swatch: var(${token})` }), el('div', { className: 'swatch__label' }, label, el('code', {}, hex)))));
  const demoOutput = el('div', { className: 'stack' });
  const panel = el('div', { className: 'preview-panel' }, el('h3', {}, t('버튼 · 상태 · 크기', 'Buttons · states · sizes')),
    el('div', { className: 'button-group' },
      ['primary', 'secondary', 'teal', 'text', 'danger'].map((variant) => Button({ label: ({ primary: '주요 버튼', secondary: '보조 버튼', teal: '청록 버튼', text: '텍스트 버튼', danger: '위험 행동' })[variant], variant, onClick: () => demoOutput.replaceChildren(Alert({ tone: 'info', message: `${variant} 버튼을 선택했습니다.`, dismissible: true })) })),
      Button({ label: '작은 버튼 · 44px', size: 'small', variant: 'secondary' }), Button({ label: '큰 버튼 · 52px', size: 'large' }), Button({ label: '비활성 버튼', disabled: true })), demoOutput);
  const loading = Button({ label: '저장', variant: 'secondary' });
  loading.setBusy(true, '저장 중…');
  panel.querySelector('.button-group').append(loading);
  const alerts = el('div', { className: 'stack' },
    Alert({ tone: 'success', title: '초안 저장됨', message: '공개본은 변경되지 않았습니다.' }),
    Alert({ tone: 'warning', title: '저장하지 않은 변경사항', message: '화면을 나가기 전에 입력 내용을 확인해주세요.' }),
    Alert({ tone: 'danger', title: '저장 실패', message: '입력 내용은 유지됩니다. 다시 시도해주세요.' }));
  const required = Field({ label: '필수 입력 예시', name: 'example', required: true, hint: '이름과 라벨을 연결한 입력 컴포넌트입니다.' });
  required.setError('필수 항목을 입력해주세요.');
  const confirm = Dialog({ title: '휴지통으로 이동할까요?', description: '컴포넌트 동작 확인용입니다. 실제 데이터는 삭제하지 않습니다.', confirmLabel: '휴지통으로 이동', danger: true, onConfirm: () => demoOutput.replaceChildren(Alert({ tone: 'success', message: '대화상자 확인 동작이 완료되었습니다. 실제 삭제는 수행하지 않았습니다.' })) });
  const dialogButton = Button({ label: '확인 대화상자 열기', variant: 'danger', onClick: () => confirm.openDialog() });
  return el('div', { className: 'stack' }, colors, panel, el('div', { className: 'preview-grid' }, el('div', { className: 'preview-panel stack' }, el('h3', {}, '입력·확인 대화상자'), required, dialogButton, confirm), alerts),
    el('div', { className: 'preview-grid' }, EmptyState({ title: '조건에 맞는 연구가 없습니다', description: '검색 조건을 바꾸거나 초기화해주세요.' }), Skeleton({ count: 1 })));
}

let library;
function render() {
  document.documentElement.lang = language;
  library = makeLibrary();
  const main = el('main', { id: 'main', tabIndex: -1 },
    el('div', { className: 'container' },
      el('div', { className: 'preview-label no-print' }, el('span', {}, 'PORTFOLIO / UI LIBRARY'), t('컴포넌트 미리보기 · 디자인 가이드 v1.0', 'Component preview · Design guide v1.0')),
      el('section', { id: 'intro', className: 'hero' },
        el('p', { className: 'hero__eyebrow', lang: 'en' }, 'Bioinformatics · Computational Biology'),
        el('h1', { className: 'reading' }, t('생물정보학과 계산생물학으로 생명 데이터를 이해합니다.', 'Understanding biological data through bioinformatics and computational biology.')),
        el('p', { className: 'metadata' }, t('[이름 입력] · 소속·직함 입력 예정', '[Name] · Affiliation and title to be confirmed')),
        el('p', { className: 'reading hero__intro' }, drafts[language]),
        el('div', { className: 'tag-list' }, [t('기계학습', 'Machine Learning'), t('신호처리', 'Signal Processing'), t('네트워크 생물학', 'Network Biology')].map((label) => Badge({ label, tone: 'teal' }))),
        ButtonLink({ label: t('전체 작업물 보기 →', 'Explore publications →'), href: '#works', size: 'large' })),
      el('section', { className: 'section', 'aria-labelledby': 'featured-title' },
        SectionHeading({ title: t('대표 연구', 'Featured research'), badge: t('선정안', 'Draft selection'), id: 'featured-title', href: '#works', linkLabel: t('전체 연구 보기', 'View all research') }),
        el('div', { className: 'stack' }, ['PUB-01', 'PUB-02', 'PUB-23'].map((id) => ResearchCard({ paper: publications.find((paper) => paper.id === id), language, onOpen: openCitation })))),
      el('section', { id: 'works', className: 'section preview-section' }, library),
      el('section', { id: 'career', className: 'section preview-section' }, SectionHeading({ title: t('학력·경력', 'Education & experience'), description: t('컴포넌트 예시로 일부 이력을 표시합니다.', 'Selected entries for component demonstration.') }),
        Timeline({ label: t('학력·경력 예시', 'Example history'), items: language === 'ko' ? [{ period: '2019.02–현재', institution: '국립암센터 유전체분석팀', role: '연구원' }, { period: '2012.04–2013.04', institution: '이화여자대학교', role: '연구교수' }, { period: '2003.03–2009.02', institution: '한양대학교 생물정보학과', role: '박사' }] : [{ period: '2003.03–2009.02', institution: '한양대학교 생물정보학과', role: '박사 · Official English wording pending' }] })),
      el('section', { id: 'patents', className: 'section preview-section' }, SectionHeading({ title: t('특허 출원', 'Patent applications'), description: t('DNA 혼합물을 이용한 차세대 염기서열분석의 위양성 및 위음성 오류 분석 방법 · 동일 제목 발명의 출원 이력 7건', '7 application records under the same supplied invention title. Official English title pending.') }), PatentList({ items: patents, language })),
      el('section', { id: 'components', className: 'section preview-section no-print' }, SectionHeading({ title: t('기본 컴포넌트', 'Component library'), description: t('같은 테마를 공유하는 색상·버튼·입력·상태 요소입니다.', 'Shared theme primitives and interaction states.') }), makeShowcase())),
    el('section', { id: 'editor', className: 'section admin-preview no-print' }, el('div', { className: 'container' }, SectionHeading({ title: t('자기소개 편집 컴포넌트', 'Biography editor component'), description: t('실제 관리자 인증을 연결하기 전의 동작 예시입니다.', 'Interaction example before server authentication is connected.') }), makeEditor())));
  app.replaceChildren(Header({ name: t('연구자 포트폴리오', 'Research portfolio'), language, active: 'intro', links: [{ id: 'intro', label: t('소개', 'About'), href: '#intro' }, { id: 'works', label: t('연구·논문', 'Publications'), href: '#works' }, { id: 'career', label: t('학력·경력', 'Career'), href: '#career' }, { id: 'patents', label: t('특허', 'Patents'), href: '#patents' }], onLanguageChange: (next) => {
    language = next; updateUrl({ lang: next }); render();
    app.querySelector(`.language-switch button[lang="${next}"]`).focus();
  } }), main, Footer({ updatedAt: t('마지막 업데이트 · 2026.10.31', 'Updated · 2026.10.31'), note: t('컴포넌트 미리보기 · 외부 공개·서버 저장 없음', 'Component preview · No publishing or server persistence') }));
}
window.addEventListener('popstate', () => { queryState = new URLSearchParams(location.search); language = params().get('lang') === 'en' ? 'en' : 'ko'; render(); });
render();
