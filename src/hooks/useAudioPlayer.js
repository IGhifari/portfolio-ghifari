import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lightweight audio player state manager.
 * Pass daftar track dan dapatkan state + kontrol untuk next/prev/play/seek.
 */
export const useAudioPlayer = (tracks = []) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(tracks[0]?.duration || 0);

    const audioRef = useRef(new Audio(tracks[0]?.audio || ""));

    const goToTrack = useCallback(
        (direction) => {
            setCurrentIndex((prev) => {
                if (direction === "next") return prev === tracks.length - 1 ? 0 : prev + 1;
                return prev === 0 ? tracks.length - 1 : prev - 1;
            });
        },
        [tracks.length]
    );

    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = 0.5;

        const handleLoadedMetadata = () => setDuration(audio.duration || tracks[currentIndex]?.duration || 0);
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => goToTrack("next");

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.pause();
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [currentIndex, goToTrack, tracks]);

    useEffect(() => {
        const track = tracks[currentIndex];
        if (!track) return;

        const audio = audioRef.current;
        audio.pause();
        audio.src = track.audio;
        audio.load();
        audio.currentTime = 0;
        setCurrentTime(0);
        setDuration(track.duration || 0);

        if (isPlaying) {
            audio.play().catch((error) => console.error("Error playing audio:", error));
        }
    }, [currentIndex, isPlaying, tracks]);

    const togglePlayback = () => {
        const audio = audioRef.current;
        setIsPlaying((prev) => {
            const shouldPlay = !prev;
            if (shouldPlay) {
                audio.play().catch((error) => console.error("Error playing audio:", error));
            } else {
                audio.pause();
            }
            return shouldPlay;
        });
    };

    const seek = (time) => {
        const audio = audioRef.current;
        audio.currentTime = time;
        setCurrentTime(time);
    };

    return {
        audioRef,
        currentIndex,
        currentTrack: tracks[currentIndex],
        isPlaying,
        currentTime,
        duration,
        togglePlayback,
        seek,
        next: () => goToTrack("next"),
        prev: () => goToTrack("prev"),
    };
};
