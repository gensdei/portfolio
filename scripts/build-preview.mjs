import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const visited = new Set();
const modules = [];

// 현재 프로젝트의 단순한 상대 경로 모듈을 의존 순서대로 모은다.
// 일반 자바스크립트 변환기가 아니므로 새로운 모듈 문법을 추가하면 검토해야 한다.
async function collect(path) {
  if (visited.has(path)) return;
  visited.add(path);
  const source = await readFile(path, 'utf8');
  const dependency = /^(?:import|export)\s+.*?\s+from\s+['"](\.[^'"]+)['"];?\s*$/gm;
  for (const match of source.matchAll(dependency)) await collect(resolve(dirname(path), match[1]));
  modules.push(source.replace(dependency, '').replace(/^export\s+(?=(?:function|const|let|class)\b)/gm, ''));
}
await collect(resolve(root, 'src/preview.js'));
let script = modules.join('\n').replace("document.querySelector('#app')", "document.getElementById('portfolio-compatible-app')");
// 삽입형 미리보기에서는 문서 전체의 언어 대신 화면 루트에 언어를 지정한다.
script = script.replace('document.documentElement.lang = language;', "document.getElementById('portfolio-compatible-preview').lang = language;");
script = script.replaceAll('</script', '<\\/script');
script = script.replace(/(?<![\w-])--(?=[a-z])/g, '--portfolio-');
new Script(`(() => {\n${script}\n})();`);
const styles = (await Promise.all(['theme', 'components', 'preview'].map((name) => readFile(resolve(root, `src/styles/${name}.css`), 'utf8')))).join('\n')
  .replace(/(?<![\w-])--(?=[a-z])/g, '--portfolio-')
  .replaceAll(':root', '#portfolio-compatible-preview')
  .replace(/\bbody\b/g, '#portfolio-compatible-preview');
const template = await readFile(resolve(root, 'scripts/preview-fragment.html'), 'utf8');
const fragment = template.replace('__STYLES__', () => styles).replace('__SCRIPT__', () => script);
if (Buffer.byteLength(fragment) > 1_000_000) throw new Error('미리보기 크기 제한을 초과했습니다.');
await writeFile(resolve(root, 'component-preview-fragment.html'), fragment);
const standalone = `<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Portfolio — 컴포넌트 미리보기</title></head><body style="margin:0">\n${fragment}\n</body></html>\n`;
// 기본 파일도 자체 포함 결과로 생성해 더블클릭 실행 경로를 하나로 맞춘다.
await writeFile(resolve(root, 'index.html'), standalone);
await writeFile(resolve(root, 'preview.html'), standalone);
console.log(`호환 미리보기 생성 완료: ${visited.size}개 모듈, ${Buffer.byteLength(fragment)}바이트`);
