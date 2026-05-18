/**
 * Источник данных для загрузки наборов
 * 'firestore' - загружать из Firestore (по умолчанию)
 * 'mocks' - использовать только локальные моки (без загрузки из Firestore)
 */
export const DATA_SOURCE: 'firestore' | 'mocks' = 'mocks';
