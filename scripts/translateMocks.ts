import * as fs from 'fs';
import * as path from 'path';

// Маппинг кодов языков для Google Translate
const languageMap: Record<string, string> = {
  be: 'be',
};

// Функция для перевода текста через Google Translate
async function translateText(
  text: string,
  targetLang: string,
): Promise<string> {
  try {
    // Используем бесплатный Google Translate API через веб-интерфейс
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text,
    )}`;

    const response = await fetch(url);
    const data: any = await response.json();

    if (
      data &&
      Array.isArray(data) &&
      data[0] &&
      Array.isArray(data[0]) &&
      data[0][0] &&
      Array.isArray(data[0][0]) &&
      data[0][0][0]
    ) {
      return data[0][0][0];
    }

    return text; // Если перевод не удался, возвращаем оригинал
  } catch (error) {
    console.error(`Ошибка при переводе "${text}" на ${targetLang}:`, error);
    return text;
  }
}

// Функция для задержки между запросами (чтобы не перегружать API)
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Функция для перевода массива имен батчами
async function translateNames(
  names: string[],
  targetLang: string,
): Promise<string[]> {
  const translated: string[] = [];
  const batchSize = 5; // Переводим по 5 имен за раз

  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(names.length / batchSize);

    console.log(
      `Перевожу батч ${batchNum}/${totalBatches} (${i + 1}-${Math.min(
        i + batchSize,
        names.length,
      )}/${names.length}) на ${targetLang}...`,
    );

    // Переводим батч параллельно
    const batchPromises = batch.map(name => translateText(name, targetLang));
    const batchResults = await Promise.all(batchPromises);

    translated.push(...batchResults);

    // Задержка между батчами (200ms)
    await delay(200);
  }

  return translated;
}

// Функция для чтения файла с именами
function readNamesFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/export const \w+ = \[([\s\S]*?)\];/);

  if (!match) {
    throw new Error(`Не удалось распарсить файл: ${filePath}`);
  }

  const namesString = match[1];
  const names: string[] = [];

  // Парсим строки с именами
  const lines = namesString.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === ',') continue;

    // Ищем строки в кавычках
    const nameMatch = trimmed.match(/^['"](.*?)['"],?\s*$/);
    if (nameMatch) {
      // Обрабатываем экранированные кавычки
      const name = nameMatch[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
      names.push(name);
    }
  }

  return names;
}

// Функция для записи переведенных имен в файл
function writeNamesFile(
  filePath: string,
  names: string[],
  type: 'footballers' | 'coaches',
): void {
  const exportName = type === 'footballers' ? 'footballers' : 'coaches';
  const content = `export const ${exportName} = [\n${names
    .map(name => `  '${name.replace(/'/g, "\\'")}',`)
    .join('\n')}\n];\n`;

  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Перевести имена для одного языка
 * @param targetLang - код языка для перевода (например, 'kk')
 */
export async function translateSingleLanguage(
  targetLang: string,
): Promise<void> {
  const projectRoot = process.cwd();
  const mocksDir = path.join(projectRoot, 'src/mocks');
  const sourceLang = 'en';

  if (!languageMap[targetLang]) {
    throw new Error(`Язык ${targetLang} не найден в languageMap`);
  }

  if (targetLang === sourceLang || targetLang === 'ru') {
    throw new Error(
      `Язык ${targetLang} не может быть переведен (это исходный язык или русский)`,
    );
  }

  // Читаем исходные файлы
  const sourceFootballers = readNamesFile(
    path.join(mocksDir, `footballers-${sourceLang}.ts`),
  );
  const sourceCoaches = readNamesFile(
    path.join(mocksDir, `coaches-${sourceLang}.ts`),
  );

  console.log(`\n=== Перевод на ${targetLang} ===`);
  console.log(`Футболистов: ${sourceFootballers.length}`);
  console.log(`Тренеров: ${sourceCoaches.length}`);

  try {
    // Переводим футболистов
    console.log(`Перевожу футболистов на ${targetLang}...`);
    const translatedFootballers = await translateNames(
      sourceFootballers,
      languageMap[targetLang],
    );
    writeNamesFile(
      path.join(mocksDir, `footballers-${targetLang}.ts`),
      translatedFootballers,
      'footballers',
    );

    // Задержка перед переводом тренеров
    await delay(500);

    // Переводим тренеров
    console.log(`Перевожу тренеров на ${targetLang}...`);
    const translatedCoaches = await translateNames(
      sourceCoaches,
      languageMap[targetLang],
    );
    writeNamesFile(
      path.join(mocksDir, `coaches-${targetLang}.ts`),
      translatedCoaches,
      'coaches',
    );

    console.log(`✓ Перевод на ${targetLang} завершен`);
  } catch (error) {
    console.error(`Ошибка при переводе на ${targetLang}:`, error);
    throw error;
  }
}

// Основная функция для перевода всех языков
async function main() {
  const projectRoot = process.cwd();
  const mocksDir = path.join(projectRoot, 'src/mocks');
  const sourceLang = 'en';

  // Читаем исходные файлы
  const sourceFootballers = readNamesFile(
    path.join(mocksDir, `footballers-${sourceLang}.ts`),
  );
  const sourceCoaches = readNamesFile(
    path.join(mocksDir, `coaches-${sourceLang}.ts`),
  );

  // Получаем список всех языков кроме английского и русского (для ru используются общие файлы footballers.ts и coaches.ts)
  const targetLanguages = Object.keys(languageMap).filter(
    lang => lang !== sourceLang && lang !== 'ru',
  );

  console.log(`Начинаю перевод для ${targetLanguages.length} языков...`);
  console.log(`Футболистов: ${sourceFootballers.length}`);
  console.log(`Тренеров: ${sourceCoaches.length}`);

  // Переводим для каждого языка
  for (const lang of targetLanguages) {
    try {
      await translateSingleLanguage(lang);
      // Задержка перед следующим языком
      await delay(1000);
    } catch (error) {
      console.error(`Ошибка при переводе на ${lang}:`, error);
    }
  }

  console.log('\n✓ Все переводы завершены!');
}

// Запускаем скрипт только если он вызван напрямую
if (require.main === module) {
  main().catch(console.error);
}
