import { BuiltinSetTypeId } from '@/constants/builtinCurriculum';
import { ILanguage } from '@/hooks/localization';

async function loadNamesCollection(
  collection: string,
  language: ILanguage,
  label: string,
): Promise<string[] | null> {
  try {
    const firestore = (await import('@react-native-firebase/firestore')).default;
    const doc = await firestore().collection(collection).doc(language).get();

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
    const firestore = (await import('@react-native-firebase/firestore')).default;
    await firestore().collection(collection).doc(language).set({ names });
    console.log(`${label} saved to Firestore for language: ${language}`);
  } catch (error) {
    console.error(`Error saving ${label} to Firestore:`, error);
    throw error;
  }
}

export const getBuiltinSetFromFirestore = (
  setId: BuiltinSetTypeId,
  language: ILanguage,
) => loadNamesCollection(setId, language, setId);

export const saveBuiltinSetToFirestore = async (
  setId: BuiltinSetTypeId,
  language: ILanguage,
  names: string[],
): Promise<void> => {
  await saveNamesCollection(setId, language, names, setId);
};

/**
 * Загрузить все данные из локальных моков в Firestore (ru, en, be).
 */
export const uploadMocksToFirestore = async (): Promise<void> => {
  try {
    const { BUILTIN_SET_TYPE_IDS } = await import('@/constants/builtinCurriculum');
    const { BUILTIN_MOCKS } = await import('./builtinMocks');
    const languages: ILanguage[] = ['ru', 'en', 'be'];

    for (const lang of languages) {
      await Promise.all(
        BUILTIN_SET_TYPE_IDS.map(setId =>
          saveBuiltinSetToFirestore(setId, lang, BUILTIN_MOCKS[setId][lang]),
        ),
      );
    }

    console.log('All curriculum mocks uploaded to Firestore successfully!');
  } catch (error) {
    console.error('Error uploading mocks to Firestore:', error);
    throw error;
  }
};
