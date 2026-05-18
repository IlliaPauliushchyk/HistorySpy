/**
 * Переводит goldenBoot-en.ts на все поддерживаемые языки через Google Translate.
 * Использование: npx ts-node scripts/translateGoldenBootAll.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const languageMap: Record<string, string> = {
  be: 'be',
};

async function translateText(
  text: string,
  targetLang: string,
): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text,
    )}`;
    const response = await fetch(url);
    const data: unknown = await response.json();
    const arr = data as unknown[][][];
    if (arr?.[0]?.[0]?.[0]) return String(arr[0][0][0]);
    return text;
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
    await delay(200);
  }
  return translated;
}

function readGoldenBootFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/export const goldenBoot = \[([\s\S]*?)\];/);
  if (!match) throw new Error(`Не удалось распарсить: ${filePath}`);
  const lines = match[1]
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  return lines
    .map(line => line.match(/^['"](.*?)['"],?\s*$/)?.[1]?.replace(/\\'/g, "'"))
    .filter((n): n is string => !!n);
}

function writeGoldenBootFile(filePath: string, names: string[]): void {
  const content = `export const goldenBoot = [\n${names
    .map(n => `  '${n.replace(/'/g, "\\'")}',`)
    .join('\n')}\n];\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

async function translateGoldenBootForLanguage(
  targetLang: string,
): Promise<void> {
  const projectRoot = process.cwd();
  const mocksDir = path.join(projectRoot, 'src/mocks');
  const sourcePath = path.join(mocksDir, 'goldenBoot-en.ts');
  const targetPath = path.join(mocksDir, `goldenBoot-${targetLang}.ts`);

  if (!languageMap[targetLang] || targetLang === 'en' || targetLang === 'ru') {
    throw new Error(`Пропуск языка: ${targetLang}`);
  }

  const names = readGoldenBootFile(sourcePath);
  console.log(`Перевожу goldenBoot на ${targetLang} (${names.length} имён)...`);
  const translated = await translateNames(names, targetLang);
  writeGoldenBootFile(targetPath, translated);
}

async function main() {
  const targetLanguages = Object.keys(languageMap).filter(
    l => l !== 'en' && l !== 'ru',
  );
  console.log(
    `Перевод goldenBoot на ${targetLanguages.length} языков через Google Translate\n`,
  );

  for (const lang of targetLanguages) {
    try {
      await translateGoldenBootForLanguage(lang);
      await delay(400);
    } catch (e) {
      console.error(`Ошибка для ${lang}:`, e);
    }
  }

  console.log('\n✓ Готово.');
}

main().catch(console.error);
