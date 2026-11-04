import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sanitizeInput,
  parseCommandLine,
  formatTerminalDate,
  executeTerminalCommand,
  MAX_COMMAND_LENGTH,
} from '../src/utils/terminalCommands.js';
import { allProjects } from '../src/data/projects.js';
import { techCategoriesData } from '../src/data/skills.js';
import { translations } from '../src/data/translations.js';
import { GITHUB_TOTAL_CONTRIBUTIONS } from '../src/data/githubContributions.js';

test('CONF-05C — Interactive Developer Terminal Test Suite', async (t) => {
  const getTranslator = (lang) => (key) => {
    const parts = key.split('.');
    let curr = translations[lang];
    for (const p of parts) {
      if (curr && typeof curr === 'object') {
        curr = curr[p];
      } else {
        return key;
      }
    }
    return typeof curr === 'string' ? curr : key;
  };

  const tId = getTranslator('id');
  const tEn = getTranslator('en');

  await t.test('1. Command Parsing & Input Sanitization', async (t2) => {
    await t2.test('sanitizes input and strips harmful HTML and control characters', () => {
      assert.equal(sanitizeInput('<script>alert("xss")</script>'), 'scriptalert(xss)/script');
      assert.equal(sanitizeInput('   hello world   '), 'hello world');
      assert.equal(sanitizeInput('cat & rm -rf <foo>'), 'cat  rm -rf foo');
      assert.equal(sanitizeInput(null), '');
      assert.equal(sanitizeInput(undefined), '');
      assert.equal(sanitizeInput(123), '');
    });

    await t2.test('enforces MAX_COMMAND_LENGTH limit (100 characters)', () => {
      const longInput = 'a'.repeat(150);
      const sanitized = sanitizeInput(longInput);
      assert.equal(sanitized.length, MAX_COMMAND_LENGTH);
    });

    await t2.test('parses command line tokens and extracts command and arguments', () => {
      const res1 = parseCommandLine('project akseskita');
      assert.equal(res1.command, 'project');
      assert.deepEqual(res1.args, ['akseskita']);
      assert.equal(res1.raw, 'project akseskita');

      const res2 = parseCommandLine('  OPEN   study-case   extraArg  ');
      assert.equal(res2.command, 'open');
      assert.deepEqual(res2.args, ['study-case', 'extraArg']);

      const resEmpty = parseCommandLine('    ');
      assert.equal(resEmpty.command, '');
      assert.deepEqual(resEmpty.args, []);
    });

    await t2.test('normalizes commands to lower case for case-insensitive execution', () => {
      assert.equal(parseCommandLine('HELP').command, 'help');
      assert.equal(parseCommandLine('PrOjEcTs').command, 'projects');
      assert.equal(parseCommandLine('WhOaMi').command, 'whoami');
    });
  });

  await t.test('2. Predefined Commands Execution & Verified Data Parity', async (t2) => {
    await t2.test('help: returns list of all available commands with descriptions', () => {
      const res = executeTerminalCommand('help', { language: 'en', t: tEn });
      assert.equal(res.type, 'help');
      assert.ok(Array.isArray(res.commands));
      assert.ok(res.commands.length >= 13, 'Should list at least 13 predefined commands');

      const cmdNames = res.commands.map((c) => c.cmd.split(' ')[0]);
      const expected = [
        'help',
        'about',
        'projects',
        'project',
        'skills',
        'experience',
        'education',
        'github',
        'contact',
        'whoami',
        'open',
        'date',
        'clear',
      ];
      for (const cmd of expected) {
        assert.ok(cmdNames.includes(cmd), `Help should include command: ${cmd}`);
      }
    });

    await t2.test('about: returns verified overview of Ghifari in both ID and EN', () => {
      const resEn = executeTerminalCommand('about', { language: 'en', t: tEn });
      assert.equal(resEn.type, 'about');
      assert.equal(resEn.name, 'M. Ghifari Bima Khadafi');
      assert.equal(resEn.role, 'Web Developer / Software Engineer');
      assert.ok(resEn.location.includes('Bogor'));
      assert.ok(resEn.focus.length >= 4);

      const resId = executeTerminalCommand('about', { language: 'id', t: tId });
      assert.equal(resId.type, 'about');
      assert.ok(resId.location.includes('Bogor'));
      assert.ok(resId.summary.includes('responsif'));
    });

    await t2.test('projects: lists all verified projects from dataset', () => {
      const res = executeTerminalCommand('projects', { language: 'en', t: tEn });
      assert.equal(res.type, 'projects');
      assert.equal(res.count, allProjects.length);
      assert.equal(res.projects.length, allProjects.length);

      const slugs = res.projects.map((p) => p.id);
      assert.ok(slugs.includes('akseskita'));
      assert.ok(slugs.includes('food-ecommerce'));
      assert.ok(slugs.includes('project-management'));
      assert.ok(slugs.includes('portfolio-ghifari'));
    });

    await t2.test('project <slug>: returns detailed architectural information for valid projects', () => {
      const res = executeTerminalCommand('project akseskita', { language: 'en', t: tEn });
      assert.equal(res.type, 'project-detail');
      assert.equal(res.slug, 'akseskita');
      assert.equal(res.title, 'AksesKita');
      assert.ok(res.problem.length > 0);
      assert.ok(res.solution.length > 0);
      assert.ok(res.technologies.includes('React'));
      assert.equal(res.isConfidential, false);

      // Internship project must show confidentiality flag and notice
      const resMgmt = executeTerminalCommand('project project-management', { language: 'id', t: tId });
      assert.equal(resMgmt.type, 'project-detail');
      assert.equal(resMgmt.slug, 'project-management');
      assert.equal(typeof resMgmt.isConfidential, 'boolean');
      assert.ok(resMgmt.github === null || typeof resMgmt.github === 'string');
      assert.equal(resMgmt.live, null);
      assert.ok(resMgmt.confidentialNotice.length > 0);
    });

    await t2.test('project without slug or with invalid slug returns clear helpful messages', () => {
      const resNoSlug = executeTerminalCommand('project', { language: 'en', t: tEn });
      assert.equal(resNoSlug.type, 'error');
      assert.ok(resNoSlug.message.includes('Usage: project <slug>'));
      assert.ok(Array.isArray(resNoSlug.availableSlugs));

      const resInvalid = executeTerminalCommand('project nonexistent-app', { language: 'en', t: tEn });
      assert.equal(resInvalid.type, 'error');
      assert.ok(resInvalid.message.includes('nonexistent-app'));
      assert.ok(Array.isArray(resInvalid.availableSlugs));
    });

    await t2.test('skills: returns structured engineering domains with project-verified skills', () => {
      const res = executeTerminalCommand('skills', { language: 'en', t: tEn });
      assert.equal(res.type, 'skills');
      assert.equal(res.categories.length, techCategoriesData.length);

      const categoryIds = res.categories.map((c) => c.id);
      assert.ok(categoryIds.includes('languages'));
      assert.ok(categoryIds.includes('frontend'));
      assert.ok(categoryIds.includes('backend'));
      assert.ok(categoryIds.includes('database'));
      assert.ok(categoryIds.includes('ai'));
      assert.ok(categoryIds.includes('devops'));
      assert.ok(categoryIds.includes('tools'));
    });

    await t2.test('experience: returns verified PT. AMA Salam Indonesia internship', () => {
      const res = executeTerminalCommand('experience', { language: 'en', t: tEn });
      assert.equal(res.type, 'experience');
      assert.ok(res.experiences.length > 0);

      const amaSalam = res.experiences.find((e) => e.id === 'ama-salam');
      assert.ok(amaSalam, 'Should find PT AMA Salam Indonesia entry');
      assert.equal(amaSalam.company, 'PT. AMA Salam Indonesia');
      assert.ok(amaSalam.role.includes('Frontend Developer Intern'));
      assert.ok(amaSalam.period.includes('2025'));
      assert.ok(amaSalam.responsibilities.length >= 4);
      assert.equal(amaSalam.projectRef, 'project-management');
    });

    await t2.test('education: returns verified Universitas Gunadarma and SMKN 1 Cibinong', () => {
      const res = executeTerminalCommand('education', { language: 'en', t: tEn });
      assert.equal(res.type, 'education');
      assert.equal(res.items.length, 2);

      const institutions = res.items.map((i) => i.institution);
      assert.ok(institutions.includes('Universitas Gunadarma'));
      assert.ok(institutions.includes('SMKN 1 Cibinong'));
    });

    await t2.test('github: returns verified username, URL, and activity statistics', () => {
      const res = executeTerminalCommand('github', { language: 'en', t: tEn });
      assert.equal(res.type, 'github');
      assert.equal(res.username, 'IGhifari');
      assert.equal(res.url, 'https://github.com/IGhifari');
      assert.equal(res.stats.contributions, GITHUB_TOTAL_CONTRIBUTIONS);
      assert.equal(res.stats.publicRepos, 22);
      assert.equal(res.stats.followers, 22);
      assert.equal(res.stats.following, 23);
    });

    await t2.test('contact: returns direct email and verified communication channels', () => {
      const res = executeTerminalCommand('contact', { language: 'en', t: tEn });
      assert.equal(res.type, 'contact');
      assert.equal(res.email, 'ighifarii05@gmail.com');
      assert.ok(Array.isArray(res.channels));

      const channelKeys = res.channels.map((c) => c.key);
      assert.ok(channelKeys.includes('github'));
      assert.ok(channelKeys.includes('linkedin'));
      assert.ok(channelKeys.includes('instagram'));
      assert.ok(channelKeys.includes('tiktok'));
    });

    await t2.test('whoami: returns safe guest explorer session metadata', () => {
      const res = executeTerminalCommand('whoami', { language: 'en', t: tEn });
      assert.equal(res.type, 'whoami');
      assert.equal(res.user, 'visitor@ighifari');
      assert.equal(res.host, 'https://www.ighifari.my.id');
    });

    await t2.test('date: returns formatted date string without error', () => {
      const res = executeTerminalCommand('date', { language: 'en', t: tEn });
      assert.equal(res.type, 'date');
      assert.ok(typeof res.timestamp === 'string');
      assert.ok(res.timestamp.length > 5);

      const formattedId = formatTerminalDate('id');
      assert.ok(typeof formattedId === 'string' && formattedId.length > 5);
    });

    await t2.test('clear: returns clear signal for terminal state reset', () => {
      const res = executeTerminalCommand('clear', { language: 'en', t: tEn });
      assert.equal(res.type, 'clear');
    });
  });

  await t.test('3. Navigation Handling (open <target>)', async (t2) => {
    await t2.test('open without arguments returns usage error', () => {
      const res = executeTerminalCommand('open', { language: 'en', t: tEn });
      assert.equal(res.type, 'error');
      assert.ok(res.message.includes('Usage: open <target>'));
    });

    await t2.test('open <section> triggers navigation callback to in-page anchor', () => {
      let navigatedUrl = null;
      let navigatedDest = null;

      const onNavigate = (url, dest) => {
        navigatedUrl = url;
        navigatedDest = dest;
      };

      const res = executeTerminalCommand('open projects', {
        language: 'en',
        t: tEn,
        onNavigate,
      });

      assert.equal(res.type, 'navigate');
      assert.equal(res.url, '#projects');
      assert.equal(res.mode, 'section');
      assert.equal(navigatedUrl, '#projects');
      assert.equal(navigatedDest.target, 'projects');
    });

    await t2.test('open study-case triggers navigation callback to /study-case route', () => {
      let navigatedUrl = null;

      const res = executeTerminalCommand('open study-case', {
        language: 'en',
        t: tEn,
        onNavigate: (url) => {
          navigatedUrl = url;
        },
      });

      assert.equal(res.type, 'navigate');
      assert.equal(res.url, '/study-case');
      assert.equal(res.mode, 'route');
      assert.equal(navigatedUrl, '/study-case');
    });

    await t2.test('open <project-slug> triggers navigation callback to /study-case/:slug', () => {
      let navigatedUrl = null;

      const res = executeTerminalCommand('open akseskita', {
        language: 'en',
        t: tEn,
        onNavigate: (url) => {
          navigatedUrl = url;
        },
      });

      assert.equal(res.type, 'navigate');
      assert.equal(res.url, '/study-case/akseskita');
      assert.equal(res.mode, 'route');
      assert.equal(navigatedUrl, '/study-case/akseskita');
    });

    await t2.test('open <invalid> returns friendly error with suggestions', () => {
      const res = executeTerminalCommand('open imaginary-destination', { language: 'en', t: tEn });
      assert.equal(res.type, 'error');
      assert.ok(res.message.includes('imaginary-destination'));
      assert.ok(res.message.includes('Valid targets'));
    });
  });

  await t.test('4. Security & Harmless Easter Eggs', async (t2) => {
    await t2.test('unknown command returns safe command-not-found message', () => {
      const res = executeTerminalCommand('foobar_cmd_unknown', { language: 'en', t: tEn });
      assert.equal(res.type, 'error');
      assert.ok(res.message.includes('foobar_cmd_unknown'));
      assert.ok(res.message.includes('help'));
    });

    await t2.test('playful developer commands (sudo, ls, pwd, cat) and exit return mock or exit responses safely', () => {
      assert.equal(executeTerminalCommand('sudo rm -rf /').type, 'easter-egg');
      assert.ok(executeTerminalCommand('sudo su').message.includes('sudoers'));

      assert.equal(executeTerminalCommand('ls').type, 'easter-egg');
      assert.equal(executeTerminalCommand('pwd').type, 'easter-egg');
      assert.equal(executeTerminalCommand('cat foo.txt').type, 'easter-egg');
      assert.equal(executeTerminalCommand('exit').type, 'exit');
    });

    await t2.test('empty or whitespace-only commands return empty result without throwing', () => {
      const res = executeTerminalCommand('   ', { language: 'en', t: tEn });
      assert.equal(res.type, 'empty');
    });
  });

  await t.test('5. Bilingual Translation Parity for Terminal', async (t2) => {
    await t2.test('translations dictionary contains terminal in both id and en', () => {
      assert.ok(translations.id.terminal, 'translations.id.terminal must exist');
      assert.ok(translations.en.terminal, 'translations.en.terminal must exist');
    });

    await t2.test('id and en terminal dictionaries share 100% identical keys', () => {
      const idKeys = Object.keys(translations.id.terminal).sort();
      const enKeys = Object.keys(translations.en.terminal).sort();

      assert.deepEqual(
        idKeys,
        enKeys,
        `Mismatched keys between id and en terminal dictionaries.\nID: ${JSON.stringify(idKeys)}\nEN: ${JSON.stringify(enKeys)}`
      );
    });

    await t2.test('all terminal translation keys are non-empty strings', () => {
      for (const [key, val] of Object.entries(translations.id.terminal)) {
        assert.ok(typeof val === 'string' && val.trim().length > 0, `ID key ${key} must be a non-empty string`);
      }
      for (const [key, val] of Object.entries(translations.en.terminal)) {
        assert.ok(typeof val === 'string' && val.trim().length > 0, `EN key ${key} must be a non-empty string`);
      }
    });
  });
});
