(() => {
let audioContext = null;

function getAudioContext() {
  if (audioContext) {
    return audioContext;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  try {
    audioContext = new AudioContextClass();
  } catch (error) {
    audioContext = null;
  }

  return audioContext;
}

function playMoveSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < bufferSize; index++) {
    data[index] = (Math.random() * 2 - 1) * Math.exp(-index / (ctx.sampleRate * 0.012));
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 800;
  filter.Q.value = 2.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);
}

function playCaptureSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const lowLength = ctx.sampleRate * 0.12;
  const lowBuffer = ctx.createBuffer(1, lowLength, ctx.sampleRate);
  const lowData = lowBuffer.getChannelData(0);

  for (let index = 0; index < lowLength; index++) {
    lowData[index] = (Math.random() * 2 - 1) * Math.exp(-index / (ctx.sampleRate * 0.018));
  }

  const lowSource = ctx.createBufferSource();
  lowSource.buffer = lowBuffer;
  const lowFilter = ctx.createBiquadFilter();
  lowFilter.type = "lowpass";
  lowFilter.frequency.value = 500;
  lowFilter.Q.value = 1;
  const lowGain = ctx.createGain();
  lowGain.gain.setValueAtTime(0.7, now);
  lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  lowSource.connect(lowFilter);
  lowFilter.connect(lowGain);
  lowGain.connect(ctx.destination);
  lowSource.start(now);

  const highLength = ctx.sampleRate * 0.06;
  const highBuffer = ctx.createBuffer(1, highLength, ctx.sampleRate);
  const highData = highBuffer.getChannelData(0);

  for (let index = 0; index < highLength; index++) {
    highData[index] = (Math.random() * 2 - 1) * Math.exp(-index / (ctx.sampleRate * 0.008));
  }

  const highSource = ctx.createBufferSource();
  highSource.buffer = highBuffer;
  const highFilter = ctx.createBiquadFilter();
  highFilter.type = "bandpass";
  highFilter.frequency.value = 1200;
  highFilter.Q.value = 1.5;
  const highGain = ctx.createGain();
  highGain.gain.setValueAtTime(0.5, now);
  highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  highSource.connect(highFilter);
  highFilter.connect(highGain);
  highGain.connect(ctx.destination);
  highSource.start(now);
}

function playCheckAlertSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  const firstOscillator = ctx.createOscillator();
  const firstGain = ctx.createGain();
  firstOscillator.type = "square";
  firstOscillator.frequency.setValueAtTime(330, now);
  firstGain.gain.setValueAtTime(0.001, now);
  firstGain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
  firstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  firstOscillator.connect(firstGain);
  firstGain.connect(ctx.destination);
  firstOscillator.start(now);
  firstOscillator.stop(now + 0.12);

  const secondOscillator = ctx.createOscillator();
  const secondGain = ctx.createGain();
  secondOscillator.type = "square";
  secondOscillator.frequency.setValueAtTime(250, now + 0.11);
  secondGain.gain.setValueAtTime(0.001, now + 0.11);
  secondGain.gain.exponentialRampToValueAtTime(0.16, now + 0.13);
  secondGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
  secondOscillator.connect(secondGain);
  secondGain.connect(ctx.destination);
  secondOscillator.start(now + 0.11);
  secondOscillator.stop(now + 0.24);
}

window.ChessAudio = {
  playMoveSound,
  playCaptureSound,
  playCheckAlertSound,
};
})();

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessAudio;
}
