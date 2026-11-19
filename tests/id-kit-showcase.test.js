import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { allProjects, selectedProjects, getProjectBySlug } from '../src/data/projects.js';
import { translations } from '../src/data/translations.js';
import { getAvailableCategories, matchesCategory } from '../src/utils/projectExplorer.js';
import {
  evaluateFormatSample,
  evaluateNikSample,
  evaluatePhoneSample,
  evaluateLiburSample,
  evaluateWilayahSample,
} from '../src/utils/idKitPlaygroundHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('@ghifari29/id-kit Portfolio Integration & Playground', () => {
  it('1. Registers @ghifari29/id-kit in selectedProjects with complete metadata and asset', () => {
    const idKit = getProjectBySlug('id-kit');
    assert.ok(idKit, 'id-kit project must resolve via getProjectBySlug');
    assert.ok(selectedProjects.some((p) => p.id === 'id-kit'), 'id-kit must be in selectedProjects');
    assert.equal(idKit.title, '@ghifari29/id-kit');
    assert.equal(idKit.categoryKey, 'library');
    assert.equal(idKit.github, 'https://github.com/IGhifari/id-kit');
    assert.equal(idKit.npm, 'https://www.npmjs.com/package/@ghifari29/id-kit');
    assert.deepEqual(idKit.tags, ['TypeScript', 'tsup', 'Vitest', 'GitHub Actions', 'npm']);

    // Verify all 9 modules appear in features
    const idFeatures = idKit.details?.features?.id || [];
    const enFeatures = idKit.details?.features?.en || [];
    assert.equal(idFeatures.length, 9);
    assert.equal(enFeatures.length, 9);

    // Verify preview image exists
    const imgPath = path.join(rootDir, 'public', idKit.image.replace(/^\//, ''));
    assert.ok(fs.existsSync(imgPath), `Preview image must exist at ${imgPath}`);
  });

  it('2. Supports "library" category filtering & bilingual translation keys', () => {
    const categories = getAvailableCategories(allProjects);
    assert.ok(categories.includes('library'));

    const libraries = allProjects.filter((p) => matchesCategory(p, 'library'));
    assert.equal(libraries.length, 1);
    assert.equal(libraries[0].id, 'id-kit');

    assert.equal(translations.id.projects.categories.library, 'LIBRARY');
    assert.equal(translations.en.projects.categories.library, 'LIBRARY');
    assert.equal(translations.id.caseStudies.filterLibrary, 'LIBRARY');
    assert.equal(translations.en.caseStudies.filterLibrary, 'LIBRARY');
    assert.ok(translations.id.projects.npmPackage);
    assert.ok(translations.en.projects.npmPackage);
    assert.ok(translations.id.caseStudies.npmAction);
    assert.ok(translations.en.caseStudies.npmAction);
  });

  it('3. Includes /study-case/id-kit in public/sitemap.xml and index.html noscript', () => {
    const sitemap = fs.readFileSync(path.join(rootDir, 'public', 'sitemap.xml'), 'utf-8');
    assert.ok(sitemap.includes('<loc>https://www.ighifari.my.id/study-case/id-kit</loc>'));

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
    assert.ok(indexHtml.includes('/study-case/id-kit'));
    assert.ok(indexHtml.includes('https://www.npmjs.com/package/@ghifari29/id-kit'));
  });

  it('4. Evaluates playground format, NIK, phone, libur, and wilayah samples accurately', () => {
    const fmt = evaluateFormatSample('1250000', 'Rp1.250.000,-');
    assert.equal(fmt.numberValid, true);
    assert.equal(fmt.formattedRupiah, 'Rp1.250.000');
    assert.equal(fmt.shortRupiah, 'Rp1,3 jt');
    assert.equal(fmt.terbilangText, 'satu juta dua ratus lima puluh ribu rupiah');
    assert.equal(fmt.parsedRupiah, 1250000);

    const nik = evaluateNikSample('3171011505900001');
    assert.equal(nik.parsed.valid, true);
    assert.equal(nik.parsed.provinsi, 'DKI Jakarta');
    assert.equal(nik.parsed.gender, 'L');
    assert.equal(nik.masked, '3171********0001');

    const phone = evaluatePhoneSample('0812-3456-789');
    assert.equal(phone.normalized, '+628123456789');
    assert.equal(phone.operatorResult.valid, true);
    assert.equal(phone.operatorResult.operator, 'Telkomsel');

    const libur = evaluateLiburSample('2026-08-14', '2026-08-18', '2026-08-17');
    assert.equal(libur.liburResult.status, 'libur-nasional');
    assert.equal(libur.liburResult.nama, 'Proklamasi Kemerdekaan');
    assert.equal(libur.hariKerjaResult.valid, true);
    assert.equal(libur.hariKerjaResult.hariKerja, 2);
    assert.equal(libur.hariKerjaResult.totalHari, 5);

    const wilayah = evaluateWilayahSample('sorong');
    assert.equal(wilayah.results.length, 3);
    assert.ok(wilayah.results.some((r) => r.nama === 'Kota Sorong' && r.kode === '96.71'));
  });

  it('5. Handles invalid or malformed playground inputs safely without throwing', () => {
    const badFmt = evaluateFormatSample('abc', '1.50');
    assert.equal(badFmt.numberValid, false);
    assert.ok(badFmt.formatError);
    assert.equal(badFmt.parsedRupiah, null);

    const badLibur = evaluateLiburSample('invalid-date', '2026-08-18', 'bad-date');
    assert.ok(badLibur.liburError);
    assert.ok(badLibur.hariKerjaError);
  });
});
