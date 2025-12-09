import React, { useState } from "react";
import { FaPause, FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";
import { AiOutlineArrowsAlt } from "react-icons/ai";
import "../styles/Components.css";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const songs = [
    {
        title: "Hotel Ugly",
        artist: "Shut up My Moms Calling",
        cover: "sound1.jpg",
        audio: "sound2.mp3",
        duration: 165,
        color: "#FF6B6B",
    },
    {
        title: "Salvatore",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC_OUb5_hhSmi4a22GpHllU-JyIdMldFCF3NzT91QabA&s=10",
        audio: "Salvatore.mp3",
        duration: 281,
        color: "#4ECDC4",
    },
    {
        title: "Ultraviolence",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUBqbWTV_PaMn06j_KFUAK49Su7gXHKV5cDORcr98dHw&s=10",
        audio: "ultraviolence.mp3",
        duration: 263,
        color: "#4ECDC4",
    },
    {
        title: "Jennie Kim, Lily-Rose Depp, dan The Weeknd",
        artist: "One Of The Girls",
        cover: "sound2.jpeg",
        audio: "sound4.mp3",
        duration: 242,
        color: "#96CEB4",
    },
    {
        title: "Summertime Sadness",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN0xDTVAz0wVKvO6Y32DEC_3kSWJqLEjnZPN5VNZ-ZFA&s=10",
        audio: "summertime.mp3",
        duration: 265,
        color: "#4ECDC4",
    },
    {
        title: "Sorry",
        artist: "Justin Bieber",
        cover: "sound3.png",
        audio: "sound5.mp3",
        duration: 205,
        color: "#96CEB4",
    },
];

const formatTime = (time) => {
    if (!time || Number.isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
    return `${minutes}:${seconds}`;
};

const SoundButton = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { currentTrack, isPlaying, currentTime, duration, togglePlayback, seek, next, prev } = useAudioPlayer(songs);

    if (!currentTrack) return null;

    const progressPercent = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

    return (
        <div className="fixed top-24 right-5 z-40">
            {!isExpanded && (
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-black/80 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 cursor-pointer group animate-fadeIn"
                >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                        <img src={currentTrack.cover} alt="Album Cover" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col pr-2 text-left">
                        <span className="text-sm text-white">{currentTrack.title}</span>
                        <span className="text-xs text-gray-400">{currentTrack.artist}</span>
                    </div>
                </button>
            )}

            {isExpanded && (
                <div className="absolute top-0 right-0 w-56 bg-black/90 backdrop-blur-md rounded-2xl border border-cyan-500/30 animate-slideDown">
                    <div className="relative p-6">
                        <div className="flex flex-col h-96 items-center gap-6">
                            <div className="relative w-full h-full rounded-sm overflow-hidden shadow-2xl">
                                <img
                                    src={currentTrack.cover}
                                    alt="Album Cover"
                                    className={`w-full h-full object-cover ${isPlaying ? "animate-pulse-slow" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(false)}
                                    className="absolute -top-1 -right-1 p-1 text-gray-900 hover:text-gray-400 transition-all ease-in-out"
                                >
                                    <AiOutlineArrowsAlt size={30} />
                                </button>
                            </div>

                            <div className="text-center -top-12">
                                <h5 className="text-sm font-bold text-white mb-1">{currentTrack.title}</h5>
                                <p className="text-gray-400 text-sm">{currentTrack.artist}</p>
                            </div>

                            <div className="w-full space-y-2 -mt-4">
                                <div className="relative w-full">
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || currentTrack.duration || 0}
                                        value={currentTime}
                                        onChange={(event) => seek(Number(event.target.value))}
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, ${currentTrack.color} ${progressPercent}%, #374151 ${progressPercent}%)`,
                                        }}
                                    />
                                    <div
                                        className="absolute -top-6 left-0 transform -translate-x-1/2"
                                        style={{ left: `${progressPercent}%` }}
                                    >
                                        <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md">
                                            <span className="text-xs text-white">{formatTime(currentTime)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <span
                                            className={`w-1 h-1 rounded-full ${isPlaying ? "animate-pulse" : ""}`}
                                            style={{ backgroundColor: currentTrack.color }}
                                        />
                                        {formatTime(currentTime)}
                                    </span>
                                    <span>{formatTime(duration || currentTrack.duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={prev}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 transition-colors"
                                >
                                    <FaStepBackward className="text-cyan-400 w-4 h-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={togglePlayback}
                                    className="w-16 h-16 flex items-center justify-center rounded-full bg-cyan-400 hover:bg-cyan-300 transition-colors"
                                >
                                    {isPlaying ? (
                                        <FaPause className="text-black w-6 h-6" />
                                    ) : (
                                        <FaPlay className="text-black w-6 h-6 ml-1" />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={next}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 transition-colors"
                                >
                                    <FaStepForward className="text-cyan-400 w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SoundButton;
