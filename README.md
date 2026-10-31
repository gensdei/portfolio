# portfolio 컴포넌트

`design.md`의 남색·청록 테마를 적용한 브라우저 기본 HTML/CSS·JavaScript 컴포넌트입니다. 별도 패키지 설치나 빌드 없이 실행할 수 있습니다. React 등 특정 프레임워크에 의존하지 않으며 각 함수가 실제 HTML 요소를 반환합니다.

## 실행

**가장 간단한 실행:** Finder에서 이 폴더의 `index.html`을 Safari 또는 Chrome으로 엽니다. 기본 파일에 스타일·스크립트·데이터가 모두 포함되어 별도 서버와 패키지 설치가 필요하지 않습니다. `preview.html`도 동일한 내용입니다. 원본 컴포넌트를 수정한 뒤에는 Node.js에서 `npm run build:preview`로 두 파일을 함께 다시 만듭니다.

아래 서버 방식은 파일별 원본을 개발할 때 사용합니다.

터미널에서 이 폴더로 이동한 뒤 실행합니다. Python 3가 필요합니다.

```bash
cd portfolio
python3 -m http.server 4173 --bind 127.0.0.1
```

원본을 수정하며 개발할 때 브라우저에서 <http://127.0.0.1:4173/dev.html>을 엽니다. 중지는 터미널에서 `Ctrl+C`입니다. `dev.html`만 외부 모듈을 사용하므로 서버가 필요합니다. Node.js가 있으면 `npm run dev`로도 실행할 수 있습니다.

정적 검사는 Node.js 22 이상에서 `npm run check`로 실행합니다. 외부 의존성을 설치하지 않습니다.

## 파일 구조

```text
portfolio/
├── prd.md / design.md            기획·디자인 기준
├── index.html                   더블클릭 실행용 자체 포함 기본 파일
├── dev.html                     서버 개발용 외부 모듈 진입점
├── preview.html                 서버 없이 열 수 있는 자체 포함 미리보기
├── component-preview-fragment.html 대화 내 표시용 자체 포함 내용
├── package.json                 실행·검사 명령
├── src/
│   ├── components/               각 컴포넌트와 통합 내보내기
│   ├── styles/
│   │   ├── theme.css            테마·기본 글꼴·간격·인쇄
│   │   ├── components.css       재사용 컴포넌트 표현
│   │   └── preview.css          예시 화면 전용 배치
│   ├── data/publications.js     제공 논문 33편·출원 7건
│   └── preview.js               예시 조합·검색·편집 동작
└── scripts/check.mjs             구문·경로·데이터 검사
```

## 공통 사용법

페이지에서 `theme.css`, `components.css`를 순서대로 불러온 뒤 모듈 스크립트에서 필요한 컴포넌트를 가져옵니다. `preview.css`와 `preview.js`는 확인용으로, 실제 사이트에서는 가져올 필요가 없습니다.

```js
import { Button, Field, ResearchCard } from './src/components/index.js';

const save = Button({
  label: '초안 저장',
  variant: 'secondary',
  onClick: () => console.log('실제 저장 함수를 연결합니다.'),
});
document.querySelector('#actions').append(save);

const biography = Field({
  label: '자기소개',
  name: 'biography',
  type: 'textarea',
  required: true,
});
document.querySelector('#fields').append(biography);
biography.setError('자기소개를 입력해주세요.');

// 비동기 저장 시에는 시작과 종료를 모두 연결한다.
save.setBusy(true, '저장 중…');
save.setBusy(false);
```

문자열은 텍스트 노드로 넣어 실행 가능한 HTML로 처리하지 않습니다. 대화상자 등에서 마크업이 필요하면 직접 만든 HTML 요소를 전달합니다. 링크에는 웹 주소와 내부 주소만 허용합니다.

## 컴포넌트별 입력

| 파일·이름 | 주요 입력 | 동작·주의점 |
| --- | --- | --- |
| `Button.js` · `Button` | `label`, `variant`, `size`, `disabled`, `type`, `onClick` | `setBusy()`로 처리 상태 전환. 종류는 primary / secondary / teal / text / danger, 크기는 small / default / large |
| `Button.js` · `ButtonLink` | `label`, `href`, `variant`, `size` | 페이지 이동 전용 실제 링크 |
| `Badge.js` · `Badge` | `label`, `tone` | neutral / teal / success / warning / danger, 클릭 기능 없음 |
| `Alert.js` · `Alert` | `title`, `message`, `tone`, `dismissible` | info / success / warning / danger, 상태 알림과 닫기 |
| `Field.js` · `Field` | `label`, `name`, `value`, `type`, `hint`, `required`, `options` | `control`로 입력 요소 접근, `setError()`로 오류·접근성 연결. `options`는 `{label, value}` 배열 |
| `Tabs.js` · `Tabs` | `label`, `items`, `onChange` | 항목은 `{value, label, content}`. 방향키·Home·End, 전환 중 입력값 유지 |
| `Dialog.js` · `Dialog` | `title`, `description`, `content`, `confirmLabel`, `danger`, `onConfirm` | DOM에 추가한 뒤 `openDialog()`. 기본 대화상자의 초점 제한·Escape, 닫은 뒤 초점 복귀. 사용 후 필요하면 제거 |
| `LanguageSwitch.js` | `value`, `onChange` | ko / en, 선택 상태 제공. 실제 번역·주소 전환은 호출 측에서 처리 |
| `Header.js` · `Header` | `name`, `links`, `active`, `language`, `onLanguageChange` | 링크는 `{id, label, href}`. 모바일 메뉴·본문 바로가기 |
| `SectionHeading.js` | `title`, `description`, `badge`, `id`, `href`, `linkLabel` | 섹션 제목·설명·보조 링크 |
| `ResearchCard.js` | `paper`, `href`, `onOpen`, `language`, `compact` | 논문은 `{title, year, journal, citation, tags, summary?}`. href가 있으면 제목 링크, onOpen이면 서지정보 행동 |
| `SearchFilters.js` | `values`, `years`, `topics`, `onSearch`, `language` | values는 `{q, year, topic}`, 제출 시 동일 구조 전달 |
| `Pagination.js` | `page`, `total`, `pageSize`, `onChange`, `language` | 기본 20개 단위, 페이지 1부터 시작. 데이터 분할·주소 갱신은 호출 측 책임 |
| `Timeline.js` | `label`, `items` | `{period, institution, role, description?}` 배열. 호출 측에서 정렬 |
| `PatentList.js` | `items`, `language` | `{date, number}` 배열. 현재 제공 자료에 맞춰 출원 상태만 표현 |
| `EmptyState.js` | `title`, `description`, `actionLabel`, `onAction` | 빈 결과와 선택적 해결 버튼 |
| `Skeleton.js` | `label`, `count` | 움직임 없는 목록 로딩 표현 |
| `Footer.js` · `Footer` | `updatedAt`, `note` | 갱신일·보조 문구 |

## 미리보기 범위

- 실제 제공 논문 33편으로 검색·연도/분야 필터·20개 단위 페이지 이동을 확인할 수 있습니다.
- 검색 조건·페이지·표시 언어는 주소에 반영되며 새로고침과 뒤로 가기를 지원합니다.
- 인쇄 시 현재 조건에 맞는 전체 결과를 별도의 인쇄 영역에 표시합니다.
- 대표 연구는 선정안이며, 서지정보 대화상자만 제공합니다. DOI·개인 기여도를 임의로 채우지 않습니다.
- 경력은 컴포넌트 확인용 일부 항목입니다. 논문 분류와 대표 선정은 본인 검토가 필요합니다.
- 한국어·영어 전환은 예시 조합입니다. 데이터의 공식 영문 표기가 없는 부분과 일부 컴포넌트 설명은 한국어로 유지합니다.
- 편집 폼은 현재 탭의 메모리에만 입력을 보관합니다. 새로고침하면 초기화되며 로그인·서버 저장·공개 게시 기능은 연결하지 않았습니다. 게시 버튼은 비활성입니다.
- `Dialog`·`Tabs` 등 접근성 기본 동작을 구현했지만, 실제 서비스의 서버 권한 검사나 전면 접근성 인증을 대체하지 않습니다.

## 테마 변경

색상·간격·모서리는 `src/styles/theme.css`의 변수만 변경합니다. 컴포넌트별 기본 표현은 `components.css`에서 조정합니다. 변경 후 두 언어·모바일·키보드·색상 대비를 다시 확인합니다. 코드 주석은 한글로 작성합니다.

## 삽입형 미리보기 호환성

- 대화 내 표시는 별도의 모듈·상대 경로 파일을 요청하지 않는 자체 포함 방식으로 생성합니다.
- 삽입형 미리보기의 주소가 `about:srcdoc`이어도 내부 링크를 사용할 수 있습니다.
- 주소 변경이 허용되지 않으면 검색 상태를 메모리에 유지합니다. 일반 브라우저에서는 주소·뒤로 가기를 계속 지원합니다.
- 검색 버튼은 외부 폼 전송 없이 입력값을 전달하고 Enter 키로도 동작합니다.
- 생성된 미리보기의 CSS 변수는 `--portfolio-` 접두사를 사용해 호스트의 테마 변수와 구분합니다.
- SVG 렌더러·네트워크 라이브러리를 사용하지 않습니다. 다만 Codex 앱 내부 오류의 원인 자체를 패치한 것은 아닙니다.
