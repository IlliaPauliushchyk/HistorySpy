/**
 * Переводит forwards-en.ts на все поддерживаемые языки через Google Translate.
 * Использование: npx ts-node scripts/translateForwardsAll.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const languageMap: Record<string, string> = {
  be: 'be',
};

async function translateText(text: string, targetLang: string): Promise<string> {
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

function readForwardsFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/export const forwards = \[([\s\S]*?)\];/);
  if (!match) throw new Error(`Не удалось распарсить: ${filePath}`);
  const arrayContent = match[1];

  // Корректно парсит строки с апострофами внутри имени.
  const nameRegex = /"([^"]*)"|'((?:[^'\\]|\\.)*)'/g;
  const names: string[] = [];
  let nameMatch: RegExpExecArray | null;

  while ((nameMatch = nameRegex.exec(arrayContent)) !== null) {
    const name = (nameMatch[1] ?? nameMatch[2] ?? '')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"');
    names.push(name);
  }

  return names;
}

function writeForwardsFile(filePath: string, names: string[]): void {
  const content = `export const forwards = [\n${names
    .map(n => `  "${n.replace(/"/g, '\\"')}",`)
    .join('\n')}\n];\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

async function translateForwardsForLanguage(targetLang: string): Promise<void> {
  const projectRoot = process.cwd();
  const mocksDir = path.join(projectRoot, 'src/mocks');
  const sourcePath = path.join(mocksDir, 'forwards-en.ts');
  const targetPath = path.join(mocksDir, `forwards-${targetLang}.ts`);

  if (!languageMap[targetLang] || targetLang === 'en' || targetLang === 'ru') {
    throw new Error(`Пропуск языка: ${targetLang}`);
  }

  const names = readForwardsFile(sourcePath);
  console.log(`Перевожу forwards на ${targetLang} (${names.length} имён)...`);
  const translated = await translateNames(names, targetLang);
  writeForwardsFile(targetPath, translated);
}

async function main() {
  const targetLanguages = Object.keys(languageMap).filter(
    l => l !== 'en' && l !== 'ru',
  );
  console.log(
    `Перевод forwards на ${targetLanguages.length} языков через Google Translate\n`,
  );

  for (const lang of targetLanguages) {
    try {
      await translateForwardsForLanguage(lang);
      await delay(400);
    } catch (e) {
      console.error(`Ошибка для ${lang}:`, e);
    }
  }

  console.log('\n✓ Готово.');
}

main().catch(console.error);
