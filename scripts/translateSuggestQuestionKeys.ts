/**
 * Переводит labels.suggestQuestion и buttons.suggestQuestionButton
 * с русского на все поддерживаемые языки через Google Translate.
 * Использование: npx ts-node scripts/translateSuggestQuestionKeys.ts
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
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=${targetLang}&dt=t&q=${encodeURIComponent(
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

function getSourceStrings(ruPath: string): { suggestQuestionButton: string; suggestQuestion: string } {
  const content = fs.readFileSync(ruPath, 'utf-8');
  const data = JSON.parse(content) as {
    translation?: {
      buttons?: { suggestQuestionButton?: string };
      labels?: { suggestQuestion?: string };
    };
  };
  return {
    suggestQuestionButton:
      data?.translation?.buttons?.suggestQuestionButton ?? 'Предложить вопрос',
    suggestQuestion:
      data?.translation?.labels?.suggestQuestion ?? 'Подсказка: предложить вопрос',
  };
}

function mergeIntoLangFile(
  filePath: string,
  suggestQuestionButton: string,
  suggestQuestion: string,
): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content) as {
    translation?: {
      buttons?: Record<string, string>;
      labels?: Record<string, string>;
    };
  };
  if (!data.translation) data.translation = {};
  if (!data.translation.buttons) data.translation.buttons = {};
  if (!data.translation.labels) data.translation.labels = {};
  data.translation.buttons.suggestQuestionButton = suggestQuestionButton;
  data.translation.labels.suggestQuestion = suggestQuestion;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function main() {
  const projectRoot = process.cwd();
  const languagesDir = path.join(projectRoot, 'src/localization/languages');
  const ruPath = path.join(languagesDir, 'ru.json');

  if (!fs.existsSync(ruPath)) {
    throw new Error(`Не найден файл-источник: ${ruPath}`);
  }

  const source = getSourceStrings(ruPath);
  const targetLanguages = Object.keys(languageMap).filter(l => l !== 'ru');

  console.log(
    `Перевод suggestQuestionButton и suggestQuestion на ${targetLanguages.length} языков (источник: ru.json)\n`,
  );

  for (const lang of targetLanguages) {
    const targetPath = path.join(languagesDir, `${lang}.json`);
    if (!fs.existsSync(targetPath)) {
      console.warn(`  Пропуск ${lang}: файл не найден`);
      continue;
    }
    try {
      console.log(`  ${lang}...`);
      const [suggestQuestionButton, suggestQuestion] = await Promise.all([
        translateText(source.suggestQuestionButton, languageMap[lang]),
        translateText(source.suggestQuestion, languageMap[lang]),
      ]);
      mergeIntoLangFile(targetPath, suggestQuestionButton, suggestQuestion);
      await delay(300);
    } catch (e) {
      console.error(`Ошибка для ${lang}:`, e);
    }
  }

  console.log('\n✓ Готово.');
}

main().catch(console.error);
