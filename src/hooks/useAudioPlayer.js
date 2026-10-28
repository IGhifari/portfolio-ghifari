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
        if (!audio) return;

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
