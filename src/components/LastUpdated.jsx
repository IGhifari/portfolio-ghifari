import { FaClock } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const BUILD_DATE_ISO = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '2026-10-28';

const LastUpdated = () => {
    const { language, t } = useLanguage();

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = year && month && day ? new Date(year, month - 1, day) : new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const locale = language === 'id' ? 'id-ID' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(date);
    };

    return (
        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)] py-0.5">
            <FaClock className="text-[10px] text-[var(--accent)]" aria-hidden="true" />
            <span>
                <span className="font-semibold tracking-wider">{t('footer.updatedLabel')}</span>
                <span className="mx-1.5 opacity-40">—</span>
                <time dateTime={BUILD_DATE_ISO}>{formatDate(BUILD_DATE_ISO)}</time>
            </span>
        </div>
    );
};

export default LastUpdated;
