import { useState } from "react";
import { FaPause, FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FiMusic, FiChevronUp } from "react-icons/fi";
import "../styles/Components.css";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const songs = [
    {
        title: "Born to Die",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyhwdaRdmssjL5ImhqFjuV0U0bADjt6_MUiDf0XWavnw&s=10",
        audio: "born_to_die.mp3",
        duration: 265,
        color: "#FACC15",
    },
    {
        title: "Risk It All",
        artist: "Bruno Mars",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_iGgvKbRt8FcjYF6VUTVjPZtKPz2K38qLLGs7wvi_YQ&s=10",
        audio: "risk_it_all.mp3",
        duration: 265,
        color: "#FACC15",
    },
    {
        title: "Ultraviolence",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUBqbWTV_PaMn06j_KFUAK49Su7gXHKV5cDORcr98dHw&s=10",
        audio: "ultraviolence.mp3",
        duration: 263,
        color: "#FACC15",
    },
    {
        title: "One Of The Girls",
        artist: "Jennie, Lily-Rose, The Weeknd",
        cover: "sound2.jpeg",
        audio: "sound4.mp3",
        duration: 242,
        color: "#FACC15",
    },
    {
        title: "Summertime Sadness",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN0xDTVAz0wVKvO6Y32DEC_3kSWJqLEjnZPN5VNZ-ZFA&s=10",
        audio: "summertime_sad.mp3",
        duration: 264,
        color: "#FACC15",
    },
    {
        title: "Monolog",
        artist: "Pamungkas",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8qVUgkHMIz72PLnsBgHLQb8Iz3x0tLTr56OjBXFOx2w&s=10",
        audio: "monolog.mp3",
        duration: 281,
        color: "#FACC15",
    },
    {
        title: "Salvatore",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC_OUb5_hhSmi4a22GpHllU-JyIdMldFCF3NzT91QabA&s=10",
        audio: "Salvatore.mp3",
        duration: 281,
        color: "#FACC15",
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
        <div className="fixed top-20 right-4 sm:right-6 z-40 select-none">
            {/* Collapsed View */}
            {!isExpanded && (
                <div className="flex items-center">
                    {/* Mobile: Ultra-compact circle button (<640px) */}
                    <button
                        type="button"
                        id="sound-button-mini-mobile"
                        onClick={() => setIsExpanded(true)}
                        className="sm:hidden w-9 h-9 rounded-full bg-[var(--surface-muted)]/90 backdrop-blur-md border border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        aria-label={isPlaying ? `Now playing: ${currentTrack.title}. Open music player` : "Open music player"}
                        title={isPlaying ? `Now playing: ${currentTrack.title}` : "Open music player"}
                    >
                        {isPlaying ? (
                            <div className="flex items-center gap-[2px] h-3">
                                <span className="w-[2px] h-full bg-[var(--accent)] animate-pulse" />
                                <span className="w-[2px] h-2 bg-[var(--accent)] animate-pulse delay-75" />
                                <span className="w-[2px] h-full bg-[var(--accent)] animate-pulse delay-150" />
                            </div>
                        ) : (
                            <FiMusic size={15} />
                        )}
                    </button>

                    {/* Desktop: Quiet compact pill (>=640px) */}
                    <div
                        className="hidden sm:flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-[var(--surface-muted)]/85 backdrop-blur-md border border-[var(--border)] hover:border-[var(--border-hover)] shadow-sm transition-all duration-200 group"
                    >
                        {/* Spinning mini album thumbnail or quick play toggle */}
                        <button
                            type="button"
                            onClick={togglePlayback}
                            className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 relative group/btn cursor-pointer focus-visible:outline-none"
                            aria-label={isPlaying ? "Pause music" : "Play music"}
                            title={isPlaying ? "Click to pause" : "Click to play"}
                        >
                            <img
                                src={currentTrack.cover}
                                alt="Album Art"
                                className={`w-full h-full object-cover transition-opacity ${isPlaying ? "album-spin playing" : "album-spin"}`}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px]">
                                {isPlaying ? <FaPause size={8} /> : <FaPlay size={8} className="ml-[1px]" />}
                            </div>
                        </button>

                        {/* Track Info (clickable to expand) */}
                        <button
                            type="button"
                            id="sound-button-mini-desktop"
                            onClick={() => setIsExpanded(true)}
                            className="flex items-center gap-2 text-left cursor-pointer focus-visible:outline-none"
                            aria-label={`Now playing ${currentTrack.title} by ${currentTrack.artist}. Expand player`}
                        >
                            <span className="text-[11px] font-mono text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors max-w-[95px] truncate">
                                {currentTrack.title}
                            </span>

                            {/* Equalizer bars */}
                            <div className="flex items-center gap-[2px] h-3 px-0.5">
                                {[1, 2, 3].map((b) => (
                                    <div
                                        key={b}
                                        style={{
                                            width: '2px',
                                            background: isPlaying ? 'var(--accent)' : 'var(--text-muted)',
                                            height: isPlaying ? '100%' : '3px',
                                            animation: isPlaying ? `nbBar${b} 0.${5 + b}s ease-in-out infinite alternate` : 'none',
                                            transition: 'height 0.2s',
                                        }}
                                    />
                                ))}
                            </div>

                            <FiChevronUp size={12} className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />
                        </button>
                    </div>
                </div>
            )}

            {/* Expanded Player Card */}
            {isExpanded && (
                <div
                    className="w-56 sm:w-60 rounded-lg overflow-hidden bg-[var(--surface)]/95 backdrop-blur-xl border border-[var(--border)] shadow-2xl animate-fadeIn transition-all duration-200"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--surface-muted)]/80">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                            <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--text-secondary)]">
                                NOW PLAYING
                            </span>
                        </div>
                        <button
                            type="button"
                            id="sound-button-close"
                            onClick={() => setIsExpanded(false)}
                            className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer focus-visible:outline-none"
                            aria-label="Close music player"
                        >
                            <IoClose size={15} />
                        </button>
                    </div>

                    <div className="p-3.5 space-y-3">
                        {/* Album Artwork */}
                        <div className="w-full aspect-square rounded overflow-hidden border border-[var(--border)] relative bg-[var(--surface-alt)]">
                            <img
                                src={currentTrack.cover}
                                alt={`${currentTrack.title} cover`}
                                className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? "scale-105" : "scale-100"}`}
                            />
                        </div>

                        {/* Title & Artist */}
                        <div className="text-center px-1">
                            <h5 className="font-grotesk font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                                {currentTrack.title}
                            </h5>
                            <p className="font-mono text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                                {currentTrack.artist}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                            <div className="relative w-full h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-[var(--accent)] rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || currentTrack.duration || 0}
                                    value={currentTime}
                                    onChange={(e) => seek(Number(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    aria-label="Seek track position"
                                />
                            </div>
                            <div className="flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration || currentTrack.duration)}</span>
                            </div>
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center justify-center gap-3 pt-1">
                            <button
                                type="button"
                                id="sound-prev"
                                onClick={prev}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer focus-visible:outline-none"
                                aria-label="Previous track"
                            >
                                <FaStepBackward size={11} />
                            </button>

                            <button
                                type="button"
                                id="sound-play-pause"
                                onClick={togglePlayback}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-all cursor-pointer shadow-sm focus-visible:outline-none"
                                aria-label={isPlaying ? "Pause track" : "Play track"}
                            >
                                {isPlaying ? (
                                    <FaPause size={13} />
                                ) : (
                                    <FaPlay size={13} className="ml-[2px]" />
                                )}
                            </button>

                            <button
                                type="button"
                                id="sound-next"
                                onClick={next}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer focus-visible:outline-none"
                                aria-label="Next track"
                            >
                                <FaStepForward size={11} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Equalizer animation keyframes */}
            <style>{`
                @keyframes nbBar1 { from { height: 3px; } to { height: 12px; } }
                @keyframes nbBar2 { from { height: 6px; } to { height: 12px; } }
                @keyframes nbBar3 { from { height: 3px; } to { height: 9px; } }
            `}</style>
        </div>
    );
};

export default SoundButton;
