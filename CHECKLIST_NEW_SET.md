# Agent playbook: встроенная программа (классы 5 и 9)

Документ для **агента/разработчика**: как добавить новый класс или набор, сверяясь с уже работающими **5** и **9** классами. Проверено по репозиторию на момент последнего обновления чек-листа.

---

## 1. Базовая модель (как сейчас в коде)

| Параметр | Значение |
|----------|----------|
| Предметы | `worldHistory`, `belarusHistory` (`CURRICULUM_SUBJECTS`) |
| Классы | `5`, `9` (`CURRICULUM_GRADES`) |
| Типы набора | `Definitions`, `Names`, `Events` (`kindOrder`) |
| **Число `setId`** | `2 × 2 × 3 = **12**` |
| Карточек в одном `setId` | **12** (ru / en / be) |
| Файлов моков | **36** (`12 × 3` языка) |
| Уникальных русских имён (все наборы) | **143** (дубликат: `Распад СССР (1991 г.)` в world 9 и belarus 9 events) |

**Единый источник id и UI:** `src/constants/builtinCurriculum.ts`.

### Именование (обязательно соблюдать)

| Сущность | Шаблон | Пример (5 кл., всемирная, термины) |
|----------|--------|-------------------------------------|
| `setId` | `{subject}{grade}{Kind}` (`grade` — одна или несколько цифр) | `worldHistory5Definitions`, `worldHistory10Definitions` |
| `itemType` | `{subject}{grade}{kind}` ед. число | `worldHistory5Definition`, `worldHistory10Definition` |
| `Kind` / kind | `Definitions`→`Definition`, `Names`→`Name`, `Events`→`Event` | |
| Ключ в AsyncStorage | `setIdToRemovedKey(setId)` | `removedWorldHistory5DefinitionsNames` |
| Файл мока | `src/mocks/{setId}.ts` (+ `-en`, `-be`) | |
| i18n набора | `labels.{setId}` | `labels.worldHistory5Definitions` |
| i18n класса | `labels.grade5` / `labels.grade9` | |

`setsForGrade(subject, grade)` в `builtinCurriculum.ts` строит три `setId` для предмета автоматически.

### Эталон: все 12 `setId` (5 и 9 класс)

```
worldHistory5Definitions   worldHistory5Names   worldHistory5Events
worldHistory9Definitions   worldHistory9Names   worldHistory9Events
belarusHistory5Definitions belarusHistory5Names belarusHistory5Events
belarusHistory9Definitions belarusHistory9Names belarusHistory9Events
```

### Матрица UI (настройки игры)

`BUILTIN_SUBJECT_GROUPS` → аккордеон предмета → `BuiltinGradeSection` (класс) → 3 кнопки набора (`GameSettingsForm.tsx`).

### Фильтр «свой набор»

Не по 12 типам, а по **классу**: `all` | `5` | `9` — `CUSTOM_SET_GRADE_FILTER_OPTIONS`, сбор карточек: `collectBuiltinItemsForCustomSetFilter()` (`src/utils/customSetGradeFilter.ts`), данные класса: `getSetIdsForGrade(grade)`.

---

## 2. Инварианты (прогонять после любых правок программы)

```bash
# 1) Совпадение списков id (TS ↔ скрипт моков)
node --input-type=module -e "
import { BUILTIN_SET_TYPE_IDS } from './src/constants/builtinCurriculum.ts';
import { SET_IDS } from './scripts/generateGradeCurriculumMocks.mjs';
const a = [...BUILTIN_SET_TYPE_IDS].sort().join(',');
const b = [...SET_IDS].sort().join(',');
if (a !== b) { console.error('ID MISMATCH'); process.exit(1); }
console.log('OK: BUILTIN_SET_TYPE_IDS === SET_IDS (' + SET_IDS.length + ')');
"

# 2) Генерация моков и подсказок
node scripts/generateGradeCurriculumMocks.mjs
node scripts/generateCurriculumHints.mjs

# 3) TypeScript
npx tsc --noEmit
```

```bash
# 4) Подсказки: каждое русское имя из CURRICULUM_SETS есть в curriculumHintsContent
node --input-type=module -e "
import { CURRICULUM_SETS } from './scripts/generateGradeCurriculumMocks.mjs';
import { CURRICULUM_HINTS } from './scripts/curriculumHintsContent.mjs';
const ru = new Set();
for (const id of Object.keys(CURRICULUM_SETS))
  for (const n of CURRICULUM_SETS[id].ru) ru.add(n);
const missing = [...ru].filter(n => !CURRICULUM_HINTS.ru[n]);
if (missing.length) { console.error('Missing hints:', missing); process.exit(1); }
console.log('OK: hints for', ru.size, 'ru names');
"
```

**Ожидание для текущего репо:** 12 id, 143 ru-имени, 0 missing hints.

---

## 3. Карта файлов: что править руками vs что подхватывается само

### Обязательно вручную при **+1 класс** (например 7)

| # | Файл | Что сделать |
|---|------|-------------|
| 1 | `src/constants/builtinCurriculum.ts` | См. §4 — полный список полей |
| 2 | `src/utils/storage.ts` | +6 полей `removed…Names` в типе `SetsData` |
| 3 | `src/localization/languages/ru.json`, `en.json`, `be.json` | `labels.grade7` + 6× `labels.{setId}` |
| 4 | `scripts/generateGradeCurriculumMocks.mjs` | +6 ключей в `CURRICULUM_SETS` (порядок ключей = порядок в `BUILTIN_SET_TYPE_IDS`) |
| 5 | `scripts/curriculumHintsContent.mjs` | ru/en/be для всех новых русских имён |
| 6 | `src/utils/builtinMocks.ts` | +36 импортов и 6 записей `BUILTIN_MOCKS` |
| 7 | `src/mocks/index.ts` | +6 `export` |

Затем: §2 (генераторы + tsc).

### Обычно **не трогать** (итерация по `BUILTIN_SET_TYPE_IDS` / `BUILTIN_SUBJECT_GROUPS`)

- `src/utils/curriculumLocalization.ts` — кеш, preload, `getInitialSetsForLanguage`, `getLocalizedName`, `getRussianName`, `getLocalizedHint`
- `src/utils/sets.ts`, `src/hooks/useEditSets.ts` — списки наборов, `removed*`, сохранение
- `src/utils/firestore.ts` — `getBuiltinSetFromFirestore`, `uploadMocksToFirestore`
- `src/utils/analytics.ts` — `BUILTIN_SET_TYPES` из storage re-export
- `src/forms/GameSettingsForm.tsx`, `src/forms/components/BuiltinGradeSection.tsx`
- `src/screens/CreateCustomSetScreen.tsx`, `src/components/sets/CustomSetModal.tsx`
- `src/hooks/useActiveGame.ts`, `src/components/game/PlayerCardsScreen.tsx`, `TeacherSecretRevealScreen`, `CharacterCard`
- `src/utils/customSetGradeFilter.ts`
- `src/utils/storage.ts` — `createEmptySetsData` / `emptyRemovedKeys` (ключи из `BUILTIN_SET_TYPE_IDS`)

### Контент (редактирование без нового класса)

| Задача | Где |
|--------|-----|
| Тексты карточек | `CURRICULUM_SETS` → `node scripts/generateGradeCurriculumMocks.mjs` |
| Подсказки на карточке | `scripts/curriculumHintsContent.mjs` → `node scripts/generateCurriculumHints.mjs` |
| Ключ подсказки | всегда **русское** имя карточки (`getLocalizedHint` / `hasBuiltinHint`) |

---

## 4. Добавление нового класса (шаблон: **7 класс**)

Один класс = **+6 `setId`** (2 предмета × 3 типа).

| Предмет | Definitions | Names | Events |
|---------|-------------|-------|--------|
| worldHistory | `worldHistory7Definitions` | `worldHistory7Names` | `worldHistory7Events` |
| belarusHistory | `belarusHistory7Definitions` | `belarusHistory7Names` | `belarusHistory7Events` |

`itemType`: `worldHistory7Definition`, `worldHistory7Name`, `worldHistory7Event`, …

### 4.1 `src/constants/builtinCurriculum.ts`

- [ ] `CURRICULUM_GRADES` — добавить `7` (порядок = порядок в фильтре «свой набор» и в UI классов).
- [ ] Union **`CurriculumItemType`** — +6 типов (иначе `SetItem` не скомпилируется).
- [ ] **`BUILTIN_SET_TYPE_IDS`** — +6 id (вставить блоком в том же порядке, что в `CURRICULUM_SETS`: обычно все world для класса, потом все belarus).
- [ ] **`BUILTIN_SET_ID_TO_ITEM_TYPE`** — +6 пар.
- [ ] **`BUILTIN_SET_ICON_MAP`** — +6 иконок (скопировать с 5 или 9 того же предмета).
- [ ] **`labels.grade7`** в i18n (см. §4.3) — тип `GradeLabelKey` и `BUILTIN_SUBJECT_GROUPS` подтянутся из `CURRICULUM_GRADES` через `gradeLabelKey` / `gradesForSubject`; вручную править `BUILTIN_SUBJECT_GROUPS` не нужно.
- [ ] Порядок в `CURRICULUM_GRADES` = порядок классов в UI и в фильтре «свой набор» (например `5 → 7 → 9`).

После этого обновятся: `CUSTOM_SET_GRADE_FILTER_OPTIONS`, `getSetIdsForGrade`, `parseCustomSetGradeFilter`, `BUILTIN_SUBJECT_GROUPS`.

### 4.2 `src/utils/storage.ts`

- [ ] В **`SetsData`** — 6 полей: `removedWorldHistory7DefinitionsNames`, …, `removedBelarusHistory7EventsNames` (имена через `setIdToRemovedKey(setId)`).

### 4.3 Локализация

- [ ] `labels.grade7` в `ru.json`, `en.json`, `be.json`.
- [ ] `labels.worldHistory7Definitions` … `labels.belarusHistory7Events` (6 ключей; подписи как у соседних классов: термины / имена / события).

### 4.4 Скрипты и генерация

- [ ] `scripts/generateGradeCurriculumMocks.mjs` — 6 объектов в **`CURRICULUM_SETS`** (ru/en/be по 12 строк); **`SET_IDS`** = `Object.keys(CURRICULUM_SETS)` — отдельный массив не дублировать.
- [ ] `node scripts/generateGradeCurriculumMocks.mjs` → 18 новых файлов в `src/mocks/`.
- [ ] `scripts/curriculumHintsContent.mjs` — подсказки для всех новых ru-имён (+ en/be переводы).
- [ ] `node scripts/generateCurriculumHints.mjs`.

### 4.5 Регистрация в приложении

- [ ] `src/utils/builtinMocks.ts` — импорты + `BUILTIN_MOCKS`.
- [ ] `src/mocks/index.ts` — exports.

### 4.6 Проверка

- [ ] Прогон **§2** (инварианты).
- [ ] UI: настройки игры — под обоими предметами виден **7 класс** и 3 набора.
- [ ] UI: создание своего набора — фильтр **7 класс**, слова из всех 6 наборов, без дублей по русскому имени.
- [ ] Игра: выбор любого нового `setId`, подсказка на карточке (если есть в hints).

### 4.7 Ограничения и миграция

- [ ] **`LEGACY_SET_ID_MIGRATION`** — только при **переименовании** старых id, не при добавлении класса.
- [ ] Парсинг класса: `parseCurriculumItemType` / `parseCurriculumSetId` — `(\d+)` в id/itemType (классы **10**, **11** и т.д. без смены regex). `getGradeFromItemType` / `getGradeFromSetId` возвращают класс только если он есть в `CURRICULUM_GRADES`.
- [ ] **`DEFAULT_BUILTIN_SET_TYPE`**: первый набор в UI (`BUILTIN_SUBJECT_GROUPS[0].grades[0].setIds[0]`) — менять только если нужен другой дефолт.

---

## 5. Справка: что уже сделано для 5 и 9 (контрольный список)

Использовать как эталон полноты, не как задачу к выполнению.

### Константы и типы

- [x] `CURRICULUM_GRADES = [5, 9]`
- [x] 12× `BUILTIN_SET_TYPE_IDS`, `BUILTIN_SET_ID_TO_ITEM_TYPE`, `CurriculumItemType`
- [x] `BUILTIN_SUBJECT_GROUPS` (2 предмета × 2 класса × 3 набора)
- [x] `gradeLabelKey`, `gradeFilterIcon`, `parseCurriculumItemType`, `parseCurriculumSetId`, `CUSTOM_SET_GRADE_FILTER_OPTIONS`
- [x] `LEGACY_SET_ID_MIGRATION` (старые 6 id → 5 класс)
- [x] `getSetIdsForGrade`, `parseCustomSetGradeFilter`, `DEFAULT_BUILTIN_SET_TYPE`

### Хранилище и наборы

- [x] `SetsData`: 12× `removed…Names`, `getRemovedNames` / `setRemovedNames`
- [x] `normalizeBuiltinSetType` в `loadGameSettings`

### Контент

- [x] `CURRICULUM_SETS` + 36 mock-файлов
- [x] `curriculumHintsContent.mjs` → `curriculumHints{,-en,-be}.ts`
- [x] `builtinMocks.ts`, `mocks/index.ts`

### Локализация

- [x] `labels.grade5`, `labels.grade9`, `labels.groupWorldHistory`, `labels.groupBelarusHistory`
- [x] `labels.{setId}` для всех 12 id

### UI и игровой цикл

- [x] `GameSettingsForm` + `BuiltinGradeSection`
- [x] `CreateCustomSetScreen` / `CustomSetModal` — фильтр по классу
- [x] `PlayerCardsScreen` — `hint`, `AdaptiveCardText` / `AdaptiveHintText`
- [x] `useActiveGame`, `EditSetsScreen` → `useEditSets`

---

## 6. Порядок `setId` в списках

Везде как в **`BUILTIN_SET_TYPE_IDS`** (`builtinCurriculum.ts`), затем пользовательские наборы:

`getAvailableSets`, `getInitialSets`, `useEditSets`, порядок ключей в `CURRICULUM_SETS` для `SET_IDS`.

---

## 7. Firestore (опционально)

После обновления моков: `uploadMocksToFirestore()` в `src/utils/firestore.ts` — коллекция = `setId`, документ = язык, поле `names[]`.
