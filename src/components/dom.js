let sequence = 0;

// 라벨과 설명을 연결할 때 사용할 고유 식별자를 만든다.
export function uid(prefix = 'ui') { return `${prefix}-${++sequence}`; }

// 콘텐츠는 문자열 삽입 대신 텍스트 노드로 넣어 실행 가능한 마크업을 막는다.
export function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'className') node.className = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child !== undefined && child !== null && child !== false) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

// 외부 데이터에서 받은 주소는 웹 주소와 페이지 내부 주소만 허용한다.
export function safeHref(value) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError('이동 주소가 필요합니다.');
  // 삽입형 미리보기의 기본 주소가 비어 있어도 내부 이동은 그대로 허용한다.
  if (value.startsWith('#')) return value;
  const url = new URL(value, document.baseURI);
  if (!['http:', 'https:'].includes(url.protocol)) throw new TypeError('허용되지 않는 주소 형식입니다.');
  return url.href;
}
