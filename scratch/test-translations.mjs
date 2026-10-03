import { translations } from '../src/data/translations.js';
import { projects } from '../src/data/projects.js';

console.log("=== TRANSLATIONS INTEGRITY TEST ===");

function compareKeys(obj1, obj2, path = "") {
  let errors = [];
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  for (const k of keys1) {
    const curPath = path ? `${path}.${k}` : k;
    if (!(k in obj2)) {
      errors.push(`Missing key in target: ${curPath}`);
    } else if (typeof obj1[k] === 'object' && obj1[k] !== null && !Array.isArray(obj1[k])) {
      if (typeof obj2[k] !== 'object' || obj2[k] === null) {
        errors.push(`Type mismatch at ${curPath}`);
      } else {
        errors.push(...compareKeys(obj1[k], obj2[k], curPath));
      }
    }
  }
  return errors;
}

const idMissingInEn = compareKeys(translations.id, translations.en, "en");
const enMissingInId = compareKeys(translations.en, translations.id, "id");

console.log(`Checking ID vs EN keys...`);
if (idMissingInEn.length === 0 && enMissingInId.length === 0) {
  console.log("✓ All translation keys are symmetrically defined across both 'id' and 'en'!");
} else {
  console.error("Mismatch in keys:", { idMissingInEn, enMissingInId });
  process.exit(1);
}

console.log("\n=== PROJECT DATA TEST ===");
let projectErrors = 0;
for (const p of projects) {
  if (!p.description || typeof p.description !== 'object' || !p.description.id || !p.description.en) {
    console.error(`Project ${p.title} missing bilingual description:`, p.description);
    projectErrors++;
  }
}

if (projectErrors === 0) {
  console.log(`✓ All ${projects.length} projects have bilingual 'id' and 'en' descriptions!`);
} else {
  process.exit(1);
}

// Test Class 1IA08 specifically
const c1 = projects.find(p => p.title.includes("Class 1IA08"));
if (!c1) {
  console.error("Class 1IA08 project not found!");
  process.exit(1);
}
console.log("\nClass 1IA08 verification:");
console.log("ID:", c1.description.id);
console.log("EN:", c1.description.en);

const expectedId = "Website informasi kelas untuk mengelola dan menampilkan pengumuman, tugas, mata kuliah, serta informasi akademik Class 1IA08.";
const expectedEn = "A class information website for managing and displaying announcements, assignments, courses, and academic information for Class 1IA08.";

if (c1.description.id === expectedId && c1.description.en === expectedEn) {
  console.log("✓ Class 1IA08 matches exact user requested copy!");
} else {
  console.error("Class 1IA08 copy differs!");
  process.exit(1);
}

console.log("\n=== ALL TRANSLATION INTEGRITY TESTS PASSED! ===");
