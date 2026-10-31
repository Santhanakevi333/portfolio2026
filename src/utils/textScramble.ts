const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_+*';

export function scrambleText(
  finalText: string,
  onUpdate: (current: string) => void,
  duration = 700,
  isReducedMotion = false
): () => void {
  if (isReducedMotion) {
    onUpdate(finalText);
    return () => {};
  }

  const t0 = performance.now();
  let animId: number;

  function frame(now: number) {
    const progress = Math.min(1, (now - t0) / duration);
    let output = '';

    for (let i = 0; i < finalText.length; i++) {
      const char = finalText.charAt(i);
      if (char === ' ' || progress >= (i / finalText.length) * 0.85 + 0.15) {
        output += char;
      } else {
        output += GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
      }
    }

    onUpdate(output);

    if (progress < 1) {
      animId = requestAnimationFrame(frame);
    } else {
      onUpdate(finalText);
    }
  }

  animId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(animId);
  };
}

