import React from 'react';
import type {Theme} from './themes';

type VideoBackgroundProps = {
  theme: Theme;
  frame: number;
  fps: number;
  patternStyle: React.CSSProperties;
  accentStyle: React.CSSProperties;
};

const layerBase: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 0,
};

const hexToRgb = (hex: string): {r: number; g: number; b: number} | null => {
  const normalized = hex.trim().replace('#', '');
  if (!/^[\da-f]{6}$/i.test(normalized)) {
    return null;
  }

  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const alpha = (color: string, opacity: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return color;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

const getMotionMultiplier = (motion: Theme['backgroundLayers']['motion']) => {
  if (motion === 'energetic') {
    return 1.75;
  }

  if (motion === 'cinematic') {
    return 1.25;
  }

  if (motion === 'none') {
    return 0;
  }

  return 1;
};

const getTextureStyle = (theme: Theme, drift: number): React.CSSProperties => {
  const texture = theme.backgroundLayers.texture;
  const color = alpha(theme.line, 0.48);
  const softColor = alpha(theme.line, 0.26);

  if (texture === 'paper') {
    return {
      ...layerBase,
      backgroundImage: `radial-gradient(circle at 20% 30%, ${softColor} 0 1px, transparent 1.8px), radial-gradient(circle at 70% 60%, ${alpha(theme.text, 0.12)} 0 1px, transparent 2px)`,
      backgroundSize: '34px 34px, 58px 58px',
      backgroundPosition: `${drift * 0.3}px ${drift * 0.18}px, ${-drift * 0.22}px ${drift * 0.16}px`,
      opacity: 0.32,
    };
  }

  if (texture === 'grain') {
    return {
      ...layerBase,
      backgroundImage: `radial-gradient(${alpha(theme.text, 0.18)} 0.8px, transparent 1px), radial-gradient(${softColor} 0.6px, transparent 1px)`,
      backgroundSize: '17px 17px, 29px 29px',
      backgroundPosition: `${drift * 0.4}px ${-drift * 0.3}px, ${-drift * 0.2}px ${drift * 0.34}px`,
      opacity: 0.22,
    };
  }

  if (texture === 'scanline') {
    return {
      ...layerBase,
      backgroundImage: `repeating-linear-gradient(0deg, ${alpha(theme.line, 0.38)} 0 1px, transparent 1px 7px)`,
      backgroundPosition: `0 ${drift * 0.8}px`,
      opacity: 0.22,
    };
  }

  if (texture === 'grid') {
    return {
      ...layerBase,
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: '96px 96px',
      backgroundPosition: `${drift * 0.18}px ${drift * 0.18}px`,
      opacity: 0.16,
    };
  }

  if (texture === 'dots') {
    return {
      ...layerBase,
      backgroundImage: `radial-gradient(${color} 1.3px, transparent 1.6px)`,
      backgroundSize: '40px 40px',
      backgroundPosition: `${drift * 0.26}px ${-drift * 0.2}px`,
      opacity: 0.2,
    };
  }

  return {...layerBase, opacity: 0};
};

const getGlowStyle = (theme: Theme, time: number, drift: number): React.CSSProperties => {
  const glow = theme.backgroundLayers.glow;
  const intensity = glow.intensity;
  const scale = glow.scale;
  const x1 = 18 + Math.sin(time * 0.7) * 6;
  const y1 = 16 + Math.cos(time * 0.55) * 5;
  const x2 = 82 + Math.cos(time * 0.48) * 7;
  const y2 = 26 + Math.sin(time * 0.62) * 6;
  const x3 = 62 + Math.sin(time * 0.38) * 5;
  const y3 = 86 + Math.cos(time * 0.42) * 5;

  return {
    ...layerBase,
    backgroundImage: [
      `radial-gradient(circle at ${x1}% ${y1}%, ${alpha(theme.accent, intensity)}, transparent ${Math.round(24 * scale)}%)`,
      `radial-gradient(circle at ${x2}% ${y2}%, ${alpha(theme.accent2, intensity * 0.82)}, transparent ${Math.round(28 * scale)}%)`,
      `radial-gradient(circle at ${x3}% ${y3}%, ${alpha(theme.panel, intensity * 0.45)}, transparent ${Math.round(34 * scale)}%)`,
    ].join(', '),
    opacity: 0.95,
    transform: `translate3d(${Math.sin(time) * 18}px, ${Math.cos(time * 0.8) * 14}px, 0) scale(${1 + Math.sin(time * 0.33) * 0.018})`,
    backgroundPosition: `${drift * 0.1}px ${drift * 0.06}px`,
  };
};

const getGeometryStyle = (theme: Theme, drift: number, time: number): React.CSSProperties => {
  const geometry = theme.backgroundLayers.geometry;

  if (geometry === 'blocks') {
    return {
      ...layerBase,
      backgroundImage: `linear-gradient(115deg, transparent 0 56%, ${alpha(theme.accent, 0.1)} 56% 70%, transparent 70%), linear-gradient(18deg, transparent 0 72%, ${alpha(theme.accent2, 0.1)} 72% 82%, transparent 82%)`,
      transform: `translateX(${Math.sin(time * 0.4) * 18}px)`,
      opacity: 0.9,
    };
  }

  if (geometry === 'rings') {
    return {
      ...layerBase,
      backgroundImage: `radial-gradient(circle at 82% 24%, transparent 0 17%, ${alpha(theme.accent, 0.2)} 17.3% 17.8%, transparent 18.1% 28%, ${alpha(theme.accent2, 0.14)} 28.2% 28.6%, transparent 29%)`,
      transform: `translate3d(${Math.sin(time * 0.5) * 10}px, ${Math.cos(time * 0.5) * 10}px, 0) rotate(${Math.sin(time * 0.25) * 2}deg)`,
      opacity: 0.72,
    };
  }

  if (geometry === 'waves') {
    return {
      ...layerBase,
      backgroundImage: `repeating-radial-gradient(ellipse at 78% 18%, ${alpha(theme.accent, 0.13)} 0 2px, transparent 2px 34px)`,
      backgroundPosition: `${drift * 0.34}px ${drift * 0.2}px`,
      transform: `rotate(${Math.sin(time * 0.24) * 1.6}deg)`,
      opacity: 0.56,
    };
  }

  if (geometry === 'blueprint') {
    return {
      ...layerBase,
      backgroundImage: `linear-gradient(35deg, transparent 0 48%, ${alpha(theme.accent, 0.18)} 48.1% 48.35%, transparent 48.5%), radial-gradient(circle at 14% 18%, transparent 0 9%, ${alpha(theme.accent2, 0.18)} 9.2% 9.55%, transparent 9.8%)`,
      backgroundPosition: `${drift * 0.12}px ${-drift * 0.12}px`,
      opacity: 0.72,
    };
  }

  if (geometry === 'zine') {
    return {
      ...layerBase,
      backgroundImage: `repeating-linear-gradient(112deg, transparent 0 22px, ${alpha(theme.accent, 0.08)} 22px 24px, transparent 24px 58px)`,
      backgroundPosition: `${drift * 0.22}px ${drift * 0.12}px`,
      opacity: 0.46,
    };
  }

  return {...layerBase, opacity: 0};
};

export const VideoBackground = ({theme, frame, fps, patternStyle, accentStyle}: VideoBackgroundProps) => {
  const motion = getMotionMultiplier(theme.backgroundLayers.motion);
  const time = motion === 0 ? 0 : (frame / fps) * theme.backgroundLayers.glow.speed * motion;
  const drift = motion === 0 ? 0 : frame * theme.backgroundLayers.glow.speed * motion;

  return (
    <>
      <div style={getGlowStyle(theme, time, drift)} />
      <div style={getGeometryStyle(theme, drift, time)} />
      <div style={accentStyle} />
      <div style={patternStyle} />
      <div style={getTextureStyle(theme, drift)} />
    </>
  );
};
