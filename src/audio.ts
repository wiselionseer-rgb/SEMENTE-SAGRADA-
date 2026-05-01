export let audioCtx: AudioContext | null = null;
export let musicOn = false;
let currentTrackIndex = 0;
let bgMusic: HTMLAudioElement | null = null;
let onTrackChangeCallback: ((name: string) => void) | null = null;

// Track paths
const TRACKS = [
  { name: "SOUNDTRACK 8", path: "/gifs/videoplayback (10) (online-audio-converter.com).mp3" },
  { name: "SOUNDTRACK 1", path: "/gifs/videoplayback (3) (online-audio-converter.com) (1).mp3" },
  { name: "SOUNDTRACK 10", path: "/gifs/videoplayback (13) (online-audio-converter.com).mp3" },
  { name: "SOUNDTRACK 2", path: "/gifs/videoplayback (4) (online-audio-converter.com).mp3" },
  { name: "SOUNDTRACK 3", path: "/gifs/videoplayback (5) (online-audio-converter.com).mp3" },
  { name: "SOUNDTRACK 4", path: "/gifs/videoplayback (6) (online-audio-converter.com).mp3" },
  { name: "SOUNDTRACK 5", path: "/gifs/videoplayback (7) (online-audio-converter.com).mp3" },
  { name: "SOUNDTRACK 6", path: "/gifs/videoplayback (8) (online-audio-converter.com).mp3" },
  { name: "SOUNDTRACK 7", path: "/gifs/videoplayback (9) (online-audio-converter.com).mp3" },
  { name: "SOUNDTRACK 9", path: "/gifs/videoplayback (12) (online-audio-converter.com).mp3" }
];

export function setOnTrackChangeCallback(cb: (name: string) => void) {
  onTrackChangeCallback = cb;
}

export function setVolume(vol: number) {
  if (bgMusic) bgMusic.volume = vol;
}

function initAudio() {
  if (bgMusic) return;
  bgMusic = new Audio(TRACKS[currentTrackIndex].path);
  bgMusic.volume = 0.5;
  bgMusic.addEventListener('ended', () => {
    changeTrack(1);
  });
}

export function toggleMusic() {
  initAudio();
  
  if (musicOn) {
    stopMusic();
  } else {
    startMusic();
  }
}

export function getCurrentTrackName() {
  return TRACKS[currentTrackIndex].name;
}

let playPromise: Promise<void> | undefined;

export function changeTrack(dir: number) {
  currentTrackIndex = (currentTrackIndex + dir + TRACKS.length) % TRACKS.length;
  if (onTrackChangeCallback) onTrackChangeCallback(getCurrentTrackName());
  
  const wasPlaying = musicOn;
  
  const applyChange = () => {
    if (!bgMusic) return;
    bgMusic.pause();
    bgMusic.src = TRACKS[currentTrackIndex].path;
    bgMusic.load();
    if (wasPlaying) {
      playPromise = bgMusic.play();
      playPromise.catch(e => console.warn("Playback ignore", e));
    }
  };

  if (bgMusic) {
    if (playPromise !== undefined) {
      playPromise.then(applyChange).catch(applyChange);
    } else {
      applyChange();
    }
  } else {
    initAudio();
    if (wasPlaying) startMusic();
  }
}

function startMusic() {
  initAudio();
  
  musicOn = true;
  playPromise = bgMusic!.play();
  if (playPromise !== undefined) {
      playPromise.then(() => {
        if (onTrackChangeCallback) onTrackChangeCallback(getCurrentTrackName());
      }).catch(e => {
        console.warn("Music playback error:", e);
      });
  }
}

function stopMusic() {
  musicOn = false;
  if (bgMusic) {
    if (playPromise !== undefined) {
        playPromise.then(() => {
            bgMusic!.pause();
        }).catch(e => {
            console.warn("Music playback abort:", e);
        });
    } else {
        bgMusic.pause();
    }
  }
}

export function playSfx(type: 'plant'|'water'|'fertilize'|'prune'|'harvest'|'warning'|'death'|'stage'|'hover'|'click') {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const patterns: Record<string, number[][]> = {
      plant: [[440, .08], [523, .08], [659, .12]],
      water: [[330, .07], [294, .07], [262, .09]],
      fertilize: [[523, .05], [587, .05], [659, .05], [784, .09]],
      prune: [[880, .04], [660, .07]],
      harvest: [[523, .09], [659, .09], [784, .09], [1047, .18]],
      warning: [[220, .09], [196, .13]],
      death: [[330, .1], [262, .1], [220, .2]],
      stage: [[440, .07], [523, .07], [659, .07], [880, .12]],
      hover: [[880, .02]], 
      click: [[1046.50, .04], [1318.51, .06]] 
    };
    const notes = patterns[type] || [[440, .1]];
    let t = audioCtx.currentTime;
    notes.forEach(([f, d]) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0.04, t); 
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t); o.stop(t + d + .01);
      t += d;
    });
  } catch (e) { console.error('Audio ignored by browser:', e); }
}
