# SpyFootball: подробный технический разбор

Этот документ описывает приложение на уровне архитектуры, потока данных и точек расширения. Цель: чтобы ты мог взять проект как шаблон и быстро перенести его на новую тему (например, "исторический шпион"), не ломая логику.

## 1) Что это за приложение

`SpyFootball` — мобильная party-game в жанре "кто шпион":
- есть `N` игроков, из них `K` — шпионы;
- всем обычным игрокам показывается один и тот же секрет (текущая тема — футбольная сущность);
- шпионы секрета не видят;
- после раздачи ролей запускается обсуждение с таймером;
- можно изгонять игроков, игра завершается автоматически или вручную.

### 1.1 Главные фичи
- много языков интерфейса;
- поддержка RTL (арабский/урду);
- встроенные и пользовательские наборы;
- редактирование наборов (удаление элементов, reset);
- локальное сохранение состояния;
- аналитика Firebase с ограничениями приватности.

---

## 2) Технологический стек и почему он здесь

- `React Native 0.81` + `React 19` — кросс-платформенная мобильная база;
- `@react-navigation/native` + `native-stack` — маршрутизация между экранами;
- `Redux Toolkit` — хранение игровых настроек между экранами;
- `AsyncStorage` — персистентное локальное хранение (настройки и наборы);
- `i18next` + `react-i18next` + `react-native-localize` — i18n;
- `react-native-paper` — UI-компоненты и theme-provider;
- Firebase:
  - `analytics` — события;
  - `firestore` — внешний источник контентных наборов (опционально);
  - `app`/`storage` — инфраструктура SDK.

См. полный список: `package.json`.

---

## 3) Высокоуровневая архитектура

Приложение делится на 5 уровней:

1. **UI-уровень**  
   Экраны, карточки, формы, модалки (`src/screens`, `src/components`).

2. **State-уровень**  
   Redux store + локальный стейт в хуках (`src/store`, `src/hooks`).

3. **Domain-уровень (игровая логика)**  
   `useActiveGame`, `useEditSets`, `useActiveGameResults`.

4. **Data-уровень**  
   `AsyncStorage` + наборы + локализационные маппинги + Firestore (`src/utils`).

5. **Infra-уровень**  
   Провайдеры, навигация, тема, i18n bootstrap (`AppProviders`, `RootNavigator`).

---

## 4) Структура проекта (ориентиры)

Критичные каталоги:
- `src/App.tsx` — вход в React-дерево;
- `src/components/common/AppProviders.tsx` — все глобальные провайдеры;
- `src/navigation/index.tsx` — root stack;
- `src/screens/*` — экраны;
- `src/hooks/*` — hooks с бизнес-логикой;
- `src/store/*` — redux;
- `src/utils/storage.ts` — AsyncStorage слой;
- `src/utils/sets.ts` — логика наборов;
- `src/utils/localization.ts` — контент + кеш + конвертеры имен;
- `src/utils/firestore.ts` — чтение/запись Firestore коллекций;
- `src/utils/analytics.ts` — события аналитики;
- `src/localization/languages/*.json` — словари UI-текстов;
- `src/mocks/*.ts` — контентные данные по языкам.

---

## 5) Корень приложения: жизненный цикл запуска

## 5.1 `src/App.tsx`
Минимальный composition:
- `AppProviders`
  - `RootNavigator`.

## 5.2 `src/components/common/AppProviders.tsx`
При старте:
1. Инициализируется i18n (`import '@/localization/i18n'`).
2. Загружается стартовый язык (`useGetInitialLanguage`).
3. Очищается/обновляется кеш данных и предзагружаются наборы (`preloadDataFromFirestore`).
4. Оборачивается дерево в:
   - `SafeAreaProvider`;
   - `Redux Provider`;
   - `PaperProvider`;
   - `NavigationContainer`;
   - `AlertProvider`.

Пока language/data loading не завершены — показывается `Spinner`.

---

## 6) Навигация и маршруты

## 6.1 Роуты
- Enum: `src/constants/routes.ts` (`Screens`).
- Stack: `src/navigation/index.tsx`.

Маршруты:
- `Home`
- `Language`
- `Rules`
- `Game Settings`
- `Active Game`
- `Active Game Results`
- `Edit Sets`
- `Create Custom Set`

## 6.2 Пользовательские сценарии

### Сценарий "Игра"
1. `Home` -> `Game Settings`
2. Save settings -> `Active Game`
3. Finish game -> `Active Game Results`
4. New game -> reset stack -> `Home`

### Сценарий "Наборы"
1. `Home` -> `Edit Sets`
2. Встроенные: удаление/восстановление элементов
3. Кастомные: создание/редактирование/удаление через `Create Custom Set`

### Сценарий "Язык"
1. `Home` -> `Language`
2. Выбор языка
3. Если меняется RTL/LTR, предлагается перезагрузка.

---

## 7) State management: что хранится где

## 7.1 Redux (`src/store`)

Сейчас в Redux хранится только игровая конфигурация:
- slice: `gameSettings` (`src/store/slices/gameSettings.ts`);
- действия:
  - `setGameSettings`
  - `resetGameSettings`
- селектор:
  - `selectGameSettings`.

`configureStore` отключает `serializableCheck`/`immutableCheck` ради производительности.

## 7.2 AsyncStorage (`src/utils/storage.ts`)

Ключи:
- `@gameSettings`:
  - `playersCount`
  - `spiesCount`
  - `roundTime`
  - `infiniteTime`
  - `setType`
  - `suggestQuestionEnabled`
- `@sets`:
  - структура `SetsData` (удаленные элементы + custom sets + язык).

## 7.3 Почему и Redux, и AsyncStorage
- Redux нужен для "живого" состояния между экранами в текущем запуске.
- AsyncStorage нужен для восстановления состояния после перезапуска.

---

## 8) Типы данных (контракты)

Ключевые типы:

- `GameSettingsData` (`src/utils/storage.ts`)
- `SetItem`:
  - `name: string`
  - `type: ...` (много категорий)
- `SetData`:
  - `id`, `name`, `items`, `isCustom`, `modifiedAt`
- `SetsData`:
  - списки удаленных русских имен по категориям;
  - `customSets`;
  - `language`.

Важно: удаленные элементы хранятся как **русские имена**, это сделано для стабильности между языками.

---

## 9) Локализация: интерфейс и контент

## 9.1 UI-локализация
- `src/localization/i18n.ts` регистрирует языки из `src/localization/languages/*.json`.
- `useTranslation()` используется в экранах и компонентах.

## 9.2 Выбор языка и RTL
- `useGetInitialLanguage`:
  - определяет язык из `AsyncStorage` или системного;
  - fallback на `ru`, если язык неподдерживаемый;
  - применяет `I18nManager.forceRTL` для `ar`/`ur`;
  - обновляет `rtlKey` для полного re-render дерева.

## 9.3 Контентные данные (списки сущностей)
- Основной фасад: `src/utils/localization.ts`.
- Источник задается в `src/constants/config.ts`:
  - `DATA_SOURCE = 'mocks'` или `'firestore'`.

Как работает загрузка:
1. `preloadDataFromFirestore(language, force)` грузит все категории.
2. Если Firestore недоступен или пусто, используется fallback из `src/mocks`.
3. Данные кладутся в внутренние кеши (`*_Cache`).
4. `getFootballers`, `getCoaches`, ... читают сначала кеш, потом моки.

---

## 10) Data layer: наборы, миграции, фильтрация

Главный модуль: `src/utils/sets.ts`.

## 10.1 Что делает `loadSetsData()`
- предзагружает контент (текущий язык + `ru` для валидаций);
- читает `@sets` из AsyncStorage;
- если структура старая — мигрирует:
  - массивы целых наборов;
  - индексы удаленных элементов;
- валидирует удаленные имена против русских эталонных списков;
- нормализует кастомные наборы;
- сохраняет обновленную структуру обратно.

## 10.2 `getActualSets(...)`
Берет полный список категорий и убирает удаленные элементы по русским именам.

## 10.3 `getSetByName(...)`
Возвращает набор по `setType`, включая:
- встроенные категории;
- `both` (`players + coaches`);
- кастомный набор по id.

## 10.4 `saveCustomSetToStorage(...)`
- валидирует имя и минимум 5 элементов;
- преобразует выбранные локализованные ключи в `SetItem`;
- приводит имена к русскому через `getRussianName`;
- обновляет или создает кастомный набор;
- сохраняет в `@sets`.

## 10.5 Валидация
- встроенный набор: минимум 10 элементов;
- кастомный набор: минимум 5 элементов.

---

## 11) Игровая логика детально (`useActiveGame`)

`src/hooks/useActiveGame.ts` — сердце приложения.

## 11.1 Инициализация
- получает `gameSettings` из Redux;
- загружает `setsData`;
- случайно формирует массив игроков с ролями;
- выбирает случайную сущность `selectedPerson` из набора.

## 11.2 Этап A: Раздача карточек
- экран: `PlayerCardsScreen`;
- карта игрока сначала "закрыта", потом "показать";
- для шпиона отображается отсутствие темы.

## 11.3 Этап B: Первый игрок
- когда все карточки показаны:
  - выбирается случайный первый игрок;
  - показывается промежуточный black/announcement screen;
  - после задержки начинается основная фаза.

## 11.4 Этап C: Активная игра
- экран: `ActiveGameTimerScreen`;
- таймер:
  - start/pause/resume;
  - restart;
  - ручное редактирование;
- изгнание:
  - выбор игрока;
  - confirm modal;
  - exile card animation;
  - обновление состава.

## 11.5 Этап D: Проверка победы
Проверяются условия:
- если шпионов не осталось после изгнания -> победа `players`;
- если шпионов >= игроков -> победа `spies`;
- если таймер истек -> победа `spies`;
- есть ручное завершение ("кто победил").

## 11.6 Этап E: Результаты
- `navigateToResults` формирует payload:
  - игроки, роли, статус изгнания;
  - победитель;
  - персонаж раунда;
  - тип набора;
- `navigation.replace(Screens.activeGameResults, { result })`.

---

## 12) Логика редактирования наборов (`useEditSets`)

`src/hooks/useEditSets.ts`:
- грузит `setsData`;
- строит список `editingSets` (builtin + custom);
- поддерживает модалку редактирования builtin-наборов;
- reset builtin-набора до полного состояния;
- удаление кастомного набора;
- удаление элемента из набора с валидацией;
- авто-сохранение изменений через `saveSetsData`.

Почему авто-сохранение:
- чтобы изменения не терялись при выходе с экрана;
- чтобы UI набора сразу отражал persisted state.

---

## 13) Экраны и ответственность (подробнее)

- `src/screens/HomeScreen.tsx`
  - вход в флоу;
  - логирование старта/переходов.

- `src/screens/GameSettingsScreen.tsx`
  - конфигурация раунда;
  - загрузка доступных наборов (`getAvailableSets`);
  - отправка в Redux + AsyncStorage;
  - переход к игре.

- `src/screens/ActiveGameScreen.tsx`
  - state machine уровня UI:
    - exile screen / black screen / timer screen / card screen;
  - блокирует back-навигацию в нежелательных состояниях.

- `src/screens/ActiveGameResultsScreen.tsx`
  - группирует winners/losers;
  - показывает итоговую карточку темы;
  - дает reset на `Home`.

- `src/screens/EditSetsScreen.tsx`
  - 2 таба: builtin/custom;
  - карточки наборов, reset/delete/edit;
  - переход к `CreateCustomSet`.

- `src/screens/CreateCustomSetScreen.tsx`
  - поиск, фильтр по категориям;
  - дедупликация при "all";
  - выбор элементов;
  - создание/обновление.

- `src/screens/LanguageScreen.tsx`
  - изменение языка;
  - специальный сценарий для RTL софт-reload.

- `src/screens/RulesScreen.tsx`
  - статический/локализованный контент правил.

---

## 14) Аналитика и приватность

Файл: `src/utils/analytics.ts`.

Слои событий:
- screen events;
- game lifecycle events;
- set events;
- language events.

Ограничения:
- кастомные наборы в основном не отправляются в аналитику;
- не отправляются потенциально чувствительные пользовательские строки;
- разрешены только безопасные параметры (числа, типы, публичные категории).

---

## 15) Что зависит от футбольной темы прямо сейчас

Сильная привязка:
- названия категорий и типов (`players`, `coaches`, `legends`, ...);
- объемные if/else цепочки в:
  - `useActiveGame`
  - `useEditSets`
  - `sets.ts`
  - `localization.ts`
  - `storage.ts` (`SetItem.type`)
  - `analytics.ts` (builtin set types)
- данные в `src/mocks/*`;
- тексты в `src/localization/languages/*.json`.

Слабая привязка (почти универсально):
- навигация;
- механика раздачи ролей;
- таймер;
- подсчет победы;
- базовые компоненты UI;
- storage/redux каркас.

---

## 16) Migration playbook: перенос на тему "исторический шпион"

Ниже практический порядок, который минимизирует поломки.

## 16.1 Этап 1: Нейминг и бренд
- `app.json` (`name`, `displayName`);
- иконки/asset naming;
- заголовки и тексты `Home`, `Rules`.

## 16.2 Этап 2: Доменные категории
Введи новые категории, например:
- `agents`
- `operations`
- `eras`
- `countries`
- `doubleAgents`
- `codeNames`

Синхронно обнови:
- `SetItem.type` в `src/utils/storage.ts`;
- все if/else по `setType`;
- `FILTER_OPTIONS`/`ITEM_TYPES` в `CreateCustomSetScreen`;
- `BUILTIN_SET_TYPES` в `analytics.ts`.

## 16.3 Этап 3: Контентный слой
- заменяешь `src/mocks/*.ts` на новые наборы;
- обновляешь маппинги в `src/utils/localization.ts`;
- при необходимости переименовываешь Firestore-коллекции в `src/utils/firestore.ts`.

## 16.4 Этап 4: UI и локализация
- обновляешь переводы в `src/localization/languages/*.json`;
- проверяешь ключи правил и текстов кнопок;
- проверяешь карточки роли и результаты на новую терминологию.

## 16.5 Этап 5: Валидация и аналитика
- проверяешь минимумы наборов (5/10) — подходят ли новой игре;
- ревизуешь аналитические события и параметры;
- исключаешь пользовательские приватные данные.

## 16.6 Этап 6: Smoke + regression
- новая игра по всем базовым категориям;
- кастомный набор (создание/редактирование/удаление);
- смена языка и RTL;
- таймер/пауза/изгнание/ручной выбор победителя.

---

## 17) Риски при переносе (и как избежать)

1. **Категории обновлены не везде**  
   Симптом: пустые списки, undefined set, падение при выборе набора.  
   Решение: пройти по всем упоминаниям `setType` и `SetItem.type`.

2. **Ломается конвертация имен**  
   Симптом: удаленные элементы "возвращаются" при смене языка.  
   Решение: обязательно поддерживать `getLocalizedName`/`getRussianName` эквивалент для новых категорий.

3. **Неполная миграция старых данных**  
   Симптом: краши после обновления версии.  
   Решение: не удалять legacy-migration код в `loadSetsData`, пока не пройдет цикл релизов.

4. **Расхождение mock и firestore схемы**  
   Симптом: в dev все ок, в prod пусто.  
   Решение: фиксировать единый контракт категории/документа заранее.

---

## 18) Таблица ответственности модулей

- `AppProviders` — bootstrap и глобальный runtime context.
- `RootNavigator` — маршрутизация между экранами.
- `useActiveGame` — state machine игровой сессии.
- `useEditSets` — state machine редактирования наборов.
- `sets.ts` — правила целостности и персистентности наборов.
- `localization.ts` — контентный фасад + язык + кеш + name mapping.
- `storage.ts` — чтение/запись локальных данных.
- `analytics.ts` — телеметрия и privacy-фильтры.

---

## 19) Быстрый техчек перед релизом тематического форка

- [ ] Все новые категории есть в `SetItem.type`.
- [ ] Все новые категории есть в фильтрах создания кастомного набора.
- [ ] Все новые категории добавлены в `getSetByName`.
- [ ] Все новые категории поддерживаются в конвертерах имен.
- [ ] В `analytics.ts` обновлен whitelist builtin-наборов.
- [ ] `DATA_SOURCE` выставлен как нужно (`mocks` для локального теста, `firestore` для продовой схемы).
- [ ] Проверены 3 устройства/эмулятора: LTR + RTL + слабое устройство.

---

## 20) Ключевые файлы (короткая карта)

- Вход: `src/App.tsx`
- Провайдеры: `src/components/common/AppProviders.tsx`
- Навигация: `src/navigation/index.tsx`
- Роуты: `src/constants/routes.ts`
- Конфиг данных: `src/constants/config.ts`
- Store: `src/store/index.ts`
- Slice настроек: `src/store/slices/gameSettings.ts`
- Игра: `src/hooks/useActiveGame.ts`
- Наборы: `src/hooks/useEditSets.ts`
- Storage: `src/utils/storage.ts`
- Sets domain: `src/utils/sets.ts`
- Localization domain: `src/utils/localization.ts`
- Firestore adapter: `src/utils/firestore.ts`
- Analytics adapter: `src/utils/analytics.ts`
- Экраны: `src/screens/*.tsx`

---

## 21) Что делать дальше

Если хочешь, следующим шагом могу сделать "готовый migration patch" под исторический шпионаж:
- добавлю новые category ids;
- заменю футбольные названия в критичных switch/if местах;
- оставлю TODO-метки только в контентных файлах, куда нужно будет вставить данные.
