import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FiTerminal,
  FiAlertCircle,
  FiCheckCircle,
  FiDollarSign,
  FiUserCheck,
  FiPhone,
  FiCalendar,
  FiMapPin,
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import {
  evaluateFormatSample,
  evaluateNikSample,
  evaluatePhoneSample,
  evaluateLiburSample,
  evaluateWilayahSample,
} from '../utils/idKitPlaygroundHelpers';

const TABS = [
  {
    id: 'format',
    icon: FiDollarSign,
    label: { id: 'Rupiah & Terbilang', en: 'Rupiah & Terbilang' },
    subpath: '@ghifari29/id-kit/format',
  },
  {
    id: 'nik',
    icon: FiUserCheck,
    label: { id: 'NIK & Masking', en: 'NIK & Masking' },
    subpath: '@ghifari29/id-kit/nik · /mask',
  },
  {
    id: 'phone',
    icon: FiPhone,
    label: { id: 'HP & Operator', en: 'Phone & Carrier' },
    subpath: '@ghifari29/id-kit/phone',
  },
  {
    id: 'libur',
    icon: FiCalendar,
    label: { id: 'Libur & Hari Kerja', en: 'Holidays & Workdays' },
    subpath: '@ghifari29/id-kit/libur',
  },
  {
    id: 'wilayah',
    icon: FiMapPin,
    label: { id: 'Cari Wilayah', en: 'Region Search' },
    subpath: '@ghifari29/id-kit/wilayah',
  },
];

const IdKitPlayground = () => {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [activeTab, setActiveTab] = useState('format');

  // Tab 1: Format state
  const [numberInput, setNumberInput] = useState('1250000');
  const [rupiahTextInput, setRupiahTextInput] = useState('Rp1.250.000,-');

  // Tab 2: NIK state
  const [nikInput, setNikInput] = useState('3171011505900001');

  // Tab 3: Phone state
  const [phoneInput, setPhoneInput] = useState('0812-3456-789');

  // Tab 4: Libur & Hari Kerja state
  const [checkDate, setCheckDate] = useState('2026-08-17');
  const [startDate, setStartDate] = useState('2026-08-14');
  const [endDate, setEndDate] = useState('2026-08-18');
  const [sabtuKerja, setSabtuKerja] = useState(false);
  const [sertakanCutiBersama, setSertakanCutiBersama] = useState(true);

  // Tab 5: Wilayah state
  const [wilayahQuery, setWilayahQuery] = useState('sorong');

  const formatResult = useMemo(
    () => evaluateFormatSample(numberInput, rupiahTextInput),
    [numberInput, rupiahTextInput]
  );
  const nikResult = useMemo(() => evaluateNikSample(nikInput), [nikInput]);
  const phoneResult = useMemo(() => evaluatePhoneSample(phoneInput), [phoneInput]);
  const liburResult = useMemo(
    () =>
      evaluateLiburSample(startDate, endDate, checkDate, {
        sabtuKerja,
        sertakanCutiBersama,
      }),
    [startDate, endDate, checkDate, sabtuKerja, sertakanCutiBersama]
  );
  const wilayahResult = useMemo(() => evaluateWilayahSample(wilayahQuery, 20), [wilayahQuery]);

  const currentTabMeta = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const handleTabKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = TABS.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      setActiveTab(TABS[nextIndex].id);
      const btn = document.getElementById(`idkit-tab-${TABS[nextIndex].id}`);
      btn?.focus();
    }
  };

  return (
    <section
      id="playground"
      aria-labelledby="idkit-playground-heading"
      className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] overflow-hidden shadow-lg"
    >
      {/* Playground Header */}
      <div className="px-5 py-4 bg-[var(--surface-alt)] border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
            <FiTerminal size={14} aria-hidden="true" />
            <span>{isId ? 'DEMO INTERAKTIF CLIENT-SIDE' : 'CLIENT-SIDE INTERACTIVE PLAYGROUND'}</span>
          </div>
          <h2
            id="idkit-playground-heading"
            className="font-grotesk font-bold text-lg sm:text-xl text-[var(--text-primary)]"
          >
            {isId ? 'Live Mini Playground — @ghifari29/id-kit' : 'Live Mini Playground — @ghifari29/id-kit'}
          </h2>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--surface-muted)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-secondary)] self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <span>{isId ? '100% Offline di Browser' : '100% Offline in Browser'}</span>
        </span>
      </div>

      {/* Tab Bar */}
      <div
        role="tablist"
        aria-label={isId ? 'Modul demo @ghifari29/id-kit' : '@ghifari29/id-kit demo modules'}
        className="px-4 sm:px-5 pt-3 border-b border-[var(--border-subtle)] flex items-center gap-1.5 overflow-x-auto bg-[var(--bg-primary)]/40"
      >
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`idkit-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`idkit-panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={`cursor-target inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-md font-mono text-xs font-semibold whitespace-nowrap border border-b-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                isSelected
                  ? 'bg-[var(--surface-muted)] text-[var(--accent)] border-[var(--border)] relative -mb-px pb-[11px]'
                  : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-transparent'
              }`}
            >
              <Icon size={13} aria-hidden="true" />
              <span>{tab.label[language] || tab.label.en}</span>
            </button>
          );
        })}
      </div>

      {/* Active Import Strip */}
      <div className="px-5 py-2 bg-[var(--surface-alt)]/50 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[var(--text-muted)]">
        <span>
          import {'{ ... }'} from <span className="text-[var(--accent)]">&apos;{currentTabMeta.subpath}&apos;</span>
        </span>
        <span>0 runtime deps</span>
      </div>

      {/* Tab Panel Body */}
      <div
        id={`idkit-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`idkit-tab-${activeTab}`}
        className="p-5 sm:p-6 space-y-5"
      >
        {/* 1. FORMAT TAB */}
        {activeTab === 'format' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="idkit-format-number"
                  className="block font-mono text-xs text-[var(--text-secondary)] font-semibold"
                >
                  {isId ? 'Angka Nominal (rupiah, terbilang, rupiahSingkat)' : 'Numeric Amount (rupiah, terbilang, rupiahSingkat)'}
                </label>
                <input
                  id="idkit-format-number"
                  type="text"
                  inputMode="numeric"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] focus:border-[var(--accent)] font-mono text-sm text-[var(--text-primary)] outline-none transition-colors"
                  placeholder="1250000"
                />
                <div className="flex flex-wrap gap-1.5">
                  {['1250000', '999950', '2500000000', '-5000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNumberInput(preset)}
                      className="px-2 py-0.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="idkit-parse-rupiah"
                  className="block font-mono text-xs text-[var(--text-secondary)] font-semibold"
                >
                  {isId ? 'String Rupiah (parseRupiah)' : 'Rupiah String (parseRupiah)'}
                </label>
                <input
                  id="idkit-parse-rupiah"
                  type="text"
                  value={rupiahTextInput}
                  onChange={(e) => setRupiahTextInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] focus:border-[var(--accent)] font-mono text-sm text-[var(--text-primary)] outline-none transition-colors"
                  placeholder="Rp1.250.000,-"
                />
                <div className="flex flex-wrap gap-1.5">
                  {['Rp1.250.000,-', 'Rp 2.500,50', '-Rp75.000', '1.50'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRupiahTextInput(preset)}
                      className="px-2 py-0.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <OutputCard label="rupiah(n)" value={formatResult.formattedRupiah} error={formatResult.formatError} />
              <OutputCard label="rupiahSingkat(n)" value={formatResult.shortRupiah} error={formatResult.formatError} />
              <OutputCard
                label="terbilang(n)"
                value={formatResult.terbilangText}
                error={formatResult.formatError}
                className="sm:col-span-2"
              />
              <OutputCard
                label="parseRupiah(str)"
                value={formatResult.parsedRupiah !== null ? String(formatResult.parsedRupiah) : 'null'}
                error={formatResult.parseError}
                badge={formatResult.parsedRupiah !== null ? 'valid' : 'null'}
                className="sm:col-span-2"
              />
            </div>
          </div>
        )}

        {/* 2. NIK TAB */}
        {activeTab === 'nik' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="idkit-nik-input"
                className="block font-mono text-xs text-[var(--text-secondary)] font-semibold"
              >
                {isId ? 'Input NIK Fiktif 16 Digit (parseNIK & maskNIK)' : 'Fictional 16-Digit NIK Input (parseNIK & maskNIK)'}
              </label>
              <input
                id="idkit-nik-input"
                type="text"
                value={nikInput}
                onChange={(e) => setNikInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] focus:border-[var(--accent)] font-mono text-sm text-[var(--text-primary)] outline-none transition-colors"
                placeholder="3171011505900001"
              />
              <div className="flex flex-wrap gap-1.5">
                {[
                  { val: '3171011505900001', hint: 'DKI Jakarta (L)' },
                  { val: '3271015505950002', hint: 'Jawa Barat (P)' },
                  { val: '9971011505900001', hint: isId ? 'Provinsi invalid' : 'Invalid province' },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setNikInput(preset.val)}
                    className="px-2 py-0.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer transition-colors"
                  >
                    {preset.val} ({preset.hint})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <OutputCard
                label="maskNIK(nik)"
                value={nikResult.masked}
                error={nikResult.error}
              />
              <OutputCard
                label="parseNIK(nik)"
                value={JSON.stringify(nikResult.parsed, null, 2)}
                error={nikResult.error}
                isCode
                badge={nikResult.parsed?.valid ? 'valid: true' : `alasan: ${nikResult.parsed?.alasan || 'error'}`}
                badgeOk={Boolean(nikResult.parsed?.valid)}
              />
            </div>
          </div>
        )}

        {/* 3. PHONE TAB */}
        {activeTab === 'phone' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="idkit-phone-input"
                className="block font-mono text-xs text-[var(--text-secondary)] font-semibold"
              >
                {isId ? 'Nomor Seluler Indonesia (normalizePhone & detectOperator)' : 'Indonesian Mobile Number (normalizePhone & detectOperator)'}
              </label>
              <input
                id="idkit-phone-input"
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] focus:border-[var(--accent)] font-mono text-sm text-[var(--text-primary)] outline-none transition-colors"
                placeholder="0812-3456-789"
              />
              <div className="flex flex-wrap gap-1.5">
                {['0812-3456-789', '+62 857-1234-5678', '087811112222', '089600001111', '021-555-1234'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPhoneInput(preset)}
                    className="px-2 py-0.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <OutputCard
                label="normalizePhone(phone)"
                value={phoneResult.normalized ?? 'null'}
                error={phoneResult.error}
                badge={phoneResult.normalized ? 'E.164 +62' : 'null'}
                badgeOk={Boolean(phoneResult.normalized)}
              />
              <OutputCard
                label="detectOperator(phone)"
                value={JSON.stringify(phoneResult.operatorResult, null, 2)}
                error={phoneResult.error}
                isCode
                badge={
                  phoneResult.operatorResult?.valid
                    ? phoneResult.operatorResult.operator
                    : phoneResult.operatorResult?.alasan || 'invalid'
                }
                badgeOk={Boolean(phoneResult.operatorResult?.valid)}
              />
            </div>
          </div>
        )}

        {/* 4. LIBUR & HARI KERJA TAB */}
        {activeTab === 'libur' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="idkit-check-date"
                  className="block font-mono text-xs text-[var(--text-secondary)] font-semibold"
                >
                  {isId ? 'Cek Tanggal (cekLibur)' : 'Check Date (cekLibur)'}
                </label>
                <input
                  id="idkit-check-date"
                  type="text"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] focus:border-[var(--accent)] font-mono text-sm text-[var(--text-primary)] outline-none transition-colors"
                  placeholder="2026-08-17"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="idkit-start-date"
                  className="block font-mono text-xs text-[var(--text-secondary)] font-semibold"
                >
                  {isId ? 'Mulai (hitungHariKerja)' : 'Start (hitungHariKerja)'}
                </label>
                <input
                  id="idkit-start-date"
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] focus:border-[var(--accent)] font-mono text-sm text-[var(--text-primary)] outline-none transition-colors"
                  placeholder="2026-08-14"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="idkit-end-date"
                  className="block font-mono text-xs text-[var(--text-secondary)] font-semibold"
                >
                  {isId ? 'Selesai (hitungHariKerja)' : 'End (hitungHariKerja)'}
                </label>
                <input
                  id="idkit-end-date"
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] focus:border-[var(--accent)] font-mono text-sm text-[var(--text-primary)] outline-none transition-colors"
                  placeholder="2026-08-18"
                />
              </div>
            </div>

            {/* Options toggles */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sabtuKerja}
                  onChange={(e) => setSabtuKerja(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                <span>sabtuKerja: {String(sabtuKerja)}</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sertakanCutiBersama}
                  onChange={(e) => setSertakanCutiBersama(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                <span>sertakanCutiBersama: {String(sertakanCutiBersama)}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <OutputCard
                label={`cekLibur('${checkDate}')`}
                value={JSON.stringify(liburResult.liburResult, null, 2)}
                error={liburResult.liburError}
                isCode
                badge={liburResult.liburResult?.status || 'error'}
                badgeOk={
                  liburResult.liburResult?.status === 'libur-nasional' ||
                  liburResult.liburResult?.status === 'cuti-bersama'
                }
              />
              <OutputCard
                label={`hitungHariKerja('${startDate}', '${endDate}')`}
                value={JSON.stringify(liburResult.hariKerjaResult, null, 2)}
                error={liburResult.hariKerjaError}
                isCode
                badge={
                  liburResult.hariKerjaResult?.valid
                    ? `${liburResult.hariKerjaResult.hariKerja} / ${liburResult.hariKerjaResult.totalHari} ${isId ? 'hari' : 'days'}`
                    : 'invalid'
                }
                badgeOk={Boolean(liburResult.hariKerjaResult?.valid)}
              />
            </div>
          </div>
        )}

        {/* 5. WILAYAH TAB */}
        {activeTab === 'wilayah' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="idkit-wilayah-query"
                className="block font-mono text-xs text-[var(--text-secondary)] font-semibold"
              >
                {isId ? 'Cari Provinsi atau Kab/Kota Kemendagri (cariWilayah)' : 'Search Kemendagri Province or Regency/City (cariWilayah)'}
              </label>
              <input
                id="idkit-wilayah-query"
                type="text"
                value={wilayahQuery}
                onChange={(e) => setWilayahQuery(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] focus:border-[var(--accent)] font-mono text-sm text-[var(--text-primary)] outline-none transition-colors"
                placeholder="sorong"
              />
              <div className="flex flex-wrap gap-1.5">
                {['sorong', 'bogor', 'papua', 'bandung', 'jakarta'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWilayahQuery(preset)}
                    className="px-2 py-0.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between gap-2 font-mono text-xs">
                <span className="text-[var(--accent)] font-semibold">cariWilayah(&apos;{wilayahQuery}&apos;)</span>
                <span className="text-[var(--text-muted)]">
                  {wilayahResult.results.length} {isId ? 'hasil ditemukan' : 'results found'}
                </span>
              </div>

              {wilayahResult.results.length === 0 ? (
                <p className="font-mono text-xs text-[var(--text-muted)]">
                  {isId ? 'Tidak ada wilayah yang cocok.' : 'No matching regions found.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {wilayahResult.results.map((item) => (
                    <div
                      key={`${item.tingkat}-${item.kode}`}
                      className="p-2.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-sans text-xs font-semibold text-[var(--text-primary)] truncate">
                          {item.nama}
                        </p>
                        <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                          {item.tingkat}
                          {item.provinsiKode ? ` · Prov ${item.provinsiKode}` : ''}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border-subtle)] shrink-0">
                        {item.kode}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fictional Data & Format-Only Disclaimer */}
        <div className="p-3.5 rounded-lg bg-[var(--surface-alt)] border-l-2 border-l-amber-500 border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
          <FiAlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            {isId
              ? 'Catatan: Seluruh contoh di atas menggunakan data fiktif. Validasi bersifat format & offline berdasarkan struktur resmi — bukan verifikasi langsung ke Dukcapil, DJP, atau instansi pemerintah.'
              : 'Note: All examples above use fictional data. Validation is format-only & offline based on official patterns — not live verification against Dukcapil, DJP, or government registries.'}
          </p>
        </div>
      </div>
    </section>
  );
};

const OutputCard = ({ label, value, error = null, isCode = false, badge = null, badgeOk = true, className = '' }) => {
  return (
    <div
      className={`p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-[var(--accent)]">{label}</span>
        {badge && !error && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] border ${
              badgeOk
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                : 'bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border-subtle)]'
            }`}
          >
            {badgeOk && <FiCheckCircle size={10} aria-hidden="true" />}
            <span>{badge}</span>
          </span>
        )}
      </div>

      {error ? (
        <p className="font-mono text-xs text-red-400">{error}</p>
      ) : isCode ? (
        <pre className="font-mono text-xs text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed m-0">
          {value}
        </pre>
      ) : (
        <p className="font-mono text-xs sm:text-sm text-[var(--text-primary)] break-words leading-relaxed">
          {value}
        </p>
      )}
    </div>
  );
};

OutputCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  error: PropTypes.string,
  isCode: PropTypes.bool,
  badge: PropTypes.string,
  badgeOk: PropTypes.bool,
  className: PropTypes.string,
};

export default IdKitPlayground;
