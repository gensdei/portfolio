import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { Script, runInNewContext } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let checked = 0;

// 구문 오류와 누락된 상대 경로를 배포 전에 확인한다.
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) { await inspect(path); continue; }
    if (!entry.name.endsWith('.js')) continue;
    execFileSync(process.execPath, ['--check', path]);
    const source = await readFile(path, 'utf8');
    for (const match of source.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)) await access(resolve(dirname(path), match[1]));
    checked++;
  }
}
await inspect(resolve(root, 'src'));
const { publications, patents } = await import('../src/data/publications.js');
assert.equal(publications.length, 33, '제공 논문 수가 일치해야 합니다.');
assert.equal(new Set(publications.map((paper) => paper.id)).size, 33, '논문 식별자가 중복되면 안 됩니다.');
assert.equal(patents.length, 7, '제공 출원 수가 일치해야 합니다.');

// 기본 진입 파일이 다시 외부 모듈 방식으로 바뀌는 회귀를 방지한다.
const index = await readFile(resolve(root, 'index.html'), 'utf8');
const preview = await readFile(resolve(root, 'preview.html'), 'utf8');
assert.equal(index, preview, '기본 파일과 호환 미리보기는 같아야 합니다.');
assert.ok(!/<script\b[^>]*(?:\bsrc=|type=["']module)/i.test(index), '더블클릭 실행 파일에는 외부 모듈을 넣지 않습니다.');
assert.ok(!/<link\b[^>]*rel=["']stylesheet/i.test(index), '스타일도 기본 파일 안에 포함해야 합니다.');
assert.ok(index.includes('<noscript>'), '스크립트 비활성 안내가 필요합니다.');
assert.ok(index.includes('portfolio-load-feedback'), '실행 오류 안내가 필요합니다.');
const scripts = [...index.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
assert.ok(scripts.length >= 2, '오류 처리와 화면 실행 스크립트를 분리합니다.');
for (const [, source] of scripts) new Script(source);

// 파일 주소나 격리된 주소에서도 내부 링크가 예외를 일으키지 않아야 한다.
const domSource = (await readFile(resolve(root, 'src/components/dom.js'), 'utf8')).replace(/^export /gm, '');
for (const baseURI of ['file:///Users/example/portfolio/index.html', 'about:srcdoc']) {
  const context = { URL, document: { baseURI } };
  const href = runInNewContext(`${domSource}\nsafeHref;`, context);
  assert.equal(href('#works'), '#works');
  assert.equal(href('https://example.com/paper'), 'https://example.com/paper');
  assert.throws(() => href('javascript:alert(1)'), /허용되지 않는 주소/);
}
console.log(`확인 완료: 자바스크립트 ${checked}개, 모듈 경로, 논문 33편, 출원 7건, 기본 파일의 자체 포함 실행·오류 안내·내부 링크`);
