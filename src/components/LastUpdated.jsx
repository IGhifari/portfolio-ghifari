import { useState } from 'react';
import { FaClock } from 'react-icons/fa';

const LastUpdated = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('2026-10-02');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    return (
        <div className="inline-flex flex-col items-center py-0.5">
            <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer group focus-visible:outline-none"
                title="Click to view/change update date"
                aria-label="Last updated date"
            >
                <FaClock className="text-[10px] group-hover:text-[var(--accent)] transition-colors" />
                <span>
                    <span className="font-semibold tracking-wider">UPDATED</span>
                    <span className="mx-1.5 opacity-40">—</span>
                    <span>{formatDate(lastUpdated)}</span>
                </span>
            </button>

            {isVisible && (
                <div className="mt-1.5">
                    <input
                        type="date"
                        value={lastUpdated}
                        onChange={(e) => setLastUpdated(e.target.value)}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        aria-label="Edit last updated date"
                    />
                </div>
            )}
        </div>
    );
};

export default LastUpdated;
