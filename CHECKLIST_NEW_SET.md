# Чек-лист: встроенные наборы (школьная программа)

В приложении **ровно шесть** встроенных `setId` и **две** группы в настройках игры. Добавление седьмого набора — редкое изменение; ниже — полный конвейер по образцу существующих шести.

**Имена:** `setId` (например `worldHistoryNames`) и `itemType` элемента (`worldHistoryName`). Соответствие задано в `src/utils/storage.ts` (`BUILTIN_SET_ID_TO_ITEM_TYPE`, `BUILTIN_SET_TYPE_IDS`).

**Матрица UI (2×3):**

| Группа аккордеона (`BuiltinGroupId`) | setId | itemType |
|--------------------------------------|-------|----------|
| `worldHistory` | `worldHistoryDefinitions` | `worldHistoryDefinition` |
| `worldHistory` | `worldHistoryNames` | `worldHistoryName` |
| `worldHistory` | `worldHistoryEvents` | `worldHistoryEvent` |
| `belarusHistory` | `belarusHistoryDefinitions` | `belarusHistoryDefinition` |
| `belarusHistory` | `belarusHistoryNames` | `belarusHistoryName` |
| `belarusHistory` | `belarusHistoryEvents` | `belarusHistoryEvent` |

**Firestore / моки:** языки **ru, en, be** (три файла моков на набор: `{setId}.ts`, `{setId}-en.ts`, `{setId}-be.ts`).

---

## 1. Моки (`src/mocks/`)

- [ ] `src/mocks/{setId}.ts` — массив строк на русском (**≥ 10** элементов).
- [ ] `src/mocks/{setId}-en.ts` и `src/mocks/{setId}-be.ts` — те же карточки на en/be.
- [ ] Экспорт в `src/mocks/index.ts` (и при необходимости в общий объект `languages`).

---

## 2. `src/utils/storage.ts`

- [ ] Добавить `itemType` в union `SetItem['type']`.
- [ ] Добавить `setId` в `BUILTIN_SET_TYPE_IDS` и запись в `BUILTIN_SET_ID_TO_ITEM_TYPE`.
- [ ] Добавить `removed{SetIdPascal}Names?: string[]` в `SetsData`.
- [ ] При необходимости — `LEGACY_BUILTIN_SET_IDS` и нормализация в `normalizeBuiltinSetType` / `loadGameSettings`.

---

## 3. `src/utils/localization.ts`

- [ ] Импорты моков ru/en/be, кеш, объект моков по языкам.
- [ ] `preload{SetIdPascal}FromFirestore`, экспорт `get{SetIdPascal}`.
- [ ] Подключить preload в `preloadDataFromFirestore`, сброс кеша в `clearFirestoreCache`.
- [ ] `getInitialSetsForLanguage`, `getLocalizedName`, `getRussianName` — ветки для нового `itemType`.

---

## 4. `src/utils/firestore.ts`

- [ ] Константа коллекции `{setId}`.
- [ ] `get{SetIdPascal}FromFirestore` / `save{SetIdPascal}ToFirestore`.
- [ ] В `uploadMocksToFirestore` — сохранение ru, en, be для нового набора.

---

## 5. `src/utils/sets.ts`

- [ ] `getInitialSets`, `getActualSets`, `loadSetsData`, `getSetByName`, `getAvailableSets` (порядок: шесть базовых, затем кастомные), `saveCustomSetToStorage`.

---

## 6. `src/utils/analytics.ts`

- [ ] Встроенные типы берутся из `BUILTIN_SET_TYPE_IDS` / `isBuiltinSet`; кастомные наборы не логируются как встроенные.

---

## 7. `src/forms/GameSettingsForm.tsx`

- [ ] `baseSetIds`, `builtinSetGroups`, `iconMap`, тип `BuiltinGroupId`, дефолт `openBuiltinGroup`.

---

## 8. `src/hooks/useEditSets.ts`

- [ ] Инициализация, сохранение, сброс, `getModifiedSets` для нового ключа `removed{SetIdPascal}Names`.

---

## 9. `src/hooks/useActiveGame.ts`

- [ ] Ветка или запись в карте геттеров: `setType === '{setId}'` → `get{SetIdPascal}(lang)`.

---

## 10. `src/screens/CreateCustomSetScreen.tsx` и `src/components/sets/CustomSetModal.tsx`

- [ ] `FILTER_OPTIONS`, `ITEM_TYPES`, `useMemo` со списком элементов, типы фильтра.

---

## 11. `src/components/sets/AnimatedSetCard.tsx`

- [ ] Типы элементов согласованы с `SetItem` из `storage.ts`.

---

## 12. `src/components/game/PlayerCardsScreen.tsx`

- [ ] `getLocalizedName` / маппинг `setId` → `itemType` (через `BUILTIN_SET_ID_TO_ITEM_TYPE` или явные ветки).

---

## 13. `src/components/results/CharacterCard.tsx`

- [ ] `SET_TYPE_TO_ITEM_TYPE` / общий маппинг из storage.

---

## 14. Локализация `src/localization/languages/ru.json`, `be.json`, `en.json`

- [ ] `labels.{setId}` для названия набора в списках.
- [ ] При новой группе — `labels.group…` и правка `builtinSetGroups` в форме.

---

## 15. `src/store/slices/gameSettings.ts` / экраны настроек

- [ ] `setType: string`; дефолт после миграции (например `worldHistoryNames`) в `GameSettingsScreen` / `loadGameSettings`.

---

## Порядок в `getAvailableSets`

Сначала шесть id в согласованном порядке (как в `sets.ts` и `baseSetIds` в форме), затем пользовательские наборы.

---

## Файлы, которые обычно не трогают

- `EditSetItemsModal.tsx`, `AnimatedListItem.tsx`, `keyExtractor.ts` — опираются на общие типы `SetItem`.

---

## Загрузка моков в Firestore (разработка)

Использовать существующую функцию `uploadMocksToFirestore` в `firestore.ts` после добавления коллекции и вызовов сохранения.
