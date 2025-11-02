import { useEffect, useRef, useState } from 'react';
import { Music, Play, Pause, Heart } from 'lucide-react';

const MOOD_PLAYLIST = {
  Calm: ['Calm Focus (Lo-Fi)', 'Soft Piano', 'Rain + Keys'],
  Tired: ['Gentle Wake-Up', 'Lo-Fi Beats', 'Uplift Acoustic'],
  Stressed: ['Deep Breath Waves', '432Hz Pad', 'Forest Ambience'],
  Hopeful: ['Light Strings', 'Sunny Afternoon', 'Hope Piano'],
  Focused: ['Alpha Focus', 'Coding Lo-Fi', 'Minimal Synth']
};

export default function MusicMoodZone() {
  const [mood, setMood] = useState('Calm');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.08);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef({});

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const startAudio = async () => {
    if (playing) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // Create a soft ambient synth: two oscillators + gentle noise
      const master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      // Pick base frequency by mood
      const baseFreq = mood === 'Calm' ? 432 : mood === 'Tired' ? 444 : mood === 'Stressed' ? 396 : mood === 'Hopeful' ? 528 : 480;
      osc1.frequency.value = baseFreq;
      osc2.frequency.value = baseFreq / 2;
      gain1.gain.value = 0.4;
      gain2.gain.value = 0.2;
      osc1.connect(gain1).connect(master);
      osc2.connect(gain2).connect(master);

      // Gentle noise for texture
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.02;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.05;
      noise.loop = true;
      noise.connect(noiseGain).connect(master);

      osc1.start();
      osc2.start();
      noise.start();

      nodesRef.current = { master, osc1, osc2, noise, noiseGain };
      setPlaying(true);
    } catch (e) {
      console.warn('Audio start failed', e);
    }
  };

  const stopAudio = () => {
    try {
      const ctx = audioCtxRef.current;
      const { master, osc1, osc2, noise } = nodesRef.current || {};
      if (osc1) osc1.stop();
      if (osc2) osc2.stop();
      if (noise) noise.stop();
      if (master) master.disconnect();
      if (ctx) ctx.close();
    } catch {}
    setPlaying(false);
  };

  const toggle = () => (playing ? stopAudio() : startAudio());

  const onVolume = (v) => {
    setVolume(v);
    try {
      const { master } = nodesRef.current || {};
      if (master) master.gain.value = v;
    } catch {}
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Music className="h-5 w-5 text-blue-600" />
        <p className="text-sm font-medium text-slate-700">Music & Mood Zone</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {Object.keys(MOOD_PLAYLIST).map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  mood === m ? 'bg-orange-500 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-white transition ${
                playing ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playing ? 'Pause' : 'Play'}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Vol</span>
              <input
                type="range"
                min="0"
                max="0.2"
                step="0.01"
                value={volume}
                onChange={(e) => onVolume(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {MOOD_PLAYLIST[mood].map((name) => (
            <div key={name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">{name}</p>
              <p className="mt-1 text-xs text-slate-500">Suggestion based on your mood. Ambient synth will play when you hit Play.</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Heart className="h-4 w-4 text-pink-500" />
          <span>Background ambient music option — soft, instrumental vibes.</span>
        </div>
      </div>
    </section>
  );
}
