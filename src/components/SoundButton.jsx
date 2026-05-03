import React, { useState } from "react";
import { FaPause, FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import "../styles/Components.css";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const songs = [
    {
        title: "Hotel Ugly",
        artist: "Shut up My Moms Calling",
        cover: "sound1.jpg",
        audio: "sound2.mp3",
        duration: 165,
        color: "#FF3B3B",
    },
    {
        title: "Salvatore",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC_OUb5_hhSmi4a22GpHllU-JyIdMldFCF3NzT91QabA&s=10",
        audio: "Salvatore.mp3",
        duration: 281,
        color: "#FFE500",
    },
    {
        title: "Ultraviolence",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUBqbWTV_PaMn06j_KFUAK49Su7gXHKV5cDORcr98dHw&s=10",
        audio: "ultraviolence.mp3",
        duration: 263,
        color: "#FFE500",
    },
    {
        title: "One Of The Girls",
        artist: "Jennie, Lily-Rose, The Weeknd",
        cover: "sound2.jpeg",
        audio: "sound4.mp3",
        duration: 242,
        color: "#FF3B3B",
    },
    {
        title: "Summertime Sadness",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN0xDTVAz0wVKvO6Y32DEC_3kSWJqLEjnZPN5VNZ-ZFA&s=10",
        audio: "summertime.mp3",
        duration: 265,
        color: "#FFE500",
    },
    {
        title: "Sorry",
        artist: "Justin Bieber",
        cover: "sound3.png",
        audio: "sound5.mp3",
        duration: 205,
        color: "#FF3B3B",
    },
];

const formatTime = (time) => {
    if (!time || Number.isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
};

const SoundButton = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { currentTrack, isPlaying, currentTime, duration, togglePlayback, seek, next, prev } =
        useAudioPlayer(songs);

    if (!currentTrack) return null;

    const progressPercent = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

    return (
        <div className="fixed top-20 right-5 z-40" style={{ paddingTop: '4px' }}>

            {/* Collapsed — mini pill */}
            {!isExpanded && (
                <button
                    type="button"
                    id="sound-button-mini"
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-0 cursor-pointer animate-fadeIn"
                    style={{
                        background: 'var(--nb-black)',
                        border: 'var(--nb-border)',
                        boxShadow: 'var(--nb-shadow)',
                        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translate(-2px,-2px)';
                        e.currentTarget.style.boxShadow = 'var(--nb-shadow-lg)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translate(0,0)';
                        e.currentTarget.style.boxShadow = 'var(--nb-shadow)';
                    }}
                >
                    {/* Album art */}
                    <div
                        className="w-10 h-10 overflow-hidden flex-shrink-0"
                        style={{ borderRight: 'var(--nb-border)' }}
                    >
                        <img
                            src={currentTrack.cover}
                            alt="Album Cover"
                            className={`w-full h-full object-cover ${isPlaying ? "album-spin playing" : "album-spin"}`}
                        />
                    </div>

                    {/* Track info */}
                    <div className="flex flex-col px-3 py-2 text-left">
                        <span
                            className="text-xs font-black font-grotesk leading-tight"
                            style={{ color: 'var(--nb-yellow)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                            {currentTrack.title}
                        </span>
                        <span
                            className="text-xs font-mono"
                            style={{ color: '#aaa', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                            {currentTrack.artist}
                        </span>
                    </div>

                    {/* Playing indicator */}
                    <div
                        className="flex items-center gap-[2px] mr-3"
                        style={{ height: '16px' }}
                    >
                        {[1, 2, 3].map((b) => (
                            <div
                                key={b}
                                style={{
                                    width: '3px',
                                    background: isPlaying ? currentTrack.color : '#555',
                                    borderRadius: '0',
                                    animation: isPlaying ? `nbBar${b} 0.${5 + b}s ease-in-out infinite alternate` : 'none',
                                    height: isPlaying ? '100%' : '4px',
                                    transition: 'height 0.2s',
                                }}
                            />
                        ))}
                    </div>
                </button>
            )}

            {/* Expanded — full player */}
            {isExpanded && (
                <div
                    className="absolute top-0 right-0 w-60 animate-slideDown"
                    style={{
                        background: 'var(--nb-cream)',
                        border: 'var(--nb-border)',
                        boxShadow: 'var(--nb-shadow-lg)',
                    }}
                >
                    {/* Header bar */}
                    <div
                        className="flex items-center justify-between px-3 py-2"
                        style={{
                            background: 'var(--nb-yellow)',
                            borderBottom: 'var(--nb-border)',
                        }}
                    >
                        <span className="font-black font-mono text-xs" style={{ color: 'var(--nb-black)', letterSpacing: '0.08em' }}>
                            ♪ NOW PLAYING
                        </span>
                        <button
                            type="button"
                            id="sound-button-close"
                            onClick={() => setIsExpanded(false)}
                            className="flex items-center justify-center transition-all duration-100"
                            style={{ color: 'var(--nb-black)' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <IoClose size={18} />
                        </button>
                    </div>

                    <div className="p-4 flex flex-col gap-4">
                        {/* Album art */}
                        <div
                            className="w-full overflow-hidden"
                            style={{
                                border: 'var(--nb-border)',
                                boxShadow: 'var(--nb-shadow)',
                                aspectRatio: '1 / 1',
                            }}
                        >
                            <img
                                src={currentTrack.cover}
                                alt="Album Cover"
                                className={`w-full h-full object-cover ${isPlaying ? "animate-pulse-slow" : ""}`}
                            />
                        </div>

                        {/* Track info */}
                        <div>
                            <h5
                                className="font-black font-grotesk text-sm leading-tight"
                                style={{ color: 'var(--nb-black)' }}
                            >
                                {currentTrack.title}
                            </h5>
                            <p
                                className="font-mono text-xs mt-1"
                                style={{ color: '#555' }}
                            >
                                {currentTrack.artist}
                            </p>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                            <div className="relative w-full h-3" style={{ background: '#ddd', border: '2px solid var(--nb-black)' }}>
                                {/* Filled bar */}
                                <div
                                    className="absolute top-0 left-0 h-full"
                                    style={{
                                        width: `${progressPercent}%`,
                                        background: currentTrack.color,
                                        borderRight: progressPercent > 0 ? '2px solid var(--nb-black)' : 'none',
                                    }}
                                />
                                {/* Invisible range input for interaction */}
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || currentTrack.duration || 0}
                                    value={currentTime}
                                    onChange={(e) => seek(Number(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    style={{ margin: 0 }}
                                />
                            </div>
                            <div
                                className="flex justify-between font-mono text-xs"
                                style={{ color: '#666' }}
                            >
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration || currentTrack.duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-3">
                            {/* Prev */}
                            <button
                                type="button"
                                id="sound-prev"
                                onClick={prev}
                                className="w-9 h-9 flex items-center justify-center transition-all duration-100"
                                style={{
                                    background: 'var(--nb-white)',
                                    border: 'var(--nb-border)',
                                    boxShadow: '2px 2px 0px var(--nb-black)',
                                    color: 'var(--nb-black)',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px var(--nb-black)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '2px 2px 0px var(--nb-black)'; }}
                                onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none'; }}
                                onMouseUp={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px var(--nb-black)'; }}
                            >
                                <FaStepBackward size={14} />
                            </button>

                            {/* Play/Pause */}
                            <button
                                type="button"
                                id="sound-play-pause"
                                onClick={togglePlayback}
                                className="w-14 h-14 flex items-center justify-center transition-all duration-100"
                                style={{
                                    background: 'var(--nb-black)',
                                    border: 'var(--nb-border)',
                                    boxShadow: '4px 4px 0px ' + currentTrack.color,
                                    color: 'var(--nb-yellow)',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = `6px 6px 0px ${currentTrack.color}`; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${currentTrack.color}`; }}
                                onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none'; }}
                                onMouseUp={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = `6px 6px 0px ${currentTrack.color}`; }}
                            >
                                {isPlaying ? (
                                    <FaPause size={20} />
                                ) : (
                                    <FaPlay size={20} style={{ marginLeft: '3px' }} />
                                )}
                            </button>

                            {/* Next */}
                            <button
                                type="button"
                                id="sound-next"
                                onClick={next}
                                className="w-9 h-9 flex items-center justify-center transition-all duration-100"
                                style={{
                                    background: 'var(--nb-white)',
                                    border: 'var(--nb-border)',
                                    boxShadow: '2px 2px 0px var(--nb-black)',
                                    color: 'var(--nb-black)',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px var(--nb-black)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '2px 2px 0px var(--nb-black)'; }}
                                onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none'; }}
                                onMouseUp={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px var(--nb-black)'; }}
                            >
                                <FaStepForward size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Bottom color stripe */}
                    <div
                        style={{
                            height: '6px',
                            background: currentTrack.color,
                            borderTop: 'var(--nb-border)',
                        }}
                    />
                </div>
            )}

            {/* Keyframes for bar animation */}
            <style>{`
                @keyframes nbBar1 { from { height: 4px; } to { height: 14px; } }
                @keyframes nbBar2 { from { height: 8px; } to { height: 14px; } }
                @keyframes nbBar3 { from { height: 4px; } to { height: 10px; } }
            `}</style>
        </div>
    );
};

export default SoundButton;
