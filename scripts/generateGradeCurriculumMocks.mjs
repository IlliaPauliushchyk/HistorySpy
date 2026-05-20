import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCKS_DIR = path.join(__dirname, '..', 'src', 'mocks');

/** @type {Record<string, { ru: string[]; en: string[]; be: string[] }>} */
export const CURRICULUM_SETS = {
  "worldHistory5Definitions": {
    "ru": [
      "Рабовладельческий строй",
      "Полис",
      "Демократия (Древняя Греция)",
      "Олимпийские игры",
      "Республика (Древний Рим)",
      "Легион",
      "Империя (Древний Рим)",
      "Христианство",
      "Варвары",
      "Феодализм",
      "Рыцарство",
      "Средневековье"
    ],
    "en": [
      "Slave society",
      "Polis",
      "Democracy (Ancient Greece)",
      "Olympic Games",
      "Roman Republic",
      "Legion",
      "Roman Empire",
      "Christianity",
      "Barbarians",
      "Feudalism",
      "Knighthood",
      "Middle Ages"
    ],
    "be": [
      "Рабаваладальні лад",
      "Поліс",
      "Дэмакратыя (Старажытная Грэцыя)",
      "Алімпійскія гульні",
      "Рэспубліка (Старажытны Рым)",
      "Легіён",
      "Імперыя (Старажытны Рым)",
      "Хрысціянства",
      "Варвары",
      "Феадалізм",
      "Рыцарства",
      "Сярэдневечча"
    ]
  },
  "worldHistory5Names": {
    "ru": [
      "Гомер",
      "Леонид I",
      "Александр Македонский",
      "Аристотель",
      "Перикл",
      "Гай Юлий Цезарь",
      "Октавиан Август",
      "Константин Великий",
      "Юстиниан I",
      "Карл Великий",
      "Альфред Великий",
      "Вильгельм Завоеватель"
    ],
    "en": [
      "Homer",
      "Leonidas I",
      "Alexander the Great",
      "Aristotle",
      "Pericles",
      "Gaius Julius Caesar",
      "Octavian Augustus",
      "Constantine the Great",
      "Justinian I",
      "Charlemagne",
      "Alfred the Great",
      "William the Conqueror"
    ],
    "be": [
      "Гомер",
      "Леанід I",
      "Аляксандр Македонскі",
      "Арыстоцель",
      "Перикл",
      "Гай Юлій Цэзар",
      "Аўгуст Октавіян",
      "Канстанцін Вялікі",
      "Юсцініян I",
      "Карл Вялікі",
      "Альфрэд Вялікі",
      "Вільгельм Заваёўнік"
    ]
  },
  "worldHistory5Events": {
    "ru": [
      "Битва при Марафоне (490 г. до н.э.)",
      "Битва при Фермопилах (480 г. до н.э.)",
      "Поход Александра Македонского в Азию (334–323 гг. до н.э.)",
      "Образование Римской республики (509 г. до н.э.)",
      "Убийство Юлия Цезаря (44 г. до н.э.)",
      "Битва при Акции (31 г. до н.э.)",
      "Разделение Римской империи (395 г.)",
      "Падение Западной Римской империи (476 г.)",
      "Норманнское завоевание Англии (1066 г.)",
      "Первый крестовый поход (1096–1099 гг.)",
      "Подписание Великой хартии вольностей (1215 г.)",
      "Осада Константинополя крестоносцами (1204 г.)"
    ],
    "en": [
      "Battle of Marathon (490 BCE)",
      "Battle of Thermopylae (480 BCE)",
      "Alexander the Great's campaign in Asia (334–323 BCE)",
      "Founding of the Roman Republic (509 BCE)",
      "Assassination of Julius Caesar (44 BCE)",
      "Battle of Actium (31 BCE)",
      "Division of the Roman Empire (395)",
      "Fall of the Western Roman Empire (476)",
      "Norman conquest of England (1066)",
      "First Crusade (1096–1099)",
      "Signing of Magna Carta (1215)",
      "Sack of Constantinople by Crusaders (1204)"
    ],
    "be": [
      "Бітва пры Марафоне (490 г. да н.э.)",
      "Бітва пры Фермапілах (480 г. да н.э.)",
      "Паход Аляксандра Македонскага ў Азію (334–323 гг. да н.э.)",
      "Утварэнне Рымскай рэспублікі (509 г. да н.э.)",
      "Забойства Юлія Цэзара (44 г. да н.э.)",
      "Бітва пры Акцыі (31 г. да н.э.)",
      "Падзел Рымскай імперыі (395 г.)",
      "Падзенне Заходняй Рымскай імперыі (476 г.)",
      "Нарманскае заваяванне Англіі (1066 г.)",
      "Першы крыжовы паход (1096–1099 гг.)",
      "Падпісанне Вялікай хартыі вольнасцяў (1215 г.)",
      "Узяцце Канстанцінопаля крыжакамі (1204 г.)"
    ]
  },
  "worldHistory9Definitions": {
    "ru": [
      "Версальско-Вашингтонская система",
      "Лига Наций",
      "Тоталитаризм",
      "Фашизм",
      "Холодная война",
      "Биполярный мир",
      "Деколонизация",
      "Организация Объединённых Наций",
      "Европейский союз",
      "Глобализация",
      "Ядерное оружие",
      "Международный терроризм"
    ],
    "en": [
      "Versailles–Washington system",
      "League of Nations",
      "Totalitarianism",
      "Fascism",
      "Cold War",
      "Bipolar world",
      "Decolonization",
      "United Nations",
      "European Union",
      "Globalization",
      "Nuclear weapons",
      "International terrorism"
    ],
    "be": [
      "Версальска-Вашынгтонская сістэма",
      "Ліга Нацый",
      "Таталітарызм",
      "Фашызм",
      "Халодная вайна",
      "Біпалярны свет",
      "Дэкаланізацыя",
      "Арганізацыя Аб’яднаных Нацый",
      "Еўрапейскі саюз",
      "Глабалізацыя",
      "Ядзерная зброя",
      "Міжнародны тэрарызм"
    ]
  },
  "worldHistory9Names": {
    "ru": [
      "Вудро Вильсон",
      "Владимир Ленин",
      "Иосиф Сталин",
      "Адольф Гитлер",
      "Уинстон Черчилль",
      "Франклин Рузвельт",
      "Шарль де Голль",
      "Махатма Ганди",
      "Нельсон Мандела",
      "Михаил Горбачёв",
      "Маргарет Тэтчер",
      "Барак Обама"
    ],
    "en": [
      "Woodrow Wilson",
      "Vladimir Lenin",
      "Joseph Stalin",
      "Adolf Hitler",
      "Winston Churchill",
      "Franklin Roosevelt",
      "Charles de Gaulle",
      "Mahatma Gandhi",
      "Nelson Mandela",
      "Mikhail Gorbachev",
      "Margaret Thatcher",
      "Barack Obama"
    ],
    "be": [
      "Вудра Вільсан",
      "Уладзімір Ленін",
      "Іосіф Сталін",
      "Адольф Гітлер",
      "Уінстан Чэрчыль",
      "Франклін Рузвельт",
      "Шарль дэ Голь",
      "Махатма Гандзі",
      "Нельсан Мандэла",
      "Міхаіл Гарбачоў",
      "Маргарэт Тэтчэр",
      "Барак Абама"
    ]
  },
  "worldHistory9Events": {
    "ru": [
      "Версальский мирный договор (1919 г.)",
      "Основание Лиги Наций (1920 г.)",
      "Начало Великой депрессии (1929 г.)",
      "Приход Адольфа Гитлера к власти в Германии (1933 г.)",
      "Начало Второй мировой войны (1939 г.)",
      "Капитуляция Германии (1945 г.)",
      "Образование ООН (1945 г.)",
      "Берлинский кризис (1961 г.)",
      "Падение Берлинской стены (1989 г.)",
      "Распад СССР (1991 г.)",
      "Теракты 11 сентября в США (2001 г.)",
      "Вступление Китая в ВТО (2001 г.)"
    ],
    "en": [
      "Treaty of Versailles (1919)",
      "Founding of the League of Nations (1920)",
      "Start of the Great Depression (1929)",
      "Hitler comes to power in Germany (1933)",
      "Start of World War II (1939)",
      "Germany's surrender (1945)",
      "Founding of the United Nations (1945)",
      "Berlin Crisis (1961)",
      "Fall of the Berlin Wall (1989)",
      "Dissolution of the USSR (1991)",
      "September 11 attacks in the USA (2001)",
      "China joins the WTO (2001)"
    ],
    "be": [
      "Версальскі мірны дагавор (1919 г.)",
      "Стварэнне Лігі Нацый (1920 г.)",
      "Пачатак Вялікай дэпрэсіі (1929 г.)",
      "Прыход Адольфа Гітлера да ўлады ў Германіі (1933 г.)",
      "Пачатак Другой сусветнай вайны (1939 г.)",
      "Капітуляцыя Германіі (1945 г.)",
      "Стварэнне ААН (1945 г.)",
      "Берлінскі крызіс (1961 г.)",
      "Падзенне Берлінскай сцяны (1989 г.)",
      "Распад СССР (1991 г.)",
      "Тэракты 11 верасня ў ЗША (2001 г.)",
      "Уступленне Кітая ў САТ (2001 г.)"
    ]
  },
  "belarusHistory5Definitions": {
    "ru": [
      "Полачане",
      "Другвины",
      "Кривичи",
      "Полоцкое княжество",
      "Великое княжество Литовское",
      "Статут ВКЛ",
      "Литвин",
      "Магдебургское право",
      "Шляхта",
      "Крепостное право",
      "Брестская церковная уния",
      "Речь Посполитая"
    ],
    "en": [
      "Polochans",
      "Dregoviches",
      "Krivichs",
      "Principality of Polotsk",
      "Grand Duchy of Lithuania",
      "Statute of the GDL",
      "Litvin",
      "Magdeburg law",
      "Szlachta (nobility)",
      "Serfdom",
      "Union of Brest",
      "Polish–Lithuanian Commonwealth"
    ],
    "be": [
      "Полачане",
      "Дрыгавічы",
      "Крывічы",
      "Полацкае княства",
      "Вялікае Княства Літоўскае",
      "Статут ВКЛ",
      "Літвін",
      "Магдэбургскае права",
      "Шляхта",
      "Паншчына",
      "Брэсцкая царкоўная унія",
      "Рэч Паспалітая"
    ]
  },
  "belarusHistory5Names": {
    "ru": [
      "Рогнёда",
      "Ефросинья Полоцкая",
      "Франциск Скорина",
      "Миндовг",
      "Витовт",
      "Альгерд",
      "Ягайло",
      "Лев Сапега",
      "Николай Радзивилл Чёрный",
      "Симеон Полоцкий",
      "Тадеуш Костюшко",
      "Кастусь Калиновский"
    ],
    "en": [
      "Rogneda",
      "Euphrosyne of Polotsk",
      "Francysk Skaryna",
      "Mindaugas",
      "Vytautas the Great",
      "Algirdas",
      "Jogaila",
      "Lev Sapieha",
      "Mikołaj Radziwiłł the Black",
      "Simeon of Polotsk",
      "Tadeusz Kościuszko",
      "Kastus Kalinouski"
    ],
    "be": [
      "Рагнеда",
      "Еўфрасіння Полацкая",
      "Францішак Скарына",
      "Міндоўг",
      "Вітаўт",
      "Альгерд",
      "Ягайла",
      "Леў Сапега",
      "Мікалай Радзівіл Чорны",
      "Сімеон Полацкі",
      "Тадэвуш Касцюшка",
      "Кастусь Каліноўскі"
    ]
  },
  "belarusHistory5Events": {
    "ru": [
      "Образование Полоцкого княжества (IX в.)",
      "Крещение Полоцка (988 г.)",
      "Строительство Софийского собора в Полоцке (XI в.)",
      "Объединение литовских земель при Миндовге (XIII в.)",
      "Битва на реке Воже (1378 г.)",
      "Грюнвальдская битва (1410 г.)",
      "Привилегия Вильно (1387 г.)",
      "Принятие Статута ВКЛ (1529 г.)",
      "Люблинская уния (1569 г.)",
      "Брестская церковная уния (1596 г.)",
      "Битва под Оршей (1514 г.)",
      "Первый раздел Речи Посполитой (1772 г.)"
    ],
    "en": [
      "Formation of the Principality of Polotsk (9th c.)",
      "Christianization of Polotsk (988)",
      "Construction of St. Sophia Cathedral in Polotsk (11th c.)",
      "Unification of Lithuanian lands under Mindaugas (13th c.)",
      "Battle on the Vikhra River (1378)",
      "Battle of Grunwald (1410)",
      "Privilege of Vilnius (1387)",
      "Adoption of the First Statute of the GDL (1529)",
      "Union of Lublin (1569)",
      "Union of Brest (1596)",
      "Battle of Orsha (1514)",
      "First partition of the Polish–Lithuanian Commonwealth (1772)"
    ],
    "be": [
      "Утварэнне Полацкага княства (IX ст.)",
      "Хрышчэнне Полацка (988 г.)",
      "Будаўніцтва Сафійскага сабора ў Полацку (XI ст.)",
      "Аб’яднанне літоўскіх зямель пры Міндоўгу (XIII ст.)",
      "Бітва на рацэ Вожы (1378 г.)",
      "Грынвальдская бітва (1410 г.)",
      "Прывілей Вільні (1387 г.)",
      "Прыняцце Статута ВКЛ (1529 г.)",
      "Люблінская унія (1569 г.)",
      "Брэсцкая царкоўная унія (1596 г.)",
      "Бітва пад Оршай (1514 г.)",
      "Першы падзел Рэчы Паспалітай (1772 г.)"
    ]
  },
  "belarusHistory9Definitions": {
    "ru": [
      "Белорусская народная республика",
      "Западная Беларусь",
      "Белорусская Советская Социалистическая Республика",
      "Коллективизация",
      "Великая Отечественная война",
      "Партизанское движение",
      "Операция «Багратион»",
      "Перестройка",
      "Декларация о государственном суверенитете",
      "Независимость Республики Беларусь",
      "Союзное государство",
      "Западная интеграция"
    ],
    "en": [
      "Belarusian People's Republic",
      "Western Belarus",
      "Byelorussian Soviet Socialist Republic",
      "Collectivization",
      "Great Patriotic War",
      "Partisan movement",
      "Operation Bagration",
      "Perestroika",
      "Declaration on State Sovereignty",
      "Independence of the Republic of Belarus",
      "Union State",
      "Western integration"
    ],
    "be": [
      "Беларуская Народная Рэспубліка",
      "Заходняя Беларусь",
      "Беларуская Савецкая Сацыялістычная Рэспубліка",
      "Калектывізацыя",
      "Вялікая Айчынная вайна",
      "Партызанскі рух",
      "Аперацыя «Баграціён»",
      "Перабудова",
      "Дэкларацыя аб дзяржаўным суверэнітэце",
      "Незалежнасць Рэспублікі Беларусь",
      "Саюзная дзяржава",
      "Заходняя інтэграцыя"
    ]
  },
  "belarusHistory9Names": {
    "ru": [
      "Вацлав Адамович",
      "Цихан Часноух",
      "Янка Купала",
      "Якуб Колас",
      "Пётр Машэраў",
      "Константин Заслонов",
      "Пётр Крапивницкий",
      "Станислав Шушкевич",
      "Александр Лукашенко",
      "Зенон Позняк",
      "Михась Клімковіч",
      "Владимир Некляевич"
    ],
    "en": [
      "Vaclau Adamovich",
      "Tikhon Chasnokh",
      "Yanka Kupala",
      "Yakub Kolas",
      "Pyotr Masherov",
      "Konstantin Zaslonov",
      "Pyotr Krapivnitsky",
      "Stanislau Shushkevich",
      "Alexander Lukashenko",
      "Zenon Poznyak",
      "Mikhail Klimovich",
      "Vladimir Neklyayevich"
    ],
    "be": [
      "Вацлаў Адамовіч",
      "Ціхан Часноух",
      "Янка Купала",
      "Якуб Колас",
      "Пётр Машэраў",
      "Канстанцін Заслонаў",
      "Пётр Крапівніцкі",
      "Станіслаў Шушкевіч",
      "Аляксандр Лукашэнка",
      "Зянон Пазьняк",
      "Міхась Клімковіч",
      "Уладзімір Некляевіч"
    ]
  },
  "belarusHistory9Events": {
    "ru": [
      "Провозглашение Белорусской народной республики (1918 г.)",
      "Образование БССР (1919 г.)",
      "Воссоединение Западной Беларуси с БССР (1939 г.)",
      "Начало Великой Отечественной войны на территории БССР (1941 г.)",
      "Операция «Багратион» (1944 г.)",
      "Освобождение Минска (1944 г.)",
      "Чернобыльская катастрофа на территории БССР (1986 г.)",
      "Принятие Декларации о государственном суверенитете (1990 г.)",
      "Провозглашение независимости Республики Беларусь (1991 г.)",
      "Распад СССР (1991 г.)",
      "Первые президентские выборы в Беларуси (1994 г.)",
      "Референдум об изменении Конституции (1996 г.)"
    ],
    "en": [
      "Proclamation of the Belarusian People's Republic (1918)",
      "Formation of the BSSR (1919)",
      "Reunification of Western Belarus with the BSSR (1939)",
      "Start of the Great Patriotic War on the territory of the BSSR (1941)",
      "Operation Bagration (1944)",
      "Liberation of Minsk (1944)",
      "Chernobyl disaster on the territory of the BSSR (1986)",
      "Adoption of the Declaration on State Sovereignty (1990)",
      "Proclamation of independence of the Republic of Belarus (1991)",
      "Dissolution of the USSR (1991)",
      "First presidential election in Belarus (1994)",
      "Referendum on constitutional amendments (1996)"
    ],
    "be": [
      "Абвяшчэнне Беларускай Народнай Рэспублікі (1918 г.)",
      "Утварэнне БССР (1919 г.)",
      "Уз’яднанне Заходняй Беларусі з БССР (1939 г.)",
      "Пачатак Вялікай Айчыннай вайны на тэрыторыі БССР (1941 г.)",
      "Аперацыя «Баграціён» (1944 г.)",
      "Вызваленне Мінска (1944 г.)",
      "Чарнобыльская катастрофа на тэрыторыі БССР (1986 г.)",
      "Прыняцце Дэкларацыі аб дзяржаўным суверэнітэце (1990 г.)",
      "Абвяшчэнне незалежнасці Рэспублікі Беларусь (1991 г.)",
      "Распад СССР (1991 г.)",
      "Першыя прэзідэнцкія выбары ў Беларусі (1994 г.)",
      "Рэферэндум аб змене Канстытуцыі (1996 г.)"
    ]
  }
};

/** Порядок ключей = порядок в `BUILTIN_SET_TYPE_IDS` (builtinCurriculum.ts). */
export const SET_IDS = Object.keys(CURRICULUM_SETS);

function escapeTsString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatArray(exportName, items) {
  const body = items.map((item) => `  '${escapeTsString(item)}',`).join('\n');
  return `export const ${exportName} = [\n${body}\n];\n`;
}

function writeSet(setId) {
  const entry = CURRICULUM_SETS[setId];
  if (!entry) throw new Error(`Missing data for ${setId}`);
  for (const lang of ['ru', 'en', 'be']) {
    if (entry[lang].length !== 12) {
      throw new Error(`${setId} (${lang}) must have 12 items, got ${entry[lang].length}`);
    }
  }
  const files = [
    { suffix: '', lang: 'ru' },
    { suffix: '-en', lang: 'en' },
    { suffix: '-be', lang: 'be' },
  ];
  const written = [];
  for (const { suffix, lang } of files) {
    const filePath = path.join(MOCKS_DIR, `${setId}${suffix}.ts`);
    fs.writeFileSync(filePath, formatArray(setId, entry[lang]), 'utf8');
    written.push(filePath);
  }
  return written;
}

function main() {
  fs.mkdirSync(MOCKS_DIR, { recursive: true });
  const allWritten = [];
  for (const setId of SET_IDS) {
    allWritten.push(...writeSet(setId));
  }
  console.log(`Wrote ${allWritten.length} mock files.`);
  for (const setId of SET_IDS) {
    const ru = CURRICULUM_SETS[setId].ru;
    console.log(`  ${setId}: ${ru.length} items (ru)`);
  }
  return allWritten;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main();
}
