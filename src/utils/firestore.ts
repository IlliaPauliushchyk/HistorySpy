import { ILanguage } from '@/hooks/localization';
import firestore from '@react-native-firebase/firestore';

const WORLD_HISTORY_DEFINITIONS_COLLECTION = 'worldHistoryDefinitions';
const WORLD_HISTORY_NAMES_COLLECTION = 'worldHistoryNames';
const WORLD_HISTORY_EVENTS_COLLECTION = 'worldHistoryEvents';
const BELARUS_HISTORY_DEFINITIONS_COLLECTION = 'belarusHistoryDefinitions';
const BELARUS_HISTORY_NAMES_COLLECTION = 'belarusHistoryNames';
const BELARUS_HISTORY_EVENTS_COLLECTION = 'belarusHistoryEvents';

async function loadNamesCollection(
  collection: string,
  language: ILanguage,
  label: string,
): Promise<string[] | null> {
  try {
    const doc = await firestore()
      .collection(collection)
      .doc(language)
      .get();

    if (doc.exists()) {
      const data = doc.data();
      return data?.names || null;
    }
    return null;
  } catch (error) {
    console.error(`Error loading ${label} from Firestore:`, error);
    return null;
  }
}

async function saveNamesCollection(
  collection: string,
  language: ILanguage,
  names: string[],
  label: string,
): Promise<void> {
  try {
    await firestore().collection(collection).doc(language).set({ names });
    console.log(`${label} saved to Firestore for language: ${language}`);
  } catch (error) {
    console.error(`Error saving ${label} to Firestore:`, error);
    throw error;
  }
}

export const getWorldHistoryDefinitionsFromFirestore = (
  language: ILanguage,
) =>
  loadNamesCollection(
    WORLD_HISTORY_DEFINITIONS_COLLECTION,
    language,
    'worldHistoryDefinitions',
  );

export const saveWorldHistoryDefinitionsToFirestore = async (
  language: ILanguage,
  names: string[],
): Promise<void> => {
  await saveNamesCollection(
    WORLD_HISTORY_DEFINITIONS_COLLECTION,
    language,
    names,
    'worldHistoryDefinitions',
  );
};

export const getWorldHistoryNamesFromFirestore = (language: ILanguage) =>
  loadNamesCollection(WORLD_HISTORY_NAMES_COLLECTION, language, 'worldHistoryNames');

export const saveWorldHistoryNamesToFirestore = async (
  language: ILanguage,
  names: string[],
): Promise<void> => {
  await saveNamesCollection(
    WORLD_HISTORY_NAMES_COLLECTION,
    language,
    names,
    'worldHistoryNames',
  );
};

export const getWorldHistoryEventsFromFirestore = (language: ILanguage) =>
  loadNamesCollection(WORLD_HISTORY_EVENTS_COLLECTION, language, 'worldHistoryEvents');

export const saveWorldHistoryEventsToFirestore = async (
  language: ILanguage,
  names: string[],
): Promise<void> => {
  await saveNamesCollection(
    WORLD_HISTORY_EVENTS_COLLECTION,
    language,
    names,
    'worldHistoryEvents',
  );
};

export const getBelarusHistoryDefinitionsFromFirestore = (
  language: ILanguage,
) =>
  loadNamesCollection(
    BELARUS_HISTORY_DEFINITIONS_COLLECTION,
    language,
    'belarusHistoryDefinitions',
  );

export const saveBelarusHistoryDefinitionsToFirestore = async (
  language: ILanguage,
  names: string[],
): Promise<void> => {
  await saveNamesCollection(
    BELARUS_HISTORY_DEFINITIONS_COLLECTION,
    language,
    names,
    'belarusHistoryDefinitions',
  );
};

export const getBelarusHistoryNamesFromFirestore = (language: ILanguage) =>
  loadNamesCollection(
    BELARUS_HISTORY_NAMES_COLLECTION,
    language,
    'belarusHistoryNames',
  );

export const saveBelarusHistoryNamesToFirestore = async (
  language: ILanguage,
  names: string[],
): Promise<void> => {
  await saveNamesCollection(
    BELARUS_HISTORY_NAMES_COLLECTION,
    language,
    names,
    'belarusHistoryNames',
  );
};

export const getBelarusHistoryEventsFromFirestore = (language: ILanguage) =>
  loadNamesCollection(
    BELARUS_HISTORY_EVENTS_COLLECTION,
    language,
    'belarusHistoryEvents',
  );

export const saveBelarusHistoryEventsToFirestore = async (
  language: ILanguage,
  names: string[],
): Promise<void> => {
  await saveNamesCollection(
    BELARUS_HISTORY_EVENTS_COLLECTION,
    language,
    names,
    'belarusHistoryEvents',
  );
};

/**
 * Загрузить все данные из локальных моков в Firestore (ru, en, be).
 */
export const uploadMocksToFirestore = async (): Promise<void> => {
  try {
    const { worldHistoryDefinitions: worldHistoryDefinitionsRu } = await import(
      '@/mocks/worldHistoryDefinitions',
    );
    const { worldHistoryDefinitions: worldHistoryDefinitionsEn } = await import(
      '@/mocks/worldHistoryDefinitions-en',
    );
    const { worldHistoryDefinitions: worldHistoryDefinitionsBe } = await import(
      '@/mocks/worldHistoryDefinitions-be',
    );
    const { worldHistoryNames: worldHistoryNamesRu } = await import(
      '@/mocks/worldHistoryNames',
    );
    const { worldHistoryNames: worldHistoryNamesEn } = await import(
      '@/mocks/worldHistoryNames-en',
    );
    const { worldHistoryNames: worldHistoryNamesBe } = await import(
      '@/mocks/worldHistoryNames-be',
    );
    const { worldHistoryEvents: worldHistoryEventsRu } = await import(
      '@/mocks/worldHistoryEvents',
    );
    const { worldHistoryEvents: worldHistoryEventsEn } = await import(
      '@/mocks/worldHistoryEvents-en',
    );
    const { worldHistoryEvents: worldHistoryEventsBe } = await import(
      '@/mocks/worldHistoryEvents-be',
    );
    const { belarusHistoryDefinitions: belarusHistoryDefinitionsRu } =
      await import('@/mocks/belarusHistoryDefinitions');
    const { belarusHistoryDefinitions: belarusHistoryDefinitionsEn } =
      await import('@/mocks/belarusHistoryDefinitions-en');
    const { belarusHistoryDefinitions: belarusHistoryDefinitionsBe } =
      await import('@/mocks/belarusHistoryDefinitions-be');
    const { belarusHistoryNames: belarusHistoryNamesRu } = await import(
      '@/mocks/belarusHistoryNames',
    );
    const { belarusHistoryNames: belarusHistoryNamesEn } = await import(
      '@/mocks/belarusHistoryNames-en',
    );
    const { belarusHistoryNames: belarusHistoryNamesBe } = await import(
      '@/mocks/belarusHistoryNames-be',
    );
    const { belarusHistoryEvents: belarusHistoryEventsRu } = await import(
      '@/mocks/belarusHistoryEvents',
    );
    const { belarusHistoryEvents: belarusHistoryEventsEn } = await import(
      '@/mocks/belarusHistoryEvents-en',
    );
    const { belarusHistoryEvents: belarusHistoryEventsBe } = await import(
      '@/mocks/belarusHistoryEvents-be',
    );

    await Promise.all([
      saveWorldHistoryDefinitionsToFirestore('ru', worldHistoryDefinitionsRu),
      saveWorldHistoryNamesToFirestore('ru', worldHistoryNamesRu),
      saveWorldHistoryEventsToFirestore('ru', worldHistoryEventsRu),
      saveBelarusHistoryDefinitionsToFirestore('ru', belarusHistoryDefinitionsRu),
      saveBelarusHistoryNamesToFirestore('ru', belarusHistoryNamesRu),
      saveBelarusHistoryEventsToFirestore('ru', belarusHistoryEventsRu),
    ]);

    await Promise.all([
      saveWorldHistoryDefinitionsToFirestore('en', worldHistoryDefinitionsEn),
      saveWorldHistoryNamesToFirestore('en', worldHistoryNamesEn),
      saveWorldHistoryEventsToFirestore('en', worldHistoryEventsEn),
      saveBelarusHistoryDefinitionsToFirestore('en', belarusHistoryDefinitionsEn),
      saveBelarusHistoryNamesToFirestore('en', belarusHistoryNamesEn),
      saveBelarusHistoryEventsToFirestore('en', belarusHistoryEventsEn),
    ]);

    await Promise.all([
      saveWorldHistoryDefinitionsToFirestore('be', worldHistoryDefinitionsBe),
      saveWorldHistoryNamesToFirestore('be', worldHistoryNamesBe),
      saveWorldHistoryEventsToFirestore('be', worldHistoryEventsBe),
      saveBelarusHistoryDefinitionsToFirestore('be', belarusHistoryDefinitionsBe),
      saveBelarusHistoryNamesToFirestore('be', belarusHistoryNamesBe),
      saveBelarusHistoryEventsToFirestore('be', belarusHistoryEventsBe),
    ]);

    console.log('All curriculum mocks uploaded to Firestore successfully!');
  } catch (error) {
    console.error('Error uploading mocks to Firestore:', error);
    throw error;
  }
};
