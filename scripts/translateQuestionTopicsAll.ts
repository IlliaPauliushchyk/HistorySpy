/**
 * Переводит примеры вопросов (rules.questionTopicsTitle, questionTopicsDescription, questionTopic1..30)
 * с английского на все поддерживаемые языки через Google Translate.
 * Использование: npx ts-node scripts/translateQuestionTopicsAll.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const languageMap: Record<string, string> = {
  be: 'be',
};

const QUESTION_KEYS = [
  'questionTopicsTitle',
  'questionTopicsDescription',
  ...Array.from({ length: 30 }, (_, i) => `questionTopic${i + 1}`),
];

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
    console.error(`Ошибка перевода на ${targetLang}:`, error);
    return text;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateQuestionTopics(
  texts: Record<string, string>,
  targetLang: string,
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const batchSize = 5;
  const keys = Object.keys(texts);

  for (let i = 0; i < keys.length; i += batchSize) {
    const batchKeys = keys.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(keys.length / batchSize);
    console.log(`  Батч ${batchNum}/${totalBatches} (${targetLang})...`);
    const translated = await Promise.all(
      batchKeys.map(k =>
        translateText(texts[k], languageMap[targetLang] ?? targetLang),
      ),
    );
    batchKeys.forEach((k, j) => {
      result[k] = translated[j];
    });
    await delay(200);
  }
  return result;
}

function getSourceQuestions(enPath: string): Record<string, string> {
  const content = fs.readFileSync(enPath, 'utf-8');
  const data = JSON.parse(content) as { translation?: { rules?: Record<string, string> } };
  const rules = data?.translation?.rules ?? {};
  const out: Record<string, string> = {};
  for (const key of QUESTION_KEYS) {
    if (typeof rules[key] === 'string') out[key] = rules[key];
  }
  return out;
}

function mergeQuestionsIntoLangFile(
  filePath: string,
  questions: Record<string, string>,
): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content) as {
    translation?: { rules?: Record<string, unknown> };
  };
  if (!data.translation) data.translation = {};
  if (!data.translation.rules) data.translation.rules = {};
  const rules = data.translation.rules as Record<string, string>;
  for (const [key, value] of Object.entries(questions)) {
    rules[key] = value;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function translateQuestionsForLanguage(
  targetLang: string,
  sourceQuestions: Record<string, string>,
  languagesDir: string,
): Promise<void> {
  if (targetLang === 'en' || targetLang === 'ru') return;

  const targetPath = path.join(languagesDir, `${targetLang}.json`);
  if (!fs.existsSync(targetPath)) {
    console.warn(`  Файл не найден: ${targetPath}, пропуск.`);
    return;
  }

  console.log(`Перевод примеров вопросов на ${targetLang} (${QUESTION_KEYS.length} строк)...`);
  const translated = await translateQuestionTopics(
    sourceQuestions,
    targetLang,
  );
  mergeQuestionsIntoLangFile(targetPath, translated);
}

async function main() {
  const projectRoot = process.cwd();
  const languagesDir = path.join(
    projectRoot,
    'src/localization/languages',
  );
  const enPath = path.join(languagesDir, 'en.json');

  if (!fs.existsSync(enPath)) {
    throw new Error(`Не найден файл-источник: ${enPath}`);
  }

  const sourceQuestions = getSourceQuestions(enPath);
  if (Object.keys(sourceQuestions).length !== QUESTION_KEYS.length) {
    console.warn(
      `В en.json найдено ${Object.keys(sourceQuestions).length} ключей, ожидалось ${QUESTION_KEYS.length}.`,
    );
  }

  const targetLanguages = Object.keys(languageMap).filter(
    l => l !== 'en' && l !== 'ru',
  );
  console.log(
    `Перевод примеров вопросов на ${targetLanguages.length} языков (источник: en.json, ru не перезаписывается)\n`,
  );

  for (const lang of targetLanguages) {
    try {
      await translateQuestionsForLanguage(
        lang,
        sourceQuestions,
        languagesDir,
      );
      await delay(400);
    } catch (e) {
      console.error(`Ошибка для ${lang}:`, e);
    }
  }

  console.log('\n✓ Готово.');
}

main().catch(console.error);
