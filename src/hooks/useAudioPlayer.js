import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lightweight audio player state manager with pure lazy audio initialization.
 * Audio element is not instantiated and no network audio requests are sent
 * until the user explicitly initiates playback or navigation.
 */
export const useAudioPlayer = (tracks = []) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(tracks[0]?.duration || 0);

    const audioRef = useRef(null);
    const loadedTrackIndexRef = useRef(null);
    const isPlayingRef = useRef(isPlaying);
    const isFirstMountRef = useRef(true);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    const goToTrack = useCallback(
        (direction) => {
            setCurrentIndex((prev) => {
                if (direction === "next") return prev === tracks.length - 1 ? 0 : prev + 1;
                return prev === 0 ? tracks.length - 1 : prev - 1;
            });
        },
        [tracks.length]
    );

    const getOrCreateAudio = useCallback(() => {
        if (!audioRef.current && typeof window !== "undefined") {
            const audio = new Audio();
            audio.preload = "none";
            audio.volume = 0.5;

            audio.addEventListener("loadedmetadata", () => {
                if (audio.duration && !Number.isNaN(audio.duration)) {
                    setDuration(audio.duration);
                }
            });
            audio.addEventListener("timeupdate", () => {
                setCurrentTime(audio.currentTime);
            });
            audio.addEventListener("ended", () => {
                goToTrack("next");
            });

            audioRef.current = audio;
        }
        return audioRef.current;
    }, [goToTrack]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
        };
    }, []);

    // Handle track change: only runs when track index actually changes, never on play/pause
    useEffect(() => {
        if (isFirstMountRef.current) {
            isFirstMountRef.current = false;
            return;
        }

        const track = tracks[currentIndex];
        if (!track) return;

        setCurrentTime(0);
        setDuration(track.duration || 0);

        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.src = track.audio;
        audio.load();
        audio.currentTime = 0;
        loadedTrackIndexRef.current = currentIndex;

        if (isPlayingRef.current) {
            audio.play().catch((error) => {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
            });
        }
    }, [currentIndex, tracks]);

    const togglePlayback = useCallback(() => {
        const track = tracks[currentIndex];
        if (!track) return;

        const audio = getOrCreateAudio();
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            // Load audio source if not loaded yet
            if (loadedTrackIndexRef.current !== currentIndex || !audio.src) {
                audio.src = track.audio;
                audio.load();
                loadedTrackIndexRef.current = currentIndex;
            }
            audio.play().catch((error) => {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
            });
            setIsPlaying(true);
        }
    }, [currentIndex, getOrCreateAudio, isPlaying, tracks]);

    const seek = useCallback(
        (time) => {
            const track = tracks[currentIndex];
            const audio = getOrCreateAudio();
            if (!audio) return;
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
        next: () => {
            getOrCreateAudio();
            goToTrack("next");
        },
        prev: () => {
            getOrCreateAudio();
            goToTrack("prev");
        },
    };
};
