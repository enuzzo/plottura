#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOKENS_CSS = path.join(ROOT, 'css', 'core', 'tokens.css');
const THEMES_DIR = path.join(ROOT, 'css', 'themes');

function parseCSSFile(filePath) {
  const css = fs.readFileSync(filePath, 'utf8');
  const results = [];
  const rootRe = /:root(?:\s*,\s*:root\[data-theme="([^"]+)"\])?\s*\{|:root\[data-theme="([^"]+)"\]\s*\{/g;
  let match;

  while ((match = rootRe.exec(css)) !== null) {
    const themeName = match[1] || match[2] || 'vibemilk-default';
    const startBrace = css.indexOf('{', match.index);
    let depth = 1;
    let i = startBrace + 1;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    const blockContent = css.slice(startBrace + 1, i - 1);
    const tokens = {};
    const propRe = /--([a-zA-Z0-9_-]+)\s*:\s*(.+?)\s*;/g;
    let propMatch;
    while ((propMatch = propRe.exec(blockContent)) !== null) {
      tokens[propMatch[1]] = propMatch[2];
    }
    results.push({ themeName, tokens });
  }

  return results;
}

function splitTopLevel(input, separatorChar) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === separatorChar && depth === 0) {
      parts.push(input.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(input.slice(start).trim());
  return parts;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function parseHex(value) {
  const hex = value.replace('#', '').trim();
  if (hex.length !== 3 && hex.length !== 4 && hex.length !== 6 && hex.length !== 8) {
    return null;
  }

  const expanded = (hex.length === 3 || hex.length === 4)
    ? hex.split('').map((char) => char + char).join('')
    : hex;

  const rgb = expanded.slice(0, 6);
  const alpha = expanded.length === 8 ? expanded.slice(6, 8) : 'ff';
  return {
    r: parseInt(rgb.slice(0, 2), 16),
    g: parseInt(rgb.slice(2, 4), 16),
    b: parseInt(rgb.slice(4, 6), 16),
    a: parseInt(alpha, 16) / 255
  };
}

function parseRgb(value) {
  const match = value.match(/^rgba?\((.+)\)$/i);
  if (!match) return null;
  const parts = splitTopLevel(match[1], ',');
  if (parts.length < 3) return null;
  return {
    r: parseFloat(parts[0]),
    g: parseFloat(parts[1]),
    b: parseFloat(parts[2]),
    a: parts[3] !== undefined ? parseFloat(parts[3]) : 1
  };
}

function formatColor(color) {
  if (!color) return 'n/a';
  const hex = [color.r, color.g, color.b]
    .map((value) => Math.round(value).toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

function composite(fg, bg) {
  const alpha = fg.a + bg.a * (1 - fg.a);
  if (alpha === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  return {
    r: ((fg.r * fg.a) + (bg.r * bg.a * (1 - fg.a))) / alpha,
    g: ((fg.g * fg.a) + (bg.g * bg.a * (1 - fg.a))) / alpha,
    b: ((fg.b * fg.a) + (bg.b * bg.a * (1 - fg.a))) / alpha,
    a: alpha
  };
}

function srgbToLinear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(color) {
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function createResolver(tokens) {
  const cache = new Map();

  function resolveColorValue(value) {
    const trimmed = value.trim();
    if (trimmed === 'transparent') {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    if (trimmed.startsWith('#')) {
      return parseHex(trimmed);
    }
    if (trimmed.startsWith('rgb')) {
      return parseRgb(trimmed);
    }
    if (trimmed.startsWith('var(')) {
      const match = trimmed.match(/^var\((--[a-zA-Z0-9_-]+)(?:,\s*(.+))?\)$/);
      if (!match) return null;
      const refName = match[1].replace(/^--/, '');
      return resolveToken(refName) || (match[2] ? resolveColorValue(match[2]) : null);
    }
    if (trimmed.startsWith('color-mix(')) {
      return resolveColorMix(trimmed);
    }
    return null;
  }

  function resolveColorMix(value) {
    const inner = value.slice('color-mix('.length, -1).trim();
    const prefix = 'in srgb,';
    if (!inner.startsWith(prefix)) return null;
    const args = splitTopLevel(inner.slice(prefix.length).trim(), ',');
    if (args.length !== 2) return null;

    const parseWeightedColor = (part) => {
      const match = part.match(/^(.*?)(?:\s+([0-9.]+)%)?$/);
      if (!match) return null;
      return {
        color: resolveColorValue(match[1]),
        weight: match[2] !== undefined ? parseFloat(match[2]) / 100 : null
      };
    };

    const first = parseWeightedColor(args[0]);
    const second = parseWeightedColor(args[1]);
    if (!first || !second || !first.color || !second.color) return null;

    const firstWeight = first.weight !== null ? first.weight : (second.weight !== null ? 1 - second.weight : 0.5);
    const secondWeight = second.weight !== null ? second.weight : 1 - firstWeight;

    return {
      r: first.color.r * firstWeight + second.color.r * secondWeight,
      g: first.color.g * firstWeight + second.color.g * secondWeight,
      b: first.color.b * firstWeight + second.color.b * secondWeight,
      a: first.color.a * firstWeight + second.color.a * secondWeight
    };
  }

  function resolveToken(tokenName) {
    if (cache.has(tokenName)) return cache.get(tokenName);
    const raw = tokens[tokenName];
    if (!raw) return null;
    const resolved = resolveColorValue(raw);
    cache.set(tokenName, resolved);
    return resolved;
  }

  return resolveToken;
}

function mix(a, b, ratioA) {
  const ratioB = 1 - ratioA;
  return {
    r: a.r * ratioA + b.r * ratioB,
    g: a.g * ratioA + b.g * ratioB,
    b: a.b * ratioA + b.b * ratioB,
    a: a.a * ratioA + b.a * ratioB
  };
}

const defaultResult = parseCSSFile(TOKENS_CSS).find((result) => result.themeName === 'vibemilk-default');
const defaultTokens = defaultResult.tokens;
const themeFiles = fs.readdirSync(THEMES_DIR).filter((name) => name.endsWith('.css')).sort();

const themeMaps = [{ name: 'vibemilk-default', tokens: defaultTokens }];
for (const fileName of themeFiles) {
  const filePath = path.join(THEMES_DIR, fileName);
  const parsed = parseCSSFile(filePath)[0];
  if (!parsed) continue;
  themeMaps.push({
    name: parsed.themeName,
    tokens: { ...defaultTokens, ...parsed.tokens }
  });
}

const results = themeMaps.map(({ name, tokens }) => {
  const resolve = createResolver(tokens);
  const bgSurface = resolve('bg-surface');
  const bgElevated = resolve('bg-elevated');
  const panelBg = composite(resolve('gui-panel-bg'), bgSurface);
  const guiLabel = composite(resolve('gui-label-color'), panelBg);
  const guiValue = composite(resolve('gui-value-color'), panelBg);
  const guiThumb = composite(resolve('gui-slider-thumb'), panelBg);
  const guiTrack = composite(resolve('gui-slider-track'), panelBg);
  const scrollbarTrack = composite(resolve('scrollbar-track'), bgSurface);
  const scrollbarThumb = composite(resolve('scrollbar-thumb'), scrollbarTrack);
  const scrollbarThumbHover = composite(resolve('scrollbar-thumb-hover'), scrollbarTrack);

  const segmentedBg = composite(mix(bgSurface, bgElevated, 0.74), bgSurface);
  const segmentedText = composite(resolve('text-secondary'), segmentedBg);
  const stepperBtnBg = composite(mix(bgElevated, resolve('accent-primary-subtle'), 0.88), composite(mix(bgSurface, bgElevated, 0.78), bgSurface));
  const stepperText = composite(resolve('text-primary'), stepperBtnBg);

  return {
    name,
    panelBg: formatColor(panelBg),
    scrollbarTrack: formatColor(scrollbarTrack),
    metrics: {
      guiLabelOnPanel: contrastRatio(guiLabel, panelBg),
      guiValueOnPanel: contrastRatio(guiValue, panelBg),
      guiTrackOnPanel: contrastRatio(guiTrack, panelBg),
      guiThumbOnPanel: contrastRatio(guiThumb, panelBg),
      scrollbarThumbOnTrack: contrastRatio(scrollbarThumb, scrollbarTrack),
      scrollbarThumbHoverOnTrack: contrastRatio(scrollbarThumbHover, scrollbarTrack),
      segmentedTextOnBg: contrastRatio(segmentedText, segmentedBg),
      stepperTextOnBtn: contrastRatio(stepperText, stepperBtnBg)
    }
  };
});

const metricLabels = [
  ['guiLabelOnPanel', 'GUI label / panel'],
  ['guiValueOnPanel', 'GUI value / panel'],
  ['guiTrackOnPanel', 'GUI track / panel'],
  ['guiThumbOnPanel', 'GUI thumb / panel'],
  ['scrollbarThumbOnTrack', 'Scrollbar thumb / track'],
  ['scrollbarThumbHoverOnTrack', 'Scrollbar thumb hover / track'],
  ['segmentedTextOnBg', 'Segmented text / bg'],
  ['stepperTextOnBtn', 'Stepper text / button']
];

for (const [metricKey, label] of metricLabels) {
  const sorted = [...results].sort((a, b) => a.metrics[metricKey] - b.metrics[metricKey]).slice(0, 5);
  console.log(`\n${label}`);
  console.log('-'.repeat(label.length));
  for (const result of sorted) {
    console.log(
      `${result.name.padEnd(18)} ${result.metrics[metricKey].toFixed(2)}  panel ${result.panelBg}  track ${result.scrollbarTrack}`
    );
  }
}

console.log('\nPotential risk themes');
console.log('---------------------');
for (const result of results) {
  const risks = [];
  if (result.metrics.guiLabelOnPanel < 4.5) risks.push(`labels ${result.metrics.guiLabelOnPanel.toFixed(2)}`);
  if (result.metrics.guiTrackOnPanel < 3) risks.push(`track ${result.metrics.guiTrackOnPanel.toFixed(2)}`);
  if (result.metrics.guiThumbOnPanel < 3) risks.push(`thumb ${result.metrics.guiThumbOnPanel.toFixed(2)}`);
  if (result.metrics.scrollbarThumbOnTrack < 2.2) risks.push(`scroll ${result.metrics.scrollbarThumbOnTrack.toFixed(2)}`);
  if (result.metrics.segmentedTextOnBg < 4.5) risks.push(`segmented ${result.metrics.segmentedTextOnBg.toFixed(2)}`);
  if (risks.length > 0) {
    console.log(`${result.name}: ${risks.join(', ')}`);
  }
}
