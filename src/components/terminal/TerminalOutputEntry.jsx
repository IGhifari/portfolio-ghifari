import PropTypes from 'prop-types';
import {
  FiExternalLink,
  FiCheck,
  FiCopy,
  FiCode,
  FiUser,
  FiBriefcase,
  FiBookOpen,
  FiMail,
  FiCompass,
} from 'react-icons/fi';

import { siteConfig } from '@/config/site';

/**
 * Renders a single structured output entry inside the Developer Terminal log.
 */
export default function TerminalOutputEntry({
  entry,
  language,
  t,
  opensNewTabLabel,
  githubData,
  copiedKey,
  onRunCommand,
  onCopyToClipboard,
}) {
  return (
    <div className="space-y-2">
      {/* Echo prompt for command execution matching Image 2 (→ ~ cmd) */}
      {entry.rawInput && (
        <div className="flex items-center gap-2 font-mono pt-1 text-xs sm:text-sm">
          <span className="text-[#ff5f56] font-bold">→</span>
          <span className="text-[var(--accent)] font-semibold">~</span>
          <span className="text-[var(--terminal-text)] font-normal ml-0.5">{entry.rawInput}</span>
        </div>
      )}

      {/* Welcome Banner matching Image 2 */}
      {entry.type === 'welcome' && (
        <div className="space-y-1 py-1 text-xs sm:text-sm font-mono text-[var(--terminal-muted)]">
          <div className="font-semibold text-[var(--terminal-text)]">
            Welcome to {siteConfig.terminal.osName} {siteConfig.terminal.version}
          </div>
          <div className="text-[var(--terminal-muted)]">
            {language === 'id'
              ? "Ketik 'help' untuk melihat daftar perintah."
              : "Type 'help' for a list of commands."}
          </div>
        </div>
      )}

      {entry.type === 'system' && (
        <div className="text-xs text-[var(--text-muted)] italic py-1 font-mono">
          {`# ${entry.message}`}
        </div>
      )}

      {entry.type === 'help' && (
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
            {`// ${language === 'id' ? 'Daftar Perintah Tersedia' : 'Available Commands'}`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {entry.commands.map((c) => (
              <button
                key={c.cmd}
                type="button"
                onClick={() => onRunCommand(c.cmd.split(' ')[0])}
                className="flex items-start gap-2.5 p-2 rounded bg-[var(--terminal-surface)]/70 hover:bg-[var(--surface-hover)] border border-[var(--terminal-border)] hover:border-[var(--accent)] text-left transition-colors group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              >
                <span className="font-bold text-[var(--accent)] group-hover:underline shrink-0">
                  {c.cmd}
                </span>
                <span className="text-[var(--text-secondary)] text-[11px] leading-tight">
                  {c.desc}
                </span>
              </button>
            ))}
          </div>
          {entry.note && (
            <div className="text-[11px] text-[var(--text-muted)] pt-1">
              {entry.note}
            </div>
          )}
        </div>
      )}

      {entry.type === 'about' && (
        <div className="p-3.5 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-[var(--terminal-text)] font-bold text-sm">
            <FiUser className="text-[var(--accent)]" aria-hidden="true" />
            <span>{entry.name}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[var(--text-muted)]">{language === 'id' ? 'Peran:' : 'Role:'} </span>
              <span className="text-[var(--accent)] font-semibold">{entry.role}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{language === 'id' ? 'Lokasi:' : 'Location:'} </span>
              <span className="text-[var(--terminal-text)]">{entry.location}</span>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
            {entry.summary}
          </p>
          <div className="pt-2 border-t border-[var(--terminal-border)] space-y-1">
            <div className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
              {language === 'id' ? 'Fokus Keahlian:' : 'Core Engineering Focus:'}
            </div>
            <ul className="list-disc list-inside text-[11px] text-[var(--text-secondary)] space-y-0.5">
              {entry.focus.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {entry.type === 'projects' && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--accent)] uppercase tracking-wider">
              {`// ${language === 'id' ? 'Proyek Terverifikasi' : 'Verified Projects'} (${entry.count})`}
            </span>
            <button
              type="button"
              onClick={() => onRunCommand('open study-case')}
              className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)] underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <span>{t('terminal.viewCaseStudyCta')}</span>
              <FiExternalLink size={10} aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {entry.projects.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-2 hover:border-[var(--terminal-border)] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onRunCommand(`project ${p.id}`)}
                    className="font-bold text-[var(--terminal-text)] hover:text-[var(--accent)] transition-colors text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  >
                    {p.title}
                  </button>
                  <span className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] text-[10px] text-[var(--accent)] font-mono shrink-0">
                    {p.id}
                  </span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  {p.category}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {p.summary}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {p.tags.map((tTag) => (
                    <span
                      key={tTag}
                      className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] text-[var(--terminal-muted)] text-[10px]"
                    >
                      {tTag}
                    </span>
                  ))}
                </div>
                <div className="pt-1 flex items-center gap-3 text-[10px]">
                  <button
                    type="button"
                    onClick={() => onRunCommand(`project ${p.id}`)}
                    className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  >
                    <span>project {p.id}</span>
                  </button>
                  <span className="text-neutral-700">|</span>
                  <button
                    type="button"
                    onClick={() => onRunCommand(`open ${p.id}`)}
                    className="text-[var(--terminal-muted)] hover:text-[var(--terminal-text)] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  >
                    <span>open {p.id}</span>
                    <FiCompass size={10} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] pt-1 italic">
            {entry.tip}
          </div>
        </div>
      )}

      {entry.type === 'project-detail' && (
        <div className="p-4 rounded-xl bg-white/[0.025] border border-[var(--terminal-border)] space-y-3 text-xs">
          <div className="flex items-start justify-between gap-3 pb-2 border-b border-[var(--terminal-border)]">
            <div>
              <div className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">
                {entry.category}
              </div>
              <h3 className="text-base font-bold text-[var(--terminal-text)] mt-0.5">
                {entry.title}
              </h3>
              {entry.subtitle && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {entry.subtitle}
                </p>
              )}
            </div>
            <span className="px-2 py-0.5 rounded bg-[var(--terminal-surface)] text-[11px] text-[var(--accent)] font-mono shrink-0">
              slug: {entry.slug}
            </span>
          </div>

          {entry.description && (
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
              {entry.description}
            </p>
          )}

          <div className="space-y-2 text-xs">
            {entry.problem && (
              <div>
                <span className="text-[var(--accent)] font-bold">{language === 'id' ? 'Tantangan: ' : 'Problem: '}</span>
                <span className="text-[var(--text-secondary)]">{entry.problem}</span>
              </div>
            )}
            {entry.solution && (
              <div>
                <span className="text-emerald-400 font-bold">{language === 'id' ? 'Solusi: ' : 'Solution: '}</span>
                <span className="text-[var(--text-secondary)]">{entry.solution}</span>
              </div>
            )}
            {entry.architecture && (
              <div>
                <span className="text-cyan-400 font-bold">{language === 'id' ? 'Arsitektur: ' : 'Architecture: '}</span>
                <span className="text-[var(--text-secondary)]">{entry.architecture}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {entry.technologies.map((tTag) => (
              <span
                key={tTag}
                className="px-2 py-0.5 rounded bg-[var(--terminal-surface)] text-[var(--terminal-muted)] text-[10px] border border-[var(--terminal-border)]"
              >
                {tTag}
              </span>
            ))}
          </div>

          {entry.isConfidential ? (
            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
              ⚠ {entry.confidentialNotice}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              {entry.github && (
                <a
                  href={entry.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  <FiCode size={12} aria-hidden="true" />
                  <span>GitHub</span>
                  <FiExternalLink size={10} aria-hidden="true" />
                  <span className="sr-only"> ({opensNewTabLabel})</span>
                </a>
              )}
              {entry.live && (
                <a
                  href={entry.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                >
                  <FiExternalLink size={12} aria-hidden="true" />
                  <span>Live Demo</span>
                  <span className="sr-only"> ({opensNewTabLabel})</span>
                </a>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-[var(--terminal-border)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-muted)] italic">{entry.openPrompt}</span>
            <button
              type="button"
              onClick={() => onRunCommand(`open ${entry.slug}`)}
              className="px-2 py-1 rounded bg-[var(--terminal-surface)] hover:bg-[var(--surface-hover)] border border-[var(--terminal-border)] text-[var(--accent)] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <span>{t('terminal.viewCaseStudyCta')}</span>
              <FiCompass size={11} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {entry.type === 'skills' && (
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
            {`// ${language === 'id' ? 'Kategori Keahlian Teknik' : 'Technical Engineering Skills'}`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            {entry.categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[var(--terminal-text)] uppercase tracking-wider">
                    {cat.title}
                  </span>
                  <span className="text-[var(--accent)] font-mono text-[10px]">
                    {cat.badge}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                  {cat.description}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {cat.skills.map((skillName) => (
                    <span
                      key={skillName}
                      className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] text-[var(--terminal-muted)] text-[10px] border border-[var(--terminal-border)] font-mono"
                    >
                      {skillName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {entry.note && (
            <div className="text-[11px] text-[var(--text-muted)] italic pt-1">
              {entry.note}
            </div>
          )}
        </div>
      )}

      {entry.type === 'experience' && (
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
            {`// ${language === 'id' ? 'Pengalaman Kerja Terverifikasi' : 'Verified Work Experience'}`}
          </div>
          {entry.experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-4 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[var(--terminal-border)]">
                <div>
                  <div className="text-sm font-bold text-[var(--terminal-text)] flex items-center gap-2">
                    <FiBriefcase className="text-[var(--accent)]" aria-hidden="true" />
                    <span>{exp.role}</span>
                  </div>
                  <div className="text-xs text-[var(--accent)] font-semibold mt-0.5">
                    {exp.company}
                  </div>
                </div>
                <div className="text-right sm:text-right font-mono text-[11px] text-[var(--text-muted)]">
                  <div>{exp.period}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    {exp.location} · {exp.type}
                  </div>
                </div>
              </div>

              <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                {exp.description}
              </p>

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  {language === 'id'
                    ? 'Tanggung Jawab & Kontribusi Terverifikasi:'
                    : 'Verified Responsibilities & Contributions:'}
                </div>
                <ul className="list-disc list-inside text-[11px] text-[var(--text-secondary)] space-y-1 leading-relaxed">
                  {exp.responsibilities.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {exp.technologies.map((tTag) => (
                  <span
                    key={tTag}
                    className="px-2 py-0.5 rounded bg-[var(--terminal-surface)] text-[var(--terminal-muted)] text-[10px] border border-[var(--terminal-border)]"
                  >
                    {tTag}
                  </span>
                ))}
              </div>

              {exp.projectRef && (
                <div className="pt-2 border-t border-[var(--terminal-border)] flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-muted)]">
                    {language === 'id'
                      ? 'Proyek terkait: Project Management System'
                      : 'Related project: Project Management System'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRunCommand(`project ${exp.projectRef}`)}
                    className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  >
                    <span>project {exp.projectRef}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {entry.type === 'education' && (
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
            {`// ${language === 'id' ? 'Riwayat Pendidikan Formal' : 'Formal Academic History'}`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {entry.items.map((item) => (
              <div
                key={item.institution}
                className="p-3.5 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--terminal-text)] text-xs flex items-center gap-1.5">
                    <FiBookOpen className="text-[var(--accent)]" aria-hidden="true" />
                    <span>{item.institution}</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] text-[10px] text-[var(--accent)] font-mono">
                    {item.status}
                  </span>
                </div>
                <div className="text-xs text-[var(--accent)] font-semibold">
                  {item.major}
                </div>
                {item.faculty && (
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {item.faculty}
                  </div>
                )}
                <div className="text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--terminal-border)] flex items-center justify-between">
                  <span>{item.degree}</span>
                  <span>{item.period}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.type === 'github' && (
        <div className="p-4 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--terminal-border)]">
            <div className="flex items-center gap-2 text-[var(--terminal-text)] font-bold text-sm">
              <FiCode className="text-emerald-400" size={15} aria-hidden="true" />
              <span>{entry.username}</span>
            </div>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-md bg-[var(--terminal-surface)] hover:bg-[var(--surface-hover)] border border-[var(--terminal-border)] text-[var(--terminal-muted)] hover:text-[var(--terminal-text)] inline-flex items-center gap-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
            >
              <span>{entry.actionLabel}</span>
              <FiExternalLink size={11} aria-hidden="true" />
              <span className="sr-only"> ({opensNewTabLabel})</span>
            </a>
          </div>

          <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
            {language === 'id'
              ? `${githubData?.contributions?.total ?? entry.stats.contributions} kontribusi dalam 1 tahun terakhir, ${githubData?.profile?.publicRepos ?? entry.stats.publicRepos} repositori publik.`
              : `${githubData?.contributions?.total ?? entry.stats.contributions} annual contributions across ${githubData?.profile?.publicRepos ?? entry.stats.publicRepos} verified public repositories.`}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
            <div className="p-2 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)]">
              <div className="text-sm font-bold text-emerald-400">
                {githubData?.contributions?.total ?? entry.stats.contributions}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                {language === 'id' ? 'Kontribusi' : 'Contributions'}
              </div>
            </div>
            <div className="p-2 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)]">
              <div className="text-sm font-bold text-[var(--terminal-text)]">
                {githubData?.profile?.publicRepos ?? entry.stats.publicRepos}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                {language === 'id' ? 'Repositori' : 'Public Repos'}
              </div>
            </div>
            <div className="p-2 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)]">
              <div className="text-sm font-bold text-[var(--terminal-text)]">
                {githubData?.profile?.followers ?? entry.stats.followers}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                {language === 'id' ? 'Pengikut' : 'Followers'}
              </div>
            </div>
            <div className="p-2 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)]">
              <div className="text-sm font-bold text-[var(--terminal-text)]">
                {githubData?.profile?.following ?? entry.stats.following}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                {language === 'id' ? 'Mengikuti' : 'Following'}
              </div>
            </div>
          </div>
        </div>
      )}

      {entry.type === 'contact' && (
        <div className="p-4 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--terminal-border)]">
            <span className="font-bold text-[var(--terminal-text)] text-xs uppercase tracking-wider">
              {`// ${language === 'id' ? 'Saluran Kontak Resmi' : 'Verified Contact Channels'}`}
            </span>
            <button
              type="button"
              onClick={() => onCopyToClipboard(entry.email, 'email')}
              className="px-2 py-0.5 rounded bg-[var(--terminal-surface)] text-[10px] text-[var(--accent)] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              {copiedKey === 'email' ? (
                <>
                  <FiCheck size={10} aria-hidden="true" />
                  <span>{t('terminal.copiedCta')}</span>
                </>
              ) : (
                <>
                  <FiCopy size={10} aria-hidden="true" />
                  <span>
                    {t('terminal.copyCta')} {entry.email}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={`mailto:${entry.email}`}
              className="p-2 rounded bg-[var(--terminal-surface)] hover:bg-[var(--terminal-surface)] border border-[var(--terminal-border)] text-[11px] flex items-center justify-between text-[var(--terminal-text)] hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <span className="flex items-center gap-2">
                <FiMail className="text-[var(--accent)]" aria-hidden="true" />
                <span>{t('terminal.directEmail')}</span>
              </span>
              <span className="text-[var(--text-muted)] text-[10px]">{entry.email}</span>
            </a>

            {entry.channels.map((ch) => (
              <a
                key={ch.key}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded bg-[var(--terminal-surface)] hover:bg-[var(--terminal-surface)] border border-[var(--terminal-border)] text-[11px] flex items-center justify-between text-[var(--terminal-text)] hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              >
                <span className="font-semibold">{ch.name}</span>
                <span className="text-[var(--text-muted)] text-[10px] flex items-center gap-1">
                  <span>{ch.handle}</span>
                  <FiExternalLink size={9} aria-hidden="true" />
                </span>
                <span className="sr-only"> ({opensNewTabLabel})</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {entry.type === 'whoami' && (
        <div className="p-3.5 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-1.5 text-xs font-mono">
          <div className="flex items-center gap-2 text-[var(--accent)] font-bold">
            <FiUser size={13} aria-hidden="true" />
            <span>{entry.user}</span>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">
            <span className="text-[var(--text-muted)]">{language === 'id' ? 'Peran: ' : 'Role: '}</span>
            <span className="text-[var(--terminal-text)] font-semibold">{entry.role}</span>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">
            <span className="text-[var(--text-muted)]">{language === 'id' ? 'Sesi: ' : 'Session: '}</span>
            <span>{entry.session}</span>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">
            <span className="text-[var(--text-muted)]">{language === 'id' ? 'Host: ' : 'Host: '}</span>
            <span className="text-[var(--accent)]">{entry.host}</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--terminal-border)]">
            {entry.shell}
          </div>
        </div>
      )}

      {entry.type === 'date' && (
        <div className="p-2.5 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)] text-xs font-mono text-[var(--accent)] flex items-center gap-2">
          <span className="text-[var(--text-muted)]">UTC/Local:</span>
          <span className="text-[var(--terminal-text)] font-semibold">{entry.timestamp}</span>
        </div>
      )}

      {entry.type === 'navigate' && (
        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2 font-mono">
          <FiCompass size={13} className="animate-spin" aria-hidden="true" />
          <span>{entry.message}</span>
        </div>
      )}

      {entry.type === 'season' && (
        <div className="p-2.5 rounded bg-[var(--accent-muted)] border border-[var(--accent)]/40 text-[var(--accent)] text-xs flex items-center gap-2 font-mono font-semibold">
          <span>{entry.message}</span>
        </div>
      )}

      {entry.type === 'easter-egg' && (
        <div className="p-2.5 rounded bg-[var(--accent-muted)] border border-[var(--accent)]/40 text-[var(--accent)] text-xs font-mono">
          {entry.message}
        </div>
      )}

      {entry.type === 'error' && (
        <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-[#EF4444] text-xs font-mono space-y-1">
          <div>⚠ {entry.message}</div>
          {entry.hint && (
            <div className="text-[11px] text-[var(--text-muted)]">{entry.hint}</div>
          )}
          {entry.availableSlugs && (
            <div className="flex flex-wrap gap-1 pt-1">
              {entry.availableSlugs.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => onRunCommand(`project ${slug}`)}
                  className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] text-[var(--accent)] text-[10px] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  {slug}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

TerminalOutputEntry.propTypes = {
  entry: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  opensNewTabLabel: PropTypes.string.isRequired,
  githubData: PropTypes.object,
  copiedKey: PropTypes.string,
  onRunCommand: PropTypes.func.isRequired,
  onCopyToClipboard: PropTypes.func.isRequired,
};
