# Добавление нового языка в SpyFootball

Пошаговая инструкция для разработчика: как добавить язык с кодом `xx` (например `sv` для шведского). Везде ниже замените `xx` на ваш код.

**Принципы:** один код языка везде (как в BCP 47 / ISO 639-1), русский контент в файлах без суффикса (`footballers.ts`), остальные языки — в файлах `*-xx.ts`.

---

## 0. Подготовка

1. Выберите **код языка** (например `sv`, `ro`, `el`). Он должен совпадать с тем, что возвращает `react-native-localize` для системной локали, если хотите автоопределение.
2. Решите, **RTL или LTR**. Сейчас RTL настроены для **арабского (`ar`)** и **урду (`ur`)**. Для нового RTL-языка нужно обновить те же места, что перечислены в разделе 6.

---

## 1. TypeScript: тип языка

**Файл:** `src/hooks/localization/useGetLanguage.ts`

- В union-тип `ILanguage` добавьте `| 'xx'`.

После этого TypeScript будет требовать ключ `xx` во всех объектах вида `{ [key in ILanguage]: ... }`.

---

## 2. Стартовый язык и RTL

**Файл:** `src/hooks/localization/useGetInitialLanguage.ts`

1. В функции `getLanguage` в большом условии `if (targetLanguage !== 'ru' && ...)` добавьте строку  
   `targetLanguage !== 'xx' &&`  
   (или добавьте `'xx'` в логику так, чтобы сохранённый/системный код `xx` не сбрасывался на `ru`).

2. **RTL:** переменная `shouldBeRTL` должна учитывать все RTL-языки одинаково. Сейчас в `getLanguage`:  
   `targetLanguage === 'ar' || targetLanguage === 'ur'`.

3. В функции **`selecteLanguage`** (переключение без перезапуска) условие RTL должно **совпадать** с `getLanguage` и с `LanguageScreen` (сейчас: `ar` и `ur`). При добавлении нового RTL-языка обновите все три места (см. раздел 6).

---

## 3. Список языков в UI

**Файл:** `src/mocks/languages.ts`

Добавьте элемент в массив `languages`:

```ts
{ title: 'languages.swedish', code: 'xx' },
```

Сортировка: в проекте список строится по **английским** названиям — вставьте строку в алфавитном порядке по смыслу ключа `languages.*` (как принято для английского UI-имени языка).

---

## 4. i18next: JSON переводов

### 4.1. Новый файл языка

**Путь:** `src/localization/languages/xx.json`

1. Скопируйте **`en.json`** (или `ru.json`) как основу.
2. Переведите все строки внутри `"translation": { ... }`.
3. В секции **`languages`** добавьте название **нового** языка на языке файла, например:  
   `"swedish": "Swedish"` в английском файле и аналог в `xx.json`.

Тексты правил и тем вопросов (`rules`, `questionTopic*` и т.п.) тоже лежат в этих JSON — отдельных `questionTopics-xx.ts` в `src/mocks` для них нет; при массовом переводе смотрите скрипты вроде `translateQuestionTopicsAll.ts` (и раздел 10).

### 4.2. Ключ для пункта в списке языков

В **каждом** существующем файле `src/localization/languages/*.json` в объекте `languages` добавьте пару для отображения нового языка в селекторе, например:

```json
"swedish": "Swedish"
```

в `en.json`, `"swedish": "Svenska"` в `sv.json`, в `ru.json` — по-русски и т.д. Ключ (`swedish`) должен совпадать с тем, что в `languages.ts` в `title: 'languages.swedish'`.

### 4.3. Регистрация в i18next

**Файл:** `src/localization/i18n.ts`

1. `import xx from './languages/xx.json';`
2. В объекте `resources: { ... }` добавьте `xx,` (ключ должен совпадать с кодом языка для `i18n.changeLanguage('xx')`).

---

## 5. Моки имён (игровые данные)

Для **каждого** типа набора с локализацией нужен файл с суффиксом `-xx.ts`. Список файлов с английской локалью (ориентир — копировать структуру из `*-en.ts`):

| База (RU) | Локализованная копия |
|-----------|------------------------|
| `footballers.ts` | `footballers-xx.ts` |
| `coaches.ts` | `coaches-xx.ts` |
| `legends.ts` | `legends-xx.ts` |
| `ballonDorWinners.ts` | `ballonDorWinners-xx.ts` |
| `forwards.ts` | `forwards-xx.ts` |
| `defenders.ts` | `defenders-xx.ts` |
| `midfielders.ts` | `midfielders-xx.ts` |
| `goalkeepers.ts` | `goalkeepers-xx.ts` |
| `captains.ts` | `captains-xx.ts` |
| `youngTalents.ts` | `youngTalents-xx.ts` |
| `worldCupWinners.ts` | `worldCupWinners-xx.ts` |
| `goldenBoot.ts` | `goldenBoot-xx.ts` |
| `russianLegends.ts` | `russianLegends-xx.ts` |
| `belarusianLegends.ts` | `belarusianLegends-xx.ts` |
| `ukrainianLegends.ts` | `ukrainianLegends-xx.ts` |
| `africanLegends.ts` | `africanLegends-xx.ts` |
| `europeanLegends.ts` | `europeanLegends-xx.ts` |
| `centralAsianLegends.ts` | `centralAsianLegends-xx.ts` |

**Как заполнять быстро:** скопируйте содержимое соответствующего `*-en.ts`, переименуйте экспорт при необходимости (обычно экспорт тот же: `export const footballers = [...]`).

**Папка:** всё в `src/mocks/`.

---

## 6. RTL (только для RTL-языков)

Если новый язык **справа налево** (например иврит `he`, фарси `fa`):

**Файлы и выражения `shouldBeRTL`:**

1. `src/hooks/localization/useGetInitialLanguage.ts` — в `getLanguage` и в **`selecteLanguage`** (должно совпадать).
2. `src/screens/LanguageScreen.tsx` — в `handleLanguageSelect`, переменная `shouldBeRTL` перед показом модалки перезапуска.

Логика перезапуска приложения при смене LTR ↔ RTL уже реализована в `LanguageScreen` (AsyncStorage → `applyRTLChange` → `reload`).

---

## 7. `localization.ts` — загрузка моков и кэш

**Файл:** `src/utils/localization.ts`

Очень большой файл. Для **каждого** набора данных:

1. Добавьте **import** вверху, например:  
   `import { footballers as footballersXx } from '@/mocks/footballers-xx';`
2. В объекте вида `footballersMocks`, `coachesMocks`, `legendsMocks`, … добавьте строку:  
   `xx: footballersXx,`  
   (аналогично для всех `*Mocks` объектов, где ключ языка — полный набор `ILanguage`).

Если пропустить хотя бы один `*Mocks`, TypeScript выдаст ошибку из-за `[key in ILanguage]`.

Дополнительно проверьте функции **`clearFirestoreCache`**, **`preloadDataFromFirestore`**, **`getInitialSetsForLanguage`**, **`getLocalizedName`**, **`getRussianName`** — при появлении новых типов сущностей в проекте сюда тоже добавляют ветки (см. `CHECKLIST_NEW_SET.md` для новых **наборов**, не языков).

---

## 8. Firestore: загрузка моков в облако

**Файл:** `src/utils/firestore.ts` — функция **`uploadMocksToFirestore`**

1. Для каждого типа данных добавьте **динамический import**, по аналогии с существующими:  
   `const { footballers: footballersXx } = await import('@/mocks/footballers-xx');`
2. В конце функции в блоках `Promise.all([...])` (или последовательных вызовах) добавьте вызовы вида:  
   `saveFootballersToFirestore('xx', footballersXx)`,  
   и то же для всех `save*ToFirestore('xx', ...)`.

Иначе в облаке не появится документ для языка `xx`, и при `DATA_SOURCE` с Firestore контент для нового языка будет неполным.

**Ручной запуск загрузки:** см. `FIRESTORE_SETUP.md` и скрипты `scripts/uploadToFirestore.ts` / `.js`.

---

## 9. Нативное имя приложения (магазины / лаунчер)

### Android

**Создать папку:** `android/app/src/main/res/values-xx/`

**Файл:** `android/app/src/main/res/values-xx/strings.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Локализованное имя приложения</string>
</resources>
```

Имя ресурса должно остаться `app_name`, как в `values/strings.xml`.

### iOS

**Создать папку:** `ios/SpyFootball/xx.lproj/`  
(для языков с регионом иногда `xx-YY.lproj` — по правилам Apple для вашей локали.)

**Файл:** `ios/SpyFootball/xx.lproj/InfoPlist.strings`

```
CFBundleDisplayName = "Localized App Name";
```

---

## 10. Скрипты массового перевода (`scripts/`)

В репозитории есть вспомогательные скрипты (`translateFootballersAll`-подобные, `translateQuestionTopicsAll.ts`, `translateMocks.ts` и т.д.). У многих из них в начале файла задаётся объект **`languageMap`** (или список целевых языков): туда нужно **добавить ваш код `xx`**, иначе скрипт не будет генерировать/переводить файлы для нового языка.

После добавления языка в приложение имеет смысл:

1. Найти скрипты: `rg "languageMap" scripts/`
2. Добавить `xx` в каждый релевантный скрипт, которым вы пользуетесь для подготовки моков или строк в JSON.

Это **не** ломает сборку приложения, если не трогать скрипты, но без этого автоматизация перевода на новый язык работать не будет.

---

## 11. Опционально: магазины и документация

- **`APP_STORE_DESCRIPTION.txt`** — при желании добавьте блок с кратким и полным описанием для нового языка (для Google Play отдельного поля ключевых слов нет — ключевые фразы вшивают в текст описания).
- Скриншоты и локаль листинга в консолях Google Play / App Store Connect настраиваются **вне** репозитория.

---

## 12. Что инструкция **не** заменяет (вне кода или редкие случаи)

| Область | Комментарий |
|--------|-------------|
| **Новый тип набора** (не язык) | См. `CHECKLIST_NEW_SET.md` — там отдельный чек-лист по `sets.ts`, формам, Firestore-коллекциям и т.д. |
| **`localization.ts` вроде `getLocalizedName`** | При добавлении **только** нового языка обычно достаточно импортов и всех объектов `*Mocks`; отдельные ветки под новый **тип** карточки нужны только когда в проект добавляют новый `itemType` / набор. |
| **Правила Firestore / индексы** | Если правила завязаны на имена коллекций, а не на код языка в документе, менять может не понадобиться; после изменения схемы данных проверьте консоль Firebase. |
| **Юридические тексты, политика конфиденциальности** | Локализация сайта/политики — вне этого репозитория, если не храните их здесь. |
| **Автотесты** | В проекте может не быть тестов на список языков; при появлении — обновляйте фикстуры. |

---

## 13. Чек-лист перед коммитом

- [ ] `ILanguage` содержит `xx`
- [ ] `useGetInitialLanguage`: валидация `targetLanguage` включает `xx`
- [ ] `languages.ts` + ключи `languages.*` во **всех** `*.json`
- [ ] `src/localization/languages/xx.json` + правка `i18n.ts`
- [ ] Все файлы `src/mocks/*-xx.ts` из списка раздела 5
- [ ] `src/utils/localization.ts`: imports + все `*Mocks.xx`
- [ ] `uploadMocksToFirestore`: imports + все `save*ToFirestore('xx', ...)`
- [ ] Android `values-xx/strings.xml`
- [ ] iOS `xx.lproj/InfoPlist.strings`
- [ ] RTL: если нужно — три места из раздела 6 согласованы
- [ ] Скрипты в `scripts/`: добавлен `xx` в каждый используемый `languageMap` / список языков (раздел 10)
- [ ] `npx tsc --noEmit` (или сборка проекта) без ошибок

---

## 14. Частые ошибки

1. **Забыли один `*Mocks` в `localization.ts`** — TypeScript ругается на неполный `ILanguage`.
2. **Добавили JSON, но не ключ в других языках** — на экране языков вместо названия будет ключ `languages.xxx`.
3. **Добавили язык в список, но не в `getLanguage`** — при системной локали `xx` приложение откатится на `ru`.
4. **Обновили Firestore в коде, но не выгрузили данные** — на устройстве со старым кэшем или без повторной загрузки моков новый язык в облаке пустой.
5. **Несовпадение RTL между `LanguageScreen`, `getLanguage` и `selecteLanguage`** — держите список RTL-языков в трёх местах одинаковым.
6. **Забыли обновить `languageMap` в скриптах** — приложение собирается, но батч-перевод не создаёт `*-xx.ts` и не дополняет JSON.

---

## 15. Связанные документы

- **`CHECKLIST_NEW_SET.md`** — если добавляете не язык, а новый **встроенный набор** карточек: там же нужно расширять все языки для нового `{setId}-xx.ts`.
- **`FIRESTORE_SETUP.md`** — правила и вызов `uploadMocksToFirestore`.

После изменения набора поддерживаемых языков имеет смысл прогнать полную сборку Android и iOS и открыть экран **Language** в приложении.
