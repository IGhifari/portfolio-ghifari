import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';
import { AiOutlineArrowsAlt } from "react-icons/ai";
import './components.css';

const songs = [
    {
        title: "Hotel Ugly",
        artist: "Shut up My Moms Calling",
        cover: "sound1.jpg",
        audio: "sound2.mp3",
        duration: 165, // 3:04
        color: "#FF6B6B"
    },
    {
        title: "Salvatore",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC_OUb5_hhSmi4a22GpHllU-JyIdMldFCF3NzT91QabA&s=10",
        audio: "Salvatore.mp3",
        duration: 281, // 3:18
        color: "#4ECDC4"
    },
    {
        title: "Ultraviolence",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUBqbWTV_PaMn06j_KFUAK49Su7gXHKV5cDORcr98dHw&s=10",
        audio: "ultraviolence.mp3",
        duration: 263, // 3:18
        color: "#4ECDC4"
    },
    {
        title: "Jennie Kim, Lily-Rose Depp, dan The Weeknd",
        artist: "One Of The Girls",
        cover: "sound2.jpeg",
        audio: "sound4.mp3",
        duration: 242, // 2:51
        color: "#96CEB4"
    },
    {
        title: "Summertime Sadness",
        artist: "Lana Del Rey",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN0xDTVAz0wVKvO6Y32DEC_3kSWJqLEjnZPN5VNZ-ZFA&s=10",
        audio: "summertime.mp3",
        duration: 265, // 3:18
        color: "#4ECDC4"
    },
    {
        title: "Sorry",
        artist: "Justin Bieber",
        cover: "sound3.png",
        audio: "sound5.mp3",
        duration: 205, // 2:51
        color: "#96CEB4"
    },
];

const SoundButton = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMinPlayer, setShowMinPlayer] = useState(true);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(new Audio(songs[currentSongIndex].audio));
    const playerRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        audio.loop = false;
        audio.volume = 0.5;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        
        const handleSongEnd = () => {
            const nextIndex = currentSongIndex === songs.length - 1 ? 0 : currentSongIndex + 1;
            audioRef.current.pause();
            audioRef.current = new Audio(songs[nextIndex].audio);
            audioRef.current.volume = 0.5;
            setCurrentTime(0);
            setDuration(songs[nextIndex].duration);
            setCurrentSongIndex(nextIndex);
            
            // Autoplay next song
            audioRef.current.play().then(() => {
                setIsPlaying(true);
                audioRef.current.addEventListener('timeupdate', () => {
                    setCurrentTime(audioRef.current.currentTime);
                });
            }).catch(error => {
                console.error('Error auto-playing next song:', error);
            });
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleSongEnd);
        
        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleSongEnd);
        };
    }, [currentSongIndex, songs.length]);

    const handleNext = () => {
        setCurrentSongIndex(prevIndex => {
            const nextIndex = prevIndex === songs.length - 1 ? 0 : prevIndex + 1;
            const nextAudio = new Audio(songs[nextIndex].audio);
            
            // Set up the new audio instance
            nextAudio.volume = 0.5;
            nextAudio.addEventListener('timeupdate', () => {
                setCurrentTime(nextAudio.currentTime);
            });
            nextAudio.addEventListener('loadedmetadata', () => {
                setDuration(nextAudio.duration || songs[nextIndex].duration);
            });

            // Clean up old audio
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            
            // Update ref and states
            audioRef.current = nextAudio;
            setCurrentTime(0);
            setDuration(songs[nextIndex].duration);
            
            // Only play if it was playing before
            if (isPlaying) {
                nextAudio.play().catch(console.error);
            }
            
            return nextIndex;
        });
    };

    const handlePrev = () => {
        setCurrentSongIndex(prevIndex => {
            const prevSongIndex = prevIndex === 0 ? songs.length - 1 : prevIndex - 1;
            const prevAudio = new Audio(songs[prevSongIndex].audio);
            
            // Set up the new audio instance
            prevAudio.volume = 0.5;
            prevAudio.addEventListener('timeupdate', () => {
                setCurrentTime(prevAudio.currentTime);
            });
            prevAudio.addEventListener('loadedmetadata', () => {
                setDuration(prevAudio.duration || songs[prevSongIndex].duration);
            });

            // Clean up old audio
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            
            // Update ref and states
            audioRef.current = prevAudio;
            setCurrentTime(0);
            setDuration(songs[prevSongIndex].duration);
            
            // Only play if it was playing before
            if (isPlaying) {
                prevAudio.play().catch(console.error);
            }
            
            return prevSongIndex;
        });
    };

    const toggleSound = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
        setShowMinPlayer(!showMinPlayer);
    };

    const handleProgressChange = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        audioRef.current.currentTime = time;
    };

    const formatTime = (time) => {
        if (time && !isNaN(time)) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        return '0:00';
    };

    const currentSong = songs[currentSongIndex];

    // Add these styles to animate the progress bar
    const progressBarStyles = {
        background: `linear-gradient(to right, ${songs[currentSongIndex].color} ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%)`
    };

    return (
        <div ref={playerRef} className="fixed top-24 right-5 z-40">
            {/* Minimized Player */}
            {showMinPlayer && (
                <div 
                    onClick={toggleExpand}
                    className="flex items-center gap-3 p-2 rounded-xl bg-black/80 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 cursor-pointer group animate-fadeIn"
                >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                        <img 
                            src={currentSong.cover}
                            alt="Album Cover" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col pr-2">
                        <span className="text-sm text-white ">{currentSong.title}</span>
                        <span className="text-xs text-gray-400">{currentSong.artist}</span>
                    </div>
                </div>
            )}

            {/* Expanded Player */}
            {isExpanded && (
                <div className="absolute top-0 right-0 w-56 bg-black/90 backdrop-blur-md rounded-2xl border border-cyan-500/30 animate-slideDown">
                    <div className="relative p-6">
                        <div className="flex flex-col h-96 items-center gap-6">
                            <div className="relative w-full h-full rounded-sm overflow-hidden shadow-2xl">
                                <img 
                                    src={currentSong.cover}
                                    alt="Album Cover" 
                                    className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse-slow' : ''}`}
                                />
                                <button 
                                    onClick={toggleExpand}
                                    className="absolute -top-1 -right-1 p-1 text-gray-900 hover:text-gray-400 transition-all ease-in-out"
                                >
                                    <AiOutlineArrowsAlt size={30} />
                                </button>
                            </div>

                            <div className="text-center -top-12">
                                <h5 className="text-sm font-bold text-white mb-1">{currentSong.title}</h5>
                                <p className="text-gray-400 text-sm">{currentSong.artist}</p>
                            </div>

                            <div className="w-full space-y-2 -mt-4">
                                {/* Progress Bar */}
                                <div className="relative w-full">
                                    <input
                                        type="range"
                                        min="0"
                                        max={currentSong.duration || 0}
                                        value={currentTime}
                                        onChange={handleProgressChange}
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, ${currentSong.color} ${(currentTime / currentSong.duration) * 100}%, #374151 ${(currentTime / currentSong.duration) * 100}%)`
                                        }}
                                    />
                                    <div 
                                        className="absolute -top-6 left-0 transform -translate-x-1/2"
                                        style={{ left: `${(currentTime / currentSong.duration) * 100}%` }}
                                    >
                                        <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md">
                                            <span className="text-xs text-white">{formatTime(currentTime)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Duration Display */}
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <div className={`w-1 h-1 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} 
                                            style={{ backgroundColor: currentSong.color }}/>
                                        {formatTime(currentTime)}
                                    </span>
                                    <span>{formatTime(currentSong.duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePrev}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 transition-colors"
                                >
                                    <FaStepBackward className="text-cyan-400 w-4 h-4" />
                                </button>

                                <button
                                    onClick={toggleSound}
                                    className="w-16 h-16 flex items-center justify-center rounded-full bg-cyan-400 hover:bg-cyan-300 transition-colors"
                                >
                                    {isPlaying ? (
                                        <FaPause className="text-black w-6 h-6" />
                                    ) : (
                                        <FaPlay className="text-black w-6 h-6 ml-1" />
                                    )}
                                </button>

                                <button
                                    onClick={handleNext}
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