import { ILanguage } from '@/hooks/localization';
import { BuiltinSetTypeId } from '@/constants/builtinCurriculum';

import { worldHistory5Definitions as worldHistory5DefinitionsRu } from '@/mocks/worldHistory5Definitions';
import { worldHistory5Definitions as worldHistory5DefinitionsEn } from '@/mocks/worldHistory5Definitions-en';
import { worldHistory5Definitions as worldHistory5DefinitionsBe } from '@/mocks/worldHistory5Definitions-be';
import { worldHistory5Names as worldHistory5NamesRu } from '@/mocks/worldHistory5Names';
import { worldHistory5Names as worldHistory5NamesEn } from '@/mocks/worldHistory5Names-en';
import { worldHistory5Names as worldHistory5NamesBe } from '@/mocks/worldHistory5Names-be';
import { worldHistory5Events as worldHistory5EventsRu } from '@/mocks/worldHistory5Events';
import { worldHistory5Events as worldHistory5EventsEn } from '@/mocks/worldHistory5Events-en';
import { worldHistory5Events as worldHistory5EventsBe } from '@/mocks/worldHistory5Events-be';
import { worldHistory9Definitions as worldHistory9DefinitionsRu } from '@/mocks/worldHistory9Definitions';
import { worldHistory9Definitions as worldHistory9DefinitionsEn } from '@/mocks/worldHistory9Definitions-en';
import { worldHistory9Definitions as worldHistory9DefinitionsBe } from '@/mocks/worldHistory9Definitions-be';
import { worldHistory9Names as worldHistory9NamesRu } from '@/mocks/worldHistory9Names';
import { worldHistory9Names as worldHistory9NamesEn } from '@/mocks/worldHistory9Names-en';
import { worldHistory9Names as worldHistory9NamesBe } from '@/mocks/worldHistory9Names-be';
import { worldHistory9Events as worldHistory9EventsRu } from '@/mocks/worldHistory9Events';
import { worldHistory9Events as worldHistory9EventsEn } from '@/mocks/worldHistory9Events-en';
import { worldHistory9Events as worldHistory9EventsBe } from '@/mocks/worldHistory9Events-be';
import { belarusHistory5Definitions as belarusHistory5DefinitionsRu } from '@/mocks/belarusHistory5Definitions';
import { belarusHistory5Definitions as belarusHistory5DefinitionsEn } from '@/mocks/belarusHistory5Definitions-en';
import { belarusHistory5Definitions as belarusHistory5DefinitionsBe } from '@/mocks/belarusHistory5Definitions-be';
import { belarusHistory5Names as belarusHistory5NamesRu } from '@/mocks/belarusHistory5Names';
import { belarusHistory5Names as belarusHistory5NamesEn } from '@/mocks/belarusHistory5Names-en';
import { belarusHistory5Names as belarusHistory5NamesBe } from '@/mocks/belarusHistory5Names-be';
import { belarusHistory5Events as belarusHistory5EventsRu } from '@/mocks/belarusHistory5Events';
import { belarusHistory5Events as belarusHistory5EventsEn } from '@/mocks/belarusHistory5Events-en';
import { belarusHistory5Events as belarusHistory5EventsBe } from '@/mocks/belarusHistory5Events-be';
import { belarusHistory9Definitions as belarusHistory9DefinitionsRu } from '@/mocks/belarusHistory9Definitions';
import { belarusHistory9Definitions as belarusHistory9DefinitionsEn } from '@/mocks/belarusHistory9Definitions-en';
import { belarusHistory9Definitions as belarusHistory9DefinitionsBe } from '@/mocks/belarusHistory9Definitions-be';
import { belarusHistory9Names as belarusHistory9NamesRu } from '@/mocks/belarusHistory9Names';
import { belarusHistory9Names as belarusHistory9NamesEn } from '@/mocks/belarusHistory9Names-en';
import { belarusHistory9Names as belarusHistory9NamesBe } from '@/mocks/belarusHistory9Names-be';
import { belarusHistory9Events as belarusHistory9EventsRu } from '@/mocks/belarusHistory9Events';
import { belarusHistory9Events as belarusHistory9EventsEn } from '@/mocks/belarusHistory9Events-en';
import { belarusHistory9Events as belarusHistory9EventsBe } from '@/mocks/belarusHistory9Events-be';

export const BUILTIN_MOCKS: Record<BuiltinSetTypeId, Record<ILanguage, string[]>> = {
  worldHistory5Definitions: { ru: worldHistory5DefinitionsRu, en: worldHistory5DefinitionsEn, be: worldHistory5DefinitionsBe },
  worldHistory5Names: { ru: worldHistory5NamesRu, en: worldHistory5NamesEn, be: worldHistory5NamesBe },
  worldHistory5Events: { ru: worldHistory5EventsRu, en: worldHistory5EventsEn, be: worldHistory5EventsBe },
  worldHistory9Definitions: { ru: worldHistory9DefinitionsRu, en: worldHistory9DefinitionsEn, be: worldHistory9DefinitionsBe },
  worldHistory9Names: { ru: worldHistory9NamesRu, en: worldHistory9NamesEn, be: worldHistory9NamesBe },
  worldHistory9Events: { ru: worldHistory9EventsRu, en: worldHistory9EventsEn, be: worldHistory9EventsBe },
  belarusHistory5Definitions: { ru: belarusHistory5DefinitionsRu, en: belarusHistory5DefinitionsEn, be: belarusHistory5DefinitionsBe },
  belarusHistory5Names: { ru: belarusHistory5NamesRu, en: belarusHistory5NamesEn, be: belarusHistory5NamesBe },
  belarusHistory5Events: { ru: belarusHistory5EventsRu, en: belarusHistory5EventsEn, be: belarusHistory5EventsBe },
  belarusHistory9Definitions: { ru: belarusHistory9DefinitionsRu, en: belarusHistory9DefinitionsEn, be: belarusHistory9DefinitionsBe },
  belarusHistory9Names: { ru: belarusHistory9NamesRu, en: belarusHistory9NamesEn, be: belarusHistory9NamesBe },
  belarusHistory9Events: { ru: belarusHistory9EventsRu, en: belarusHistory9EventsEn, be: belarusHistory9EventsBe },
};
