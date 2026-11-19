import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_TRACKS = [
    {
        title: "Born to Die",
        artist: "Lana Del Rey",
        cover: "/audio/covers/born_to_die.webp",
        audio: "/audio/born_to_die.mp3",
        duration: 265,
        color: "#3B82F6",
    },
    {
        title: "Risk It All",
        artist: "Bruno Mars",
        cover: "/audio/covers/risk_it_all.webp",
        audio: "/audio/risk_it_all.mp3",
        duration: 265,
        color: "#3B82F6",
    },
    {
        title: "Ultraviolence",
        artist: "Lana Del Rey",
        cover: "/audio/covers/ultraviolence.webp",
        audio: "/audio/ultraviolence.mp3",
        duration: 263,
        color: "#3B82F6",
    },
    {
        title: "One Of The Girls",
        artist: "Jennie, Lily-Rose, The Weeknd",
        cover: "/audio/covers/sound2.webp",
        audio: "/audio/sound4.mp3",
        duration: 242,
        color: "#3B82F6",
    },
    {
        title: "Summertime Sadness",
        artist: "Lana Del Rey",
        cover: "/audio/covers/summertime_sadness.webp",
        audio: "/audio/summertime_sad.mp3",
        duration: 264,
        color: "#3B82F6",
    },
];

// Shared singleton state so SoundButton and GameHUD control the exact same audio player (default off)
const sharedStore = {
    tracks: DEFAULT_TRACKS,
    currentIndex: 0,
    isPlaying: false,
    currentTime: 0,
    duration: DEFAULT_TRACKS[0]?.duration || 0,
    audio: null,
    loadedTrackIndex: null,
    listeners: new Set(),
};

// Helper for headless inspection and test verification of initial sound state
export const getSharedAudioSnapshot = () => ({
    currentIndex: sharedStore.currentIndex,
    isPlaying: sharedStore.isPlaying,
    currentTime: sharedStore.currentTime,
    duration: sharedStore.duration,
    hasAudioElement: Boolean(sharedStore.audio),
});

const notifyListeners = () => {
    const snapshot = {
        currentIndex: sharedStore.currentIndex,
        isPlaying: sharedStore.isPlaying,
        currentTime: sharedStore.currentTime,
        duration: sharedStore.duration,
    };
    sharedStore.listeners.forEach((listener) => listener(snapshot));
};

const goToSharedTrack = (direction) => {
    const list = sharedStore.tracks;
    if (!list.length) return;

    const prevIndex = sharedStore.currentIndex;
    const nextIndex =
        direction === "next"
            ? prevIndex === list.length - 1
                ? 0
                : prevIndex + 1
            : prevIndex === 0
            ? list.length - 1
            : prevIndex - 1;

    sharedStore.currentIndex = nextIndex;
    const track = list[nextIndex];
    sharedStore.currentTime = 0;
    sharedStore.duration = track?.duration || 0;

    if (sharedStore.audio && track) {
        sharedStore.audio.pause();
        sharedStore.audio.src = track.audio;
        sharedStore.audio.load();
        sharedStore.audio.currentTime = 0;
        sharedStore.loadedTrackIndex = nextIndex;

        if (sharedStore.isPlaying) {
            sharedStore.audio.play().catch((error) => {
                console.error("Error playing audio:", error);
                sharedStore.isPlaying = false;
                notifyListeners();
            });
        }
    }

    notifyListeners();
};

const getOrCreateSharedAudio = () => {
    if (!sharedStore.audio && typeof window !== "undefined") {
        const audio = new Audio();
        audio.preload = "none";
        audio.volume = 0.5;

        audio.addEventListener("loadedmetadata", () => {
            if (audio.duration && !Number.isNaN(audio.duration)) {
                sharedStore.duration = audio.duration;
                notifyListeners();
            }
        });
        audio.addEventListener("timeupdate", () => {
            sharedStore.currentTime = audio.currentTime;
            notifyListeners();
        });
        audio.addEventListener("ended", () => {
            goToSharedTrack("next");
        });

        sharedStore.audio = audio;
    }
    return sharedStore.audio;
};

/**
 * Lightweight shared audio player state manager with pure lazy audio initialization.
 * Audio element is not instantiated and no network audio requests are sent
 * until the user explicitly initiates playback or navigation.
 */
export const useAudioPlayer = (tracks = DEFAULT_TRACKS) => {
    if (Array.isArray(tracks) && tracks.length > 0 && sharedStore.tracks !== tracks) {
        sharedStore.tracks = tracks;
    }

    const activeTracks = sharedStore.tracks;

    const [snapshot, setSnapshot] = useState(() => ({
        currentIndex: sharedStore.currentIndex,
        isPlaying: sharedStore.isPlaying,
        currentTime: sharedStore.currentTime,
        duration: sharedStore.duration,
    }));

    const audioRef = useRef(sharedStore.audio);
    audioRef.current = sharedStore.audio;

    useEffect(() => {
        sharedStore.listeners.add(setSnapshot);
        return () => {
            sharedStore.listeners.delete(setSnapshot);
        };
    }, []);

    const togglePlayback = useCallback(() => {
        const track = sharedStore.tracks[sharedStore.currentIndex];
        if (!track) return;

        const audio = getOrCreateSharedAudio();
        if (!audio) return;

        if (sharedStore.isPlaying) {
            audio.pause();
            sharedStore.isPlaying = false;
            notifyListeners();
        } else {
            if (sharedStore.loadedTrackIndex !== sharedStore.currentIndex || !audio.src) {
                audio.src = track.audio;
                audio.load();
                sharedStore.loadedTrackIndex = sharedStore.currentIndex;
            }
            sharedStore.isPlaying = true;
            notifyListeners();
            audio.play().catch((error) => {
                console.error("Error playing audio:", error);
                sharedStore.isPlaying = false;
                notifyListeners();
            });
        }
    }, []);

    const seek = useCallback((time) => {
        const track = sharedStore.tracks[sharedStore.currentIndex];
        const audio = getOrCreateSharedAudio();
        if (!audio) return;

        if (sharedStore.loadedTrackIndex !== sharedStore.currentIndex && track) {
            audio.src = track.audio;
            audio.load();
            sharedStore.loadedTrackIndex = sharedStore.currentIndex;
        }
        audio.currentTime = time;
        sharedStore.currentTime = time;
        notifyListeners();
    }, []);

    const next = useCallback(() => {
        getOrCreateSharedAudio();
        goToSharedTrack("next");
    }, []);

    const prev = useCallback(() => {
        getOrCreateSharedAudio();
        goToSharedTrack("prev");
    }, []);

    return {
        audioRef,
        currentIndex: snapshot.currentIndex,
        currentTrack: activeTracks[snapshot.currentIndex],
        isPlaying: snapshot.isPlaying,
        currentTime: snapshot.currentTime,
        duration: snapshot.duration,
        togglePlayback,
        seek,
        next,
        prev,
    };
};
