/**
 * Скрипт для загрузки данных футболистов и тренеров в Firestore
 * 
 * Запуск из корня проекта:
 * node scripts/uploadToFirestore.js
 * 
 * Или из React Native приложения можно вызвать функцию uploadMocksToFirestore()
 * из @/utils/firestore
 */

// Для запуска из Node.js окружения нужно использовать другой подход
// Этот скрипт предназначен для запуска из React Native приложения
// Для загрузки данных используйте функцию uploadMocksToFirestore() из приложения

console.log(`
Для загрузки данных в Firestore:

1. Запустите приложение (react-native run-ios или react-native run-android)
2. В консоли разработчика выполните:
   import { uploadMocksToFirestore } from '@/utils/firestore';
   await uploadMocksToFirestore();

Или создайте временный экран/кнопку в приложении для загрузки данных.
`);
