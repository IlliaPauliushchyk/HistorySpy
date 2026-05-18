/**
 * Скрипт для загрузки данных футболистов и тренеров в Firestore
 * Запуск: npx ts-node scripts/uploadToFirestore.ts
 * 
 * Требования:
 * - Firebase должен быть настроен
 * - Должны быть установлены все зависимости
 */

import { uploadMocksToFirestore } from '../src/utils/firestore';

const run = async () => {
  try {
    console.log('Starting upload to Firestore...');
    await uploadMocksToFirestore();
    console.log('✅ Successfully uploaded all data to Firestore!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading to Firestore:', error);
    process.exit(1);
  }
};

run();
