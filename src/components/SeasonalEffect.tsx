import { useEffect, useRef } from "react";
import type { HeaderLogoEffect } from "@/lib/api";

type ParticleEffect = Exclude<HeaderLogoEffect, "none">;
type Motion = "fall" | "rise" | "fly" | "twinkle";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  rotation: number;
  spin: number;
  color: string;
  alpha: number;
  glyph: string;
}

interface EffectConfig {
  palette: string[];
  size: [number, number];
  motion: Motion;
}

const EFFECTS: Record<ParticleEffect, EffectConfig> = {
  snow: { palette: ["#ffffff"], size: [1.2, 2.6], motion: "fall" },
  leaves: { palette: ["#f59e0b", "#ea580c", "#facc15", "#b45309"], size: [3.5, 6], motion: "fall" },
  petals: { palette: ["#fbcfe8", "#f9a8d4", "#ffffff"], size: [2.5, 4.5], motion: "fall" },
  hearts: { palette: ["#fda4af", "#fb7185", "#fecdd3"], size: [3, 5], motion: "fall" },
  confetti: { palette: ["#facc15", "#f472b6", "#60a5fa", "#4ade80", "#ffffff"], size: [2, 3.5], motion: "fall" },
  tricolor: { palette: ["#ffffff", "#00966e", "#d62612"], size: [2, 3.5], motion: "fall" },
  martenitsa: { palette: ["#dc2626"], size: [2.5, 3.5], motion: "fall" },
  eggs: { palette: ["#ef4444", "#facc15", "#3b82f6", "#a855f7", "#22c55e"], size: [4, 6], motion: "fall" },
  letters: { palette: ["#ffffff", "#fde68a"], size: [7, 11], motion: "fall" },
  balloons: { palette: ["#f87171", "#facc15", "#60a5fa", "#4ade80", "#f472b6"], size: [4, 6], motion: "rise" },
  bats: { palette: ["#111827"], size: [4, 6.5], motion: "fly" },
  stars: { palette: ["#ffffff", "#fde68a"], size: [1.5, 3], motion: "twinkle" },
};

const SPARSE_EFFECTS = new Set<ParticleEffect>(["letters", "martenitsa", "eggs"]);

const ALPHABET ="АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ";

const random = (min: number, max: number) => min + Math.random() * (max - min);

const createParticle = (effect: ParticleEffect, width: number, height: number, anywhere: boolean): Particle => {
  const { palette, size: [minSize, maxSize], motion } = EFFECTS[effect];
  const size = random(minSize, maxSize);
  let x = random(0, width);
  let y = anywhere ? random(0, height) : random(-12, -4);
  if (!anywhere && motion === "rise") y = height + size * 3;
  if (!anywhere && motion === "fly") {
    x = -size * 3;
    y = random(size, height - size);
  }
  return {
    x,
    y,
    size,
    speed: motion === "twinkle" ? random(1, 3) : motion === "fly" ? random(30, 55) : random(8, 18),
    drift: random(4, 12),
    phase: random(0, Math.PI * 2),
    rotation: motion === "rise" || motion === "fly" ? 0 : random(0, Math.PI * 2),
    spin: effect === "letters" || effect === "eggs" ? random(-0.6, 0.6) : random(-1.5, 1.5),
    color: palette[Math.floor(Math.random() * palette.length)],
    alpha: random(0.5, 0.9),
    glyph: ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
  };
};

const starPath = (context: CanvasRenderingContext2D, size: number) => {
  for (let point = 0; point < 10; point += 1) {
    const radius = point % 2 === 0 ? size : size * 0.45;
    const angle = (point * Math.PI) / 5 - Math.PI / 2;
    context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  context.closePath();
};

const drawParticle = (context: CanvasRenderingContext2D, effect: ParticleEffect, particle: Particle) => {
  const { size } = particle;
  context.save();
  context.globalAlpha = effect === "stars"
    ? particle.alpha * (0.35 + 0.65 * Math.abs(Math.sin(particle.phase * 1.6)))
    : particle.alpha;
  context.fillStyle = particle.color;
  context.strokeStyle = particle.color;
  context.translate(particle.x, particle.y);
  context.rotate(particle.rotation);
  context.beginPath();
  switch (effect) {
    case "snow":
      context.arc(0, 0, size, 0, Math.PI * 2);
      break;
    case "confetti":
    case "tricolor":
      context.rect(-size, -size / 2, size * 2, size);
      break;
    case "hearts":
      context.moveTo(0, size * 0.35);
      context.bezierCurveTo(-size, -size * 0.4, -size * 0.4, -size, 0, -size * 0.35);
      context.bezierCurveTo(size * 0.4, -size, size, -size * 0.4, 0, size * 0.35);
      break;
    case "stars":
      starPath(context, size);
      break;
    case "martenitsa":
      // Пижо и Пенда: a red and a white tassel tied with a twisted thread.
      context.lineWidth = 0.8;
      context.strokeStyle = "#fecaca";
      context.moveTo(-size * 1.4, -size * 2.2);
      context.lineTo(size * 1.4, -size * 2.2);
      context.stroke();
      context.beginPath();
      context.fillStyle = "#dc2626";
      context.arc(-size * 1.4, 0, size, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.fillStyle = "#ffffff";
      context.arc(size * 1.4, 0, size, 0, Math.PI * 2);
      break;
    case "eggs":
      context.ellipse(0, 0, size * 0.8, size, 0, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.fillStyle = "rgba(255,255,255,0.75)";
      context.rect(-size * 0.8, -size * 0.15, size * 1.6, size * 0.3);
      break;
    case "letters":
      context.font = `700 ${size}px Georgia, "Times New Roman", serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(particle.glyph, 0, 0);
      break;
    case "balloons":
      context.ellipse(0, 0, size * 0.8, size, 0, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.lineWidth = 0.6;
      context.strokeStyle = "rgba(255,255,255,0.7)";
      context.moveTo(0, size);
      context.quadraticCurveTo(size * 0.4, size * 1.8, 0, size * 2.6);
      context.stroke();
      context.restore();
      return;
    case "bats": {
      const flap = Math.sin(particle.phase * 9) * size * 0.6;
      context.moveTo(0, 0);
      context.quadraticCurveTo(-size, -size * 0.2 - flap, -size * 2, -flap);
      context.quadraticCurveTo(-size * 1.2, size * 0.1, -size * 0.6, size * 0.4);
      context.quadraticCurveTo(-size * 0.3, size * 0.2, 0, size * 0.5);
      context.quadraticCurveTo(size * 0.3, size * 0.2, size * 0.6, size * 0.4);
      context.quadraticCurveTo(size * 1.2, size * 0.1, size * 2, -flap);
      context.quadraticCurveTo(size, -size * 0.2 - flap, 0, 0);
      break;
    }
    default:
      context.ellipse(0, 0, size, size * (effect === "leaves" ? 0.5 : 0.65), 0, 0, Math.PI * 2);
  }
  context.fill();
  context.restore();
};

const isOutside = (motion: Motion, particle: Particle, width: number, height: number) => {
  const margin = particle.size * 3;
  if (motion === "rise") return particle.y < -margin;
  if (motion === "fly") return particle.x > width + margin;
  if (motion === "twinkle") return particle.y > height + margin;
  return particle.y - particle.size > height;
};

// Light decorative particles behind the header content. Only mounted when motion is allowed.
const SeasonalEffect = ({ effect }: { effect: ParticleEffect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const { motion } = EFFECTS[effect];
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let last = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Big shapes (balloons, bats, letters...) look busy quickly, so they get fewer particles.
      const density = motion === "fall" && !SPARSE_EFFECTS.has(effect) ? 40 : 90;
      const count = Math.min(40, Math.max(6, Math.round(width / density)));
      particles = Array.from({ length: count }, (_, index) => particles[index] ?? createParticle(effect, width, height, true));
    };

    const tick = (time: number) => {
      const delta = last ? Math.min((time - last) / 1000, 0.1) : 0;
      last = time;
      context.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        particle.phase += delta;
        if (motion === "fly") {
          particle.x += particle.speed * delta;
          particle.y += Math.sin(particle.phase * 2) * particle.drift * delta;
        } else {
          particle.y += (motion === "rise" ? -particle.speed : particle.speed) * delta;
          particle.x += Math.sin(particle.phase) * particle.drift * delta;
          if (motion === "fall") particle.rotation += particle.spin * delta;
        }
        if (isOutside(motion, particle, width, height)) particles[index] = createParticle(effect, width, height, false);
        drawParticle(context, effect, particles[index]);
      });
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    start();
    document.addEventListener("visibilitychange", start);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, [effect]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
};

export default SeasonalEffect;
