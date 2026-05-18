/**
 * Переводит belarusianLegends-en.ts на все поддерживаемые языки через Google Translate.
 * Использование: npx ts-node scripts/translateBelarusianLegendsAll.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const languageMap: Record<string, string> = {
  be: 'be',
};

function parseTranslateResponse(data: unknown, original: string): string {
  const arr = data as unknown[][][];
  if (!arr?.[0] || !Array.isArray(arr[0])) return original;
  const segments = arr[0]
    .map((s: unknown) => (Array.isArray(s) && s[0] != null ? String(s[0]) : ''))
    .filter(Boolean);
  if (segments.length === 0) return original;
  const result = segments.join('').trim();
  if (
    result === ',' ||
    result === "','" ||
    result.length < 2 ||
    /^[,.\s]+$/.test(result)
  ) {
    return original;
  }
  return result;
}

function normalizeApostrophes(s: string): string {
  return s
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"');
}

async function translateText(
  text: string,
  targetLang: string,
): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text,
    )}`;
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('json')) return text;
    const data: unknown = await response.json();
    const result = parseTranslateResponse(data, text);
    return normalizeApostrophes(result);
  } catch (error) {
    console.error(`Ошибка перевода "${text}" на ${targetLang}:`, error);
    return text;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateNames(
  names: string[],
  targetLang: string,
): Promise<string[]> {
  const translated: string[] = [];
  const batchSize = 5;
  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(names.length / batchSize);
    console.log(`  Батч ${batchNum}/${totalBatches} (${targetLang})...`);
    const results = await Promise.all(
      batch.map(n => translateText(n, languageMap[targetLang])),
    );
    translated.push(...results);
    await delay(300);
  }
  return translated;
}

function readBelarusianLegendsFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(
    /export const belarusianLegends = \[([\s\S]*?)\];/,
  );
  if (!match) throw new Error(`Не удалось распарсить: ${filePath}`);
  const arrayContent = match[1];
  const stringRegex = /"([^"]*)"|'((?:[^'\\]|\\.)*)'/g;
  const names: string[] = [];
  let m;
  while ((m = stringRegex.exec(arrayContent)) !== null) {
    const name = (m[1] ?? m[2]).replace(/\\'/g, "'").replace(/\\"/g, '"');
    names.push(name);
  }
  return names;
}

function escapeForJsString(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r\n|\r|\n/g, ' ');
}

function writeBelarusianLegendsFile(
  filePath: string,
  names: string[],
): void {
  const content = `export const belarusianLegends = [\n${names
    .map(n => `  '${escapeForJsString(n)}',`)
    .join('\n')}\n];\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

async function translateBelarusianLegendsForLanguage(
  targetLang: string,
): Promise<void> {
  const projectRoot = process.cwd();
  const mocksDir = path.join(projectRoot, 'src/mocks');
  const sourcePath = path.join(mocksDir, 'belarusianLegends-en.ts');
  const targetPath = path.join(mocksDir, `belarusianLegends-${targetLang}.ts`);

  if (!languageMap[targetLang] || targetLang === 'en' || targetLang === 'ru') {
    throw new Error(`Пропуск языка: ${targetLang}`);
  }

  const names = readBelarusianLegendsFile(sourcePath);
  console.log(
    `Перевожу belarusianLegends на ${targetLang} (${names.length} имён)...`,
  );
  const translated = await translateNames(names, targetLang);
  writeBelarusianLegendsFile(targetPath, translated);
}

async function main() {
  const targetLanguages = Object.keys(languageMap).filter(
    l => l !== 'en' && l !== 'ru',
  );
  console.log(
    `Перевод belarusianLegends на ${targetLanguages.length} языков через Google Translate\n`,
  );

  for (const lang of targetLanguages) {
    try {
      await translateBelarusianLegendsForLanguage(lang);
      await delay(500);
    } catch (e) {
      console.error(`Ошибка для ${lang}:`, e);
    }
  }

  console.log('\n✓ Готово.');
}

main().catch(console.error);
