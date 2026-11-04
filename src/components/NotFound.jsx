import { motion, useReducedMotion } from 'framer-motion';
import { FiAlertCircle, FiArrowLeft, FiCompass } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { RouterLink } from '../context/RouterContext';

const NotFound = () => {
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const easeCurve = [0.16, 1, 0.3, 1];

  const fadeMotion = shouldReduceMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: easeCurve },
      };

  return (
    <div className="w-full min-h-screen text-[var(--text-primary)] pt-32 pb-20 px-5 sm:px-6 flex items-center justify-center">
      <motion.div
        {...fadeMotion}
        className="max-w-md w-full p-8 sm:p-10 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-center space-y-6"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-red-950/40 border border-red-800 text-red-400 flex items-center justify-center">
          <FiAlertCircle size={28} aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase font-semibold">
            404 // PAGE NOT FOUND
          </span>
          <h1 className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)] uppercase">
            {language === 'id' ? 'Halaman Tidak Ditemukan' : 'Page Not Found'}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {language === 'id'
              ? 'Tautan yang Anda tuju tidak tersedia atau telah dipindahkan.'
              : 'The link you followed could not be found or has moved.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <RouterLink
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] font-mono text-xs font-bold uppercase transition-opacity hover:opacity-90"
          >
            <FiArrowLeft size={14} aria-hidden="true" />
            <span>{language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}</span>
          </RouterLink>

          <RouterLink
            to="/study-case"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs font-bold text-[var(--text-primary)] uppercase transition-colors"
          >
            <FiCompass size={14} aria-hidden="true" />
            <span>{language === 'id' ? 'Studi Kasus' : 'Case Studies'}</span>
          </RouterLink>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
