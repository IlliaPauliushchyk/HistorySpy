import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURRICULUM_HINTS } from './curriculumHintsContent.mjs';
import { CURRICULUM_SETS, SET_IDS } from './generateGradeCurriculumMocks.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HINTS_DIR = path.join(__dirname, '..', 'src', 'mocks', 'hints');

const LANG_FILES = {
  ru: { file: 'curriculumHints.ts', exportName: 'curriculumHintsRu' },
  en: { file: 'curriculumHints-en.ts', exportName: 'curriculumHintsEn' },
  be: { file: 'curriculumHints-be.ts', exportName: 'curriculumHintsBe' },
};

function escapeTsString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function collectRuKeys() {
  const keys = [];
  for (const setId of SET_IDS) {
    for (const name of CURRICULUM_SETS[setId].ru) {
      keys.push(name);
    }
  }
  return keys;
}

function formatHintsMap(lang, keys) {
  const hints = CURRICULUM_HINTS[lang];
  const lines = keys.map(key => {
    const text = hints[key];
    if (!text) {
      throw new Error(`Missing ${lang} hint for: ${key}`);
    }
    return `  '${escapeTsString(key)}':\n    '${escapeTsString(text)}',`;
  });
  return lines.join('\n');
}

function writeLangFile(lang, keys) {
  const { file, exportName } = LANG_FILES[lang];
  const body = formatHintsMap(lang, keys);
  const content = `import { CurriculumHintsMap } from './types';

export const ${exportName}: CurriculumHintsMap = {
${body}
};
`;
  const filePath = path.join(HINTS_DIR, file);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

function main() {
  const keys = collectRuKeys();
  const unique = new Set(keys);
  if (unique.size !== keys.length) {
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    console.warn(`Duplicate ru keys (${dupes.length}):`, [...new Set(dupes)]);
  }
  const orderedKeys = [...unique];
  if (orderedKeys.length < 143) {
    throw new Error(`Expected at least 143 unique keys, got ${orderedKeys.length}`);
  }
  for (const lang of Object.keys(LANG_FILES)) {
    const missing = orderedKeys.filter(k => !CURRICULUM_HINTS[lang][k]);
    if (missing.length) {
      throw new Error(`Missing ${lang} hints: ${missing.join(', ')}`);
    }
    const pathWritten = writeLangFile(lang, orderedKeys);
    console.log(`Wrote ${pathWritten} (${orderedKeys.length} entries)`);
  }
}

main();
