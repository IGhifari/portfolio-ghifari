import React, { useState } from 'react';
import { FaClock } from 'react-icons/fa';

const LastUpdated = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('2025-12-10');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    return (
        <div className="last-updated-container">
            <div className={`last-updated-content ${isVisible ? 'show-update' : ''}`}>
                <FaClock
                    className="clock-icon cursor-pointer"
                    onClick={() => setIsVisible(!isVisible)}
                />
                <span className="update-text font-mono">
                    <span className="font-bold">UPDATED</span>
                    <span className="ml-1">—</span>
                    <span className="ml-1">{formatDate(lastUpdated)}</span>
                </span>
            </div>

            {isVisible && (
                <div className="mt-2">
                    <input
                        type="date"
                        value={lastUpdated}
                        onChange={(e) => setLastUpdated(e.target.value)}
                        className="p-1"
                        style={{
                            border: '2px solid var(--nb-black)',
                            background: 'var(--nb-yellow)',
                            fontFamily: 'Space Mono, monospace',
                            color: 'var(--nb-black)',
                            fontSize: '0.7rem',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default LastUpdated;
