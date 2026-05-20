import {
  BUILTIN_SET_TYPE_IDS,
  BuiltinSetTypeId,
  CustomSetGradeFilter,
  getSetIdsForGrade,
} from '@/constants/builtinCurriculum';
import { getInitialSetsForLanguage, getRussianName } from '@/utils/localization';
import { ILanguage } from '@/hooks/localization';
import { SetItem } from '@/utils/storage';

export function collectBuiltinItemsForCustomSetFilter(
  language: ILanguage,
  filter: CustomSetGradeFilter,
): SetItem[] {
  const initial = getInitialSetsForLanguage(language);
  const setIds: readonly BuiltinSetTypeId[] =
    filter === 'all' ? BUILTIN_SET_TYPE_IDS : getSetIdsForGrade(filter);

  const items = setIds.flatMap(setId => initial[setId] ?? []);
  return dedupeByRussianName(items);
}

function dedupeByRussianName(items: SetItem[]): SetItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const russianName = getRussianName(item.name, item.type);
    if (seen.has(russianName)) {
      return false;
    }
    seen.add(russianName);
    return true;
  });
}
