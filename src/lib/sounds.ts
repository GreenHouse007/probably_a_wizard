let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function playTone(
  startFreq: number,
  endFreq: number,
  duration: number,
  type: OscillatorType,
  gain: number,
) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gainNode = ac.createGain();
  osc.connect(gainNode);
  gainNode.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ac.currentTime);
  osc.frequency.linearRampToValueAtTime(endFreq, ac.currentTime + duration);
  gainNode.gain.setValueAtTime(gain, ac.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, ac.currentTime + duration);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

/** Short ascending chirp — combination success */
export function playKiss() {
  playTone(400, 900, 0.25, "sine", 0.25);
}

/** Descending soft tone — valid but locked */
export function playSigh() {
  playTone(500, 200, 0.4, "sine", 0.15);
}

/** Sawtooth buzz — invalid combination */
export function playEw() {
  playTone(200, 150, 0.2, "sawtooth", 0.18);
}
