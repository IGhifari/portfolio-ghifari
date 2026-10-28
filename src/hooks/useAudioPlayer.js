import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lightweight audio player state manager with lazy audio initialization.
 * Does not download audio files until the user explicitly requests playback.
 */
export const useAudioPlayer = (tracks = []) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(tracks[0]?.duration || 0);

    const audioRef = useRef(null);
    const loadedTrackIndexRef = useRef(null);

    const getOrCreateAudio = useCallback(() => {
        if (!audioRef.current) {
            const audio = new Audio();
            audio.preload = "none";
            audio.volume = 0.5;
            audioRef.current = audio;
        }
        return audioRef.current;
    }, []);

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
        const audio = getOrCreateAudio();

        const handleLoadedMetadata = () => {
            if (audio.duration && !Number.isNaN(audio.duration)) {
                setDuration(audio.duration);
            }
        };
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => goToTrack("next");

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [getOrCreateAudio, goToTrack]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    // Handle track change
    useEffect(() => {
        const track = tracks[currentIndex];
        if (!track) return;

        setCurrentTime(0);
        setDuration(track.duration || 0);

        const audio = audioRef.current;
        if (!audio) return;

        // Only load and play if already playing or track was changed while initialized
        if (isPlaying) {
            if (loadedTrackIndexRef.current !== currentIndex) {
                audio.pause();
                audio.src = track.audio;
                audio.load();
                loadedTrackIndexRef.current = currentIndex;
            }
            audio.currentTime = 0;
            audio.play().catch((error) => {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
            });
        } else if (loadedTrackIndexRef.current !== null && loadedTrackIndexRef.current !== currentIndex) {
            audio.pause();
            audio.currentTime = 0;
            loadedTrackIndexRef.current = null;
        }
    }, [currentIndex, isPlaying, tracks]);

    const togglePlayback = useCallback(() => {
        const track = tracks[currentIndex];
        if (!track) return;

        const audio = getOrCreateAudio();

        setIsPlaying((prev) => {
            const shouldPlay = !prev;
            if (shouldPlay) {
                if (loadedTrackIndexRef.current !== currentIndex || !audio.src) {
                    audio.src = track.audio;
                    audio.load();
                    loadedTrackIndexRef.current = currentIndex;
                }
                audio.play().catch((error) => {
                    console.error("Error playing audio:", error);
                    setIsPlaying(false);
                });
            } else {
                audio.pause();
            }
            return shouldPlay;
        });
    }, [currentIndex, getOrCreateAudio, tracks]);

    const seek = useCallback(
        (time) => {
            const track = tracks[currentIndex];
            const audio = getOrCreateAudio();
            if (loadedTrackIndexRef.current !== currentIndex && track) {
                audio.src = track.audio;
                audio.load();
                loadedTrackIndexRef.current = currentIndex;
            }
            audio.currentTime = time;
            setCurrentTime(time);
        },
        [currentIndex, getOrCreateAudio, tracks]
    );

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
