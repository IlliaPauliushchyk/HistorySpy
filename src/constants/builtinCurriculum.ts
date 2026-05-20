/** Встроенная программа: предмет → класс → тип (definitions/names/events). */

export const CURRICULUM_GRADES = [5, 9] as const;
export type CurriculumGrade = (typeof CURRICULUM_GRADES)[number];

/** Фильтр карточек при создании своего набора: все классы или один. */
export type CustomSetGradeFilter = 'all' | CurriculumGrade;

export type GradeLabelKey = `labels.grade${CurriculumGrade}`;

export const CURRICULUM_SUBJECTS = ['worldHistory', 'belarusHistory'] as const;
export type CurriculumSubject = (typeof CURRICULUM_SUBJECTS)[number];

export type CurriculumKind = 'Definitions' | 'Names' | 'Events';
export type CurriculumItemKind = 'Definition' | 'Name' | 'Event';

const CURRICULUM_ITEM_TYPE_RE =
  /^(worldHistory|belarusHistory)(\d+)(Definition|Name|Event)$/;
const CURRICULUM_SET_ID_RE =
  /^(worldHistory|belarusHistory)(\d+)(Definitions|Names|Events)$/;

/** i18n-ключ класса: `labels.grade5`, `labels.grade10`, … */
export function gradeLabelKey(grade: CurriculumGrade): GradeLabelKey {
  return `labels.grade${grade}`;
}

/** Иконка фильтра в «своём наборе»; для нового класса достаточно `numeric-{N}-box`. */
export function gradeFilterIcon(grade: CurriculumGrade): string {
  return `numeric-${grade}-box`;
}

export function isCurriculumGrade(grade: number): grade is CurriculumGrade {
  return (CURRICULUM_GRADES as readonly number[]).includes(grade);
}

export function parseCurriculumItemType(type: string): {
  subject: CurriculumSubject;
  grade: number;
  kind: CurriculumItemKind;
} | null {
  const match = type.match(CURRICULUM_ITEM_TYPE_RE);
  if (!match) {
    return null;
  }
  return {
    subject: match[1] as CurriculumSubject,
    grade: Number(match[2]),
    kind: match[3] as CurriculumItemKind,
  };
}

export function parseCurriculumSetId(setId: string): {
  subject: CurriculumSubject;
  grade: number;
  kind: CurriculumKind;
} | null {
  const match = setId.match(CURRICULUM_SET_ID_RE);
  if (!match) {
    return null;
  }
  return {
    subject: match[1] as CurriculumSubject,
    grade: Number(match[2]),
    kind: match[3] as CurriculumKind,
  };
}

export const BUILTIN_SET_TYPE_IDS = [
  'worldHistory5Definitions',
  'worldHistory5Names',
  'worldHistory5Events',
  'worldHistory9Definitions',
  'worldHistory9Names',
  'worldHistory9Events',
  'belarusHistory5Definitions',
  'belarusHistory5Names',
  'belarusHistory5Events',
  'belarusHistory9Definitions',
  'belarusHistory9Names',
  'belarusHistory9Events',
] as const;

export type BuiltinSetTypeId = (typeof BUILTIN_SET_TYPE_IDS)[number];

export type CurriculumItemType =
  | 'worldHistory5Definition'
  | 'worldHistory5Name'
  | 'worldHistory5Event'
  | 'worldHistory9Definition'
  | 'worldHistory9Name'
  | 'worldHistory9Event'
  | 'belarusHistory5Definition'
  | 'belarusHistory5Name'
  | 'belarusHistory5Event'
  | 'belarusHistory9Definition'
  | 'belarusHistory9Name'
  | 'belarusHistory9Event';

export const BUILTIN_SET_ID_TO_ITEM_TYPE: Record<
  BuiltinSetTypeId,
  CurriculumItemType
> = {
  worldHistory5Definitions: 'worldHistory5Definition',
  worldHistory5Names: 'worldHistory5Name',
  worldHistory5Events: 'worldHistory5Event',
  worldHistory9Definitions: 'worldHistory9Definition',
  worldHistory9Names: 'worldHistory9Name',
  worldHistory9Events: 'worldHistory9Event',
  belarusHistory5Definitions: 'belarusHistory5Definition',
  belarusHistory5Names: 'belarusHistory5Name',
  belarusHistory5Events: 'belarusHistory5Event',
  belarusHistory9Definitions: 'belarusHistory9Definition',
  belarusHistory9Names: 'belarusHistory9Name',
  belarusHistory9Events: 'belarusHistory9Event',
};

/** Старые setId (6 наборов) → новые наборы по классам (5/9). */
export const LEGACY_SET_ID_MIGRATION: Record<string, BuiltinSetTypeId> = {
  worldHistoryDefinitions: 'worldHistory5Definitions',
  worldHistoryNames: 'worldHistory5Names',
  worldHistoryEvents: 'worldHistory5Events',
  belarusHistoryDefinitions: 'belarusHistory5Definitions',
  belarusHistoryNames: 'belarusHistory5Names',
  belarusHistoryEvents: 'belarusHistory5Events',
};

export type BuiltinGroupId = 'worldHistory' | 'belarusHistory';

export type BuiltinGradeSection = {
  grade: CurriculumGrade;
  titleKey: GradeLabelKey;
  setIds: BuiltinSetTypeId[];
};

export type BuiltinSubjectGroup = {
  id: BuiltinGroupId;
  titleKey: 'labels.groupWorldHistory' | 'labels.groupBelarusHistory';
  grades: BuiltinGradeSection[];
};

const kindOrder: CurriculumKind[] = ['Definitions', 'Names', 'Events'];

function setsForGrade(
  subject: CurriculumSubject,
  grade: CurriculumGrade,
): BuiltinSetTypeId[] {
  return kindOrder.map(
    kind => `${subject}${grade}${kind}` as BuiltinSetTypeId,
  );
}

function gradesForSubject(subject: CurriculumSubject): BuiltinGradeSection[] {
  return CURRICULUM_GRADES.map(grade => ({
    grade,
    titleKey: gradeLabelKey(grade),
    setIds: setsForGrade(subject, grade),
  }));
}

export const BUILTIN_SUBJECT_GROUPS: BuiltinSubjectGroup[] = [
  {
    id: 'worldHistory',
    titleKey: 'labels.groupWorldHistory',
    grades: gradesForSubject('worldHistory'),
  },
  {
    id: 'belarusHistory',
    titleKey: 'labels.groupBelarusHistory',
    grades: gradesForSubject('belarusHistory'),
  },
];

export const BUILTIN_SET_ICON_MAP: Record<BuiltinSetTypeId, string> = {
  worldHistory5Definitions: 'book-open-variant',
  worldHistory5Names: 'account',
  worldHistory5Events: 'calendar-clock',
  worldHistory9Definitions: 'book-open-variant',
  worldHistory9Names: 'account',
  worldHistory9Events: 'calendar-clock',
  belarusHistory5Definitions: 'book-open-page-variant',
  belarusHistory5Names: 'account-tie',
  belarusHistory5Events: 'flag',
  belarusHistory9Definitions: 'book-open-page-variant',
  belarusHistory9Names: 'account-tie',
  belarusHistory9Events: 'flag',
};

/** Первый набор в UI: всемирная история → 5 класс → термины. */
export const DEFAULT_BUILTIN_SET_TYPE: BuiltinSetTypeId =
  BUILTIN_SUBJECT_GROUPS[0].grades[0].setIds[0];

type CapitalizeFirst<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${R}`
  : S;

export type RemovedNamesKey = {
  [K in BuiltinSetTypeId]: `removed${CapitalizeFirst<K>}Names`;
}[BuiltinSetTypeId];

export function setIdToRemovedKey(setId: BuiltinSetTypeId): RemovedNamesKey {
  return `removed${setId.charAt(0).toUpperCase()}${setId.slice(1)}Names` as RemovedNamesKey;
}

export function isBuiltinSetTypeId(setType: string): setType is BuiltinSetTypeId {
  return (BUILTIN_SET_TYPE_IDS as readonly string[]).includes(setType);
}

export function getSetIdsForGrade(grade: CurriculumGrade): BuiltinSetTypeId[] {
  return BUILTIN_SUBJECT_GROUPS.flatMap(group =>
    group.grades.filter(g => g.grade === grade).flatMap(g => g.setIds),
  );
}

export function getGradeFromItemType(
  type: CurriculumItemType,
): CurriculumGrade | null {
  const parsed = parseCurriculumItemType(type);
  if (!parsed || !isCurriculumGrade(parsed.grade)) {
    return null;
  }
  return parsed.grade;
}

export function getGradeFromSetId(setId: BuiltinSetTypeId): CurriculumGrade | null {
  const parsed = parseCurriculumSetId(setId);
  if (!parsed || !isCurriculumGrade(parsed.grade)) {
    return null;
  }
  return parsed.grade;
}

export function parseCustomSetGradeFilter(
  raw: string | undefined | null,
): CustomSetGradeFilter {
  if (!raw || raw === 'all') {
    return 'all';
  }
  const asNumber = Number(raw);
  if ((CURRICULUM_GRADES as readonly number[]).includes(asNumber)) {
    return asNumber as CurriculumGrade;
  }
  // Старые фильтры по itemType (до перехода на классы)
  if (
    raw.includes('Definition') ||
    raw.includes('Name') ||
    raw.includes('Event')
  ) {
    const grade = getGradeFromItemType(raw as CurriculumItemType);
    if (grade != null) {
      return grade;
    }
  }
  return 'all';
}

export function customSetFilterToParamValue(
  filter: CustomSetGradeFilter,
): string {
  return filter === 'all' ? 'all' : String(filter);
}

export const CUSTOM_SET_GRADE_FILTER_OPTIONS = [
  { value: 'all' as const, labelKey: 'labels.all', icon: 'format-list-bulleted' },
  ...CURRICULUM_GRADES.map(grade => ({
    value: String(grade),
    labelKey: gradeLabelKey(grade),
    icon: gradeFilterIcon(grade),
  })),
];
