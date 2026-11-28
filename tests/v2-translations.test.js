import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { translations } from '../src/data/translations.js';
import { allProjects } from '../src/data/projects.js';
import { experiences } from '../src/data/experience.js';
import { techCategoriesData } from '../src/data/skills.js';

const getByKeyPath = (obj, keyPath) => {
  return keyPath.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj);
};

const assertParityAndNonEmpty = (idNode, enNode, currentPath) => {
  assert.equal(
    typeof idNode,
    typeof enNode,
    `Type mismatch at "${currentPath}": id=${typeof idNode}, en=${typeof enNode}`
  );

  if (Array.isArray(idNode) || Array.isArray(enNode)) {
    assert.ok(Array.isArray(idNode) && Array.isArray(enNode), `Array mismatch at "${currentPath}"`);
    assert.equal(
      idNode.length,
      enNode.length,
      `Array length mismatch at "${currentPath}": id=${idNode.length}, en=${enNode.length}`
    );
    assert.ok(idNode.length > 0, `Array at "${currentPath}" must not be empty`);
    for (let i = 0; i < idNode.length; i += 1) {
      assertParityAndNonEmpty(idNode[i], enNode[i], `${currentPath}[${i}]`);
    }
    return;
  }

  if (idNode && typeof idNode === 'object') {
    const idKeys = Object.keys(idNode).sort();
    const enKeys = Object.keys(enNode).sort();
    assert.deepEqual(idKeys, enKeys, `Key mismatch at "${currentPath}"`);
    for (const k of idKeys) {
      assertParityAndNonEmpty(idNode[k], enNode[k], `${currentPath}.${k}`);
    }
    return;
  }

  if (typeof idNode === 'string') {
    assert.ok(idNode.trim().length > 0, `Empty Indonesian translation at "${currentPath}"`);
    assert.ok(enNode.trim().length > 0, `Empty English translation at "${currentPath}"`);
  }
};

const collectFiles = (dir, out = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, out);
    else if (/\.(js|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
};

test('Phase 4 — V2 Bilingual Translation Architecture & Completeness Suite', async (t) => {
  await t.test('1. Indonesian and English v2 namespaces have exact key parity and zero empty values', () => {
    assert.ok(translations.id?.v2, 'translations.id.v2 must exist');
    assert.ok(translations.en?.v2, 'translations.en.v2 must exist');
    assertParityAndNonEmpty(translations.id.v2, translations.en.v2, 'v2');
  });

  await t.test('2. Required V2 translation namespaces, counts, and interpolation placeholders exist', () => {
    const requiredSections = [
      'common',
      'theme',
      'opening',
      'hero',
      'about',
      'work',
      'metrics',
      'highlight',
      'capabilities',
      'stack',
      'process',
      'github',
      'certificates',
      'faq',
      'insights',
      'contact',
      'chat',
      'works',
      'workDetail',
    ];

    for (const section of requiredSections) {
      assert.ok(translations.id.v2[section], `Missing translations.id.v2.${section}`);
      assert.ok(translations.en.v2[section], `Missing translations.en.v2.${section}`);
    }

    for (const lang of ['id', 'en']) {
      const v2 = translations[lang].v2;
      assert.equal(v2.hero.headlineLines.length, 4, `v2.hero.headlineLines must have 4 lines (${lang})`);
      assert.equal(v2.capabilities.items.length, 4, `v2.capabilities.items must have 4 items (${lang})`);
      assert.equal(v2.faq.items.length, 4, `v2.faq.items must have 4 items (${lang})`);
      assert.equal(v2.opening.captions.length, 3, `v2.opening.captions must have 3 captions (${lang})`);
      assert.equal(v2.contact.subjectPresets.length, 3, `v2.contact.subjectPresets must have 3 presets (${lang})`);

      // Interpolation placeholder parity
      assert.ok(v2.theme.seasonBadgeAria.includes('{season}'), `seasonBadgeAria missing {season} (${lang})`);
      assert.ok(v2.github.activeDays.includes('{count}'), `activeDays missing {count} (${lang})`);
      assert.ok(v2.github.longestStreak.includes('{count}'), `longestStreak missing {count} (${lang})`);
      assert.ok(v2.github.following.includes('{count}'), `following missing {count} (${lang})`);
      assert.ok(
        v2.github.heatmapAria.includes('{username}') && v2.github.heatmapAria.includes('{total}'),
        `heatmapAria missing placeholders (${lang})`
      );
      assert.ok(v2.workDetail.notFoundDesc.includes('{slug}'), `notFoundDesc missing {slug} (${lang})`);

      // Every tech stack category ID has a localized V2 domain label
      for (const category of techCategoriesData) {
        assert.ok(
          typeof v2.stack.domains[category.id] === 'string' &&
            v2.stack.domains[category.id].trim().length > 0,
          `Missing v2.stack.domains.${category.id} (${lang})`
        );
      }
    }
  });

  await t.test('3. Existing V1 translation namespaces remain intact and unchanged', () => {
    const v1Namespaces = [
      'nav',
      'hero',
      'projects',
      'about',
      'experience',
      'stack',
      'github',
      'certificates',
      'education',
      'contact',
      'footer',
      'sound',
      'chatbot',
      'caseStudies',
      'terminal',
      'recruiter',
      'game',
    ];

    for (const ns of v1Namespaces) {
      assert.ok(translations.id[ns], `V1 namespace translations.id.${ns} must remain intact`);
      assert.ok(translations.en[ns], `V1 namespace translations.en.${ns} must remain intact`);
    }
  });

  await t.test('4. Dynamic project and experience data remain valid in both Indonesian and English', () => {
    for (const project of allProjects) {
      assert.ok(project.description?.id?.trim(), `Project ${project.id} missing description.id`);
      assert.ok(project.description?.en?.trim(), `Project ${project.id} missing description.en`);
      assert.ok(project.category?.id?.trim(), `Project ${project.id} missing category.id`);
      assert.ok(project.category?.en?.trim(), `Project ${project.id} missing category.en`);
    }

    for (const exp of experiences) {
      assert.ok(exp.role?.id?.trim() && exp.role?.en?.trim(), 'Experience role must be bilingual');
      assert.ok(exp.period?.id?.trim() && exp.period?.en?.trim(), 'Experience period must be bilingual');
      assert.ok(
        exp.description?.id?.trim() && exp.description?.en?.trim(),
        'Experience description must be bilingual'
      );
    }
  });

  await t.test('5. Every static t(...) key referenced across src/v2 resolves in both id and en', () => {
    const v2Files = collectFiles(path.resolve('src/v2'));
    const keyRegex = /\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;
    const referencedKeys = new Set();

    for (const file of v2Files) {
      const content = readFileSync(file, 'utf8');
      for (const match of content.matchAll(keyRegex)) {
        referencedKeys.add(match[1]);
      }
    }

    assert.ok(referencedKeys.size >= 80, `Expected >= 80 V2 translation keys, found ${referencedKeys.size}`);

    for (const keyPath of referencedKeys) {
      const idVal = getByKeyPath(translations.id, keyPath);
      const enVal = getByKeyPath(translations.en, keyPath);
      assert.notEqual(idVal, undefined, `Referenced key "${keyPath}" missing in translations.id`);
      assert.notEqual(enVal, undefined, `Referenced key "${keyPath}" missing in translations.en`);
    }
  });

  await t.test('6. Missing translation key lookup degrades safely without throwing', () => {
    const missing = getByKeyPath(translations.en, 'v2.nonexistent.key');
    assert.equal(missing, undefined);
    const fallback = missing ?? 'v2.nonexistent.key';
    assert.equal(fallback, 'v2.nonexistent.key');
  });
});
