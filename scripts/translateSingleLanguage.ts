import { translateSingleLanguage } from './translateMocks';

// Основная функция для перевода одного языка
async function main() {
  const targetLang = process.argv[2];
  
  if (!targetLang) {
    console.error('Использование: npx ts-node scripts/translateSingleLanguage.ts <код_языка>');
    console.error('Пример: npx ts-node scripts/translateSingleLanguage.ts kk');
    process.exit(1);
  }
  
  try {
    await translateSingleLanguage(targetLang);
  } catch (error) {
    console.error(`Ошибка при переводе на ${targetLang}:`, error);
    process.exit(1);
  }
}

// Запускаем скрипт
main().catch(console.error);
