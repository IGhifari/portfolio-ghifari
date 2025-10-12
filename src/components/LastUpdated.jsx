import React, { useState } from 'react';
import { FaClock } from 'react-icons/fa';

const LastUpdated = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('2025-10-12'); 

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    return (
        <div className="last-updated-container">
            <div className={`last-updated-content ${isVisible ? 'show-update' : ''}`}>
                <FaClock 
                    className="clock-icon cursor-pointer" 
                    onClick={() => setIsVisible(!isVisible)}
                />
                <span className="update-text font-montserrat ">
                    <span className="font-medium">Last Updated</span>
                    <span className="text-cyan-400 ml-1">—</span>
                    <span className="ml-1 text-gray-300">{formatDate(lastUpdated)}</span>
                </span>
            </div>

            {/* Input untuk mengatur tanggal */}
            {isVisible && (
                <div className="mt-2">
                    <input 
                        type="date" 
                        value={lastUpdated}
                        onChange={(e) => setLastUpdated(e.target.value)}
                        className="p-1 border rounded bg-gray-800 text-white"
                    />
                </div>
            )}
        </div>
    );
};

export default LastUpdated;
