import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const SRC_ROOT = path.resolve('src');

/**
 * Explicitly documented cross-version feature components currently residing in
 * `src/components/` (kept at their existing paths to preserve legacy test paths
 * until a future `src/shared/components/` extraction).
 */
const ALLOWED_SHARED_COMPONENTS_FOR_V2 = new Set([
  'components/SeasonalEffects.jsx',
  'components/DeveloperTerminal.jsx',
  'components/IdKitPlayground.jsx',
]);

const SHARED_INFRA_DIRS = new Set([
  'context',
  'hooks',
  'data',
  'config',
  'utils',
  'services',
]);

const collectSourceFiles = (dir, out = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectSourceFiles(full, out);
    else if (/\.(js|jsx|mjs)$/.test(entry.name)) out.push(full);
  }
  return out;
};

const resolveLocalImport = (fromFile, spec) => {
  let base;
  if (spec.startsWith('@/')) base = path.join(SRC_ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null;

  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
};

const buildDependencyGraph = () => {
  const files = collectSourceFiles(SRC_ROOT);
  const importRegex =
    /(?:import|export)\s+(?:[^'"]*?from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
  const edges = [];
  const adjacency = new Map();

  for (const file of files) {
    const fromRel = path.relative(SRC_ROOT, file).replace(/\\/g, '/');
    const text = readFileSync(file, 'utf8');
    const deps = [];

    for (const match of text.matchAll(importRegex)) {
      const spec = match[1] || match[2];
      if (!spec || (!spec.startsWith('.') && !spec.startsWith('@/'))) continue;
      if (/\.(css|svg|png|jpg|jpeg|webp|glb|mp3|json)$/.test(spec)) continue;

      const resolved = resolveLocalImport(file, spec);
      if (!resolved) continue;
      const toRel = path.relative(SRC_ROOT, resolved).replace(/\\/g, '/');
      deps.push(toRel);
      edges.push({ from: fromRel, to: toRel, dynamic: Boolean(match[2]) });
    }
    adjacency.set(fromRel, deps);
  }

  return { files, edges, adjacency };
};

test('Phase 5 — V1 / V2 / Shared / Game Architectural Boundary Enforcement', async (t) => {
  const { edges, adjacency } = buildDependencyGraph();

  await t.test('1. V1 components (src/components/) must NEVER import from V2 (src/v2/)', () => {
    const violations = edges.filter(
      (e) => e.from.startsWith('components/') && e.to.startsWith('v2/')
    );
    assert.deepEqual(
      violations,
      [],
      `Found forbidden V1 -> V2 imports: ${JSON.stringify(violations)}`
    );
  });

  await t.test('2. V2 modules (src/v2/) must NEVER import V1-only components', () => {
    const violations = edges.filter(
      (e) =>
        e.from.startsWith('v2/') &&
        e.to.startsWith('components/') &&
        !ALLOWED_SHARED_COMPONENTS_FOR_V2.has(e.to)
    );
    assert.deepEqual(
      violations,
      [],
      `Found forbidden V2 -> V1-only imports: ${JSON.stringify(violations)}`
    );
  });

  await t.test('3. Shared infrastructure (context, hooks, data, config, utils, services) must NEVER import V1, V2, or Game modules', () => {
    const violations = edges.filter((e) => {
      const fromTop = e.from.split('/')[0];
      if (!SHARED_INFRA_DIRS.has(fromTop)) return false;
      return (
        e.to.startsWith('components/') ||
        e.to.startsWith('v2/') ||
        e.to.startsWith('game/')
      );
    });
    assert.deepEqual(
      violations,
      [],
      `Found forbidden Shared -> V1/V2/Game imports: ${JSON.stringify(violations)}`
    );
  });

  await t.test('4. Game modules (src/game/) must remain isolated from V1 and V2', () => {
    const violations = edges.filter(
      (e) =>
        e.from.startsWith('game/') &&
        (e.to.startsWith('components/') || e.to.startsWith('v2/'))
    );
    assert.deepEqual(
      violations,
      [],
      `Found forbidden Game -> V1/V2 imports: ${JSON.stringify(violations)}`
    );
  });

  await t.test('5. Entire src/ module graph has zero circular dependencies', () => {
    const visited = new Set();
    const inStack = new Set();
    const stack = [];
    const cycles = [];

    const dfs = (node) => {
      visited.add(node);
      inStack.add(node);
      stack.push(node);
      for (const next of adjacency.get(node) || []) {
        if (!visited.has(next)) {
          dfs(next);
        } else if (inStack.has(next)) {
          const idx = stack.indexOf(next);
          cycles.push(stack.slice(idx).concat(next));
        }
      }
      stack.pop();
      inStack.delete(node);
    };

    for (const node of adjacency.keys()) {
      if (!visited.has(node)) dfs(node);
    }

    assert.deepEqual(
      cycles,
      [],
      `Detected circular dependencies in src/: ${JSON.stringify(cycles)}`
    );
  });

  await t.test('6. App.jsx mounts single top-level provider tree and renders PortfolioSwitcher for both V1 and V2', () => {
    const appSource = readFileSync(path.join(SRC_ROOT, 'App.jsx'), 'utf8');
    assert.equal(
      (appSource.match(/<ThemeProvider/g) || []).length,
      1,
      'App.jsx must mount exactly one ThemeProvider'
    );
    assert.equal(
      (appSource.match(/<LanguageProvider/g) || []).length,
      1,
      'App.jsx must mount exactly one LanguageProvider'
    );
    assert.equal(
      (appSource.match(/<RouterProvider/g) || []).length,
      1,
      'App.jsx must mount exactly one RouterProvider'
    );
    assert.equal(
      (appSource.match(/<PortfolioSwitcher/g) || []).length,
      2,
      'App.jsx must render PortfolioSwitcher in both V1 and V2 views'
    );
  });
});
