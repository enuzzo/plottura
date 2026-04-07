#!/usr/bin/env node
// ============================================================
// Vibemilk Design System - Token Build Script
// Reads CSS custom properties from tokens.css and theme files,
// then exports to JSON, Swift, Rust, C (RGB565), and Elementor.
// ============================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOKENS_CSS = path.join(ROOT, 'css', 'core', 'tokens.css');
const THEMES_DIR = path.join(ROOT, 'css', 'themes');
const OUTPUT_DIR = path.join(ROOT, 'tokens');
const VERSION = '3.0.0';

// ============================================================
// 1. CSS Parsing
// ============================================================

/**
 * Extract CSS custom properties from a :root or :root[data-theme="..."] block.
 * Returns { themeName: string, tokens: { [varName]: value } }
 */
function parseCSSFile(filePath) {
  const css = fs.readFileSync(filePath, 'utf8');
  const results = [];

  // Find :root blocks and balance braces to handle nested content (gradients, etc.)
  const rootRe = /:root(?:\s*,\s*:root\[data-theme="([^"]+)"\])?\s*\{|:root\[data-theme="([^"]+)"\]\s*\{/g;
  let match;

  while ((match = rootRe.exec(css)) !== null) {
    const themeName = match[1] || match[2] || 'vibemilk-default';
    const startBrace = css.indexOf('{', match.index);
    if (startBrace === -1) continue;

    // Balance braces to find the end of the block
    let depth = 1;
    let i = startBrace + 1;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    const blockContent = css.slice(startBrace + 1, i - 1);

    // Extract --property: value pairs
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

// ============================================================
// 2. Token Categorization
// ============================================================

/**
 * Categorize a token name into a design-token category.
 */
function categorize(name) {
  // Order matters: more specific prefixes first
  if (name === 'theme-id') return 'meta';
  if (name.startsWith('font-icons')) return 'icons';
  if (name.startsWith('font-family') || name.startsWith('font-mono')) return 'typography';
  if (name.startsWith('fs-')) return 'typography';
  if (name.startsWith('fw-')) return 'typography';
  if (name.startsWith('bg-')) return 'color';
  if (name.startsWith('text-')) return 'color';
  if (name.startsWith('accent-')) return 'color';
  if (name.startsWith('color-')) return 'color';
  if (name.startsWith('gradient-')) return 'gradient';
  if (name.startsWith('space-')) return 'spacing';
  if (name.startsWith('radius-')) return 'radius';
  if (name.startsWith('shadow-')) return 'shadow';
  if (name.startsWith('stroke-')) return 'stroke';
  if (name.startsWith('border-')) return 'border';
  if (name.startsWith('transition-')) return 'transition';
  if (name.startsWith('z-')) return 'zIndex';
  if (name.startsWith('container-')) return 'layout';
  if (name.startsWith('sidebar-') || name.startsWith('topbar-')) return 'layout';
  if (name.startsWith('btn-') || name.startsWith('input-') || name.startsWith('progress-')
    || name.startsWith('toggle-') || name.startsWith('avatar-') || name.startsWith('gui-')
    || name.startsWith('scrollbar-')) return 'component';
  if (name.startsWith('selection-') || name.startsWith('surface-') || name.startsWith('card-')
    || name.startsWith('table-') || name.startsWith('divider-') || name.startsWith('skeleton-')
    || name.startsWith('focus-') || name.startsWith('loader-') || name.startsWith('control-')
    || name.startsWith('range-') || name.startsWith('status-') || name.startsWith('nerds-')
    || name.startsWith('select-')) return 'effect';
  if (name.startsWith('fx-')) return 'animation';
  if (name.startsWith('cyber-') || name.startsWith('mint-') || name.startsWith('acid-')
    || name.startsWith('tokyo-') || name.startsWith('mono-')) return 'themeSpecific';
  return 'misc';
}

/**
 * Determine the token type for structured output.
 */
function tokenType(name, value) {
  if (name.startsWith('font-icons')) return 'fontFamily';
  if (name.startsWith('font-family') || name.startsWith('font-mono')) return 'fontFamily';
  if (name.startsWith('fs-')) return 'fontSize';
  if (name.startsWith('fw-')) return 'fontWeight';
  if (value.startsWith('linear-gradient') || value.startsWith('radial-gradient')
    || value.startsWith('repeating-linear-gradient')) return 'gradient';
  if (/^#[0-9A-Fa-f]{3,8}$/.test(value)) return 'color';
  if (value.startsWith('rgba(') || value.startsWith('rgb(')) return 'color';
  if (/^\d+px$/.test(value)) return 'dimension';
  if (/^\d+$/.test(value)) return 'number';
  if (/^\d+m?s\s/.test(value) || name.startsWith('transition-')) return 'transition';
  if (name.startsWith('shadow-') || name.startsWith('focus-ring') || name.startsWith('status-glow')
    || name.startsWith('control-handle-shadow') || name.startsWith('range-thumb-shadow')) return 'shadow';
  if (value.startsWith('var(')) return 'reference';
  if (value.includes('solid') || value.includes('dashed')) return 'border';
  return 'string';
}

/**
 * Build a structured JSON object from a flat token map.
 */
function structureTokens(tokens, themeName) {
  const structured = {
    meta: {
      theme: themeName,
      version: VERSION,
      generated: new Date().toISOString()
    }
  };

  for (const [name, value] of Object.entries(tokens)) {
    if (name === 'theme-id') continue; // skip meta token
    const cat = categorize(name);
    if (!structured[cat]) structured[cat] = {};
    structured[cat][name] = {
      value,
      type: tokenType(name, value)
    };
  }

  return structured;
}

// ============================================================
// 3. Output Generators
// ============================================================

/**
 * Convert a CSS token name to a Swift-compatible camelCase identifier.
 * e.g. "bg-deepest" -> "bgDeepest", "fs-display-xl" -> "fsDisplayXl"
 */
function toSwiftName(name) {
  return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/**
 * Convert a CSS token name to a Rust SCREAMING_SNAKE_CASE identifier.
 * e.g. "bg-deepest" -> "BG_DEEPEST"
 */
function toRustName(name) {
  return name.replace(/-/g, '_').toUpperCase();
}

/**
 * Convert a CSS token name to a C macro SCREAMING_SNAKE_CASE identifier.
 * e.g. "bg-deepest" -> "VM_BG_DEEPEST"
 */
function toCName(name) {
  return 'VM_' + name.replace(/-/g, '_').toUpperCase();
}

/**
 * Parse a hex color (#RRGGBB, #RGB, #RRGGBBAA, #RGBA) to { r, g, b } (0-255).
 * Alpha channel is stripped if present.
 */
function hexToRGB(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3 || hex.length === 4) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  } else if (hex.length === 8) {
    hex = hex.substring(0, 6);
  }
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}

/**
 * Convert RGB (0-255 each) to RGB565 16-bit value for ESP32 displays.
 * RGB565: RRRRRGGGGGGBBBBB
 */
function rgbToRGB565(r, g, b) {
  const r5 = (r >> 3) & 0x1F;
  const g6 = (g >> 2) & 0x3F;
  const b5 = (b >> 3) & 0x1F;
  return (r5 << 11) | (g6 << 5) | b5;
}

/**
 * Try to extract a solid hex color from a value (for C header).
 * Returns the hex string or null if it can't be parsed as a simple color.
 */
function extractHexColor(value) {
  const hexMatch = value.match(/^#([0-9A-Fa-f]{3,8})$/);
  if (hexMatch) return value;

  // Try rgba with alpha = 1 or rgb
  const rgbMatch = value.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return null;
}

// --- JSON ---
function generateJSON(tokens, themeName) {
  return JSON.stringify(structureTokens(tokens, themeName), null, 2);
}

// --- Swift ---
function generateSwift(tokens, themeName) {
  const suffix = themeName.replace(/^vibemilk-/, '')
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  const structName = 'VibemilkTokens' + suffix;

  let out = `// Vibemilk Design System v${VERSION}\n`;
  out += `// Theme: ${themeName}\n`;
  out += `// Auto-generated by build-tokens.js -- do not edit\n\n`;
  out += `struct ${structName} {\n`;

  for (const [name, value] of Object.entries(tokens)) {
    if (name === 'theme-id') continue;
    const swiftName = toSwiftName(name);
    // Escape for Swift string literal
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    out += `    static let ${swiftName} = "${escaped}"\n`;
  }

  out += `}\n`;
  return out;
}

// --- Rust ---
function generateRust(tokens, themeName) {
  let out = `// Vibemilk Design System v${VERSION}\n`;
  out += `// Theme: ${themeName}\n`;
  out += `// Auto-generated by build-tokens.js -- do not edit\n\n`;
  out += `#![allow(dead_code)]\n\n`;

  for (const [name, value] of Object.entries(tokens)) {
    if (name === 'theme-id') continue;
    const rustName = toRustName(name);
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    out += `pub const ${rustName}: &str = "${escaped}";\n`;
  }

  return out;
}

// --- C Header (ESP32 RGB565) ---
function generateCHeader(tokens, themeName) {
  const guard = `VIBEMILK_${themeName.replace(/-/g, '_').toUpperCase()}_H`;

  let out = `/* Vibemilk Design System v${VERSION} */\n`;
  out += `/* Theme: ${themeName} */\n`;
  out += `/* Auto-generated by build-tokens.js -- do not edit */\n`;
  out += `/* Colors are RGB565 for ESP32 TFT displays */\n\n`;
  out += `#ifndef ${guard}\n`;
  out += `#define ${guard}\n\n`;
  out += `#include <stdint.h>\n\n`;

  // Only export colors as RGB565, and dimension/number tokens as integers
  for (const [name, value] of Object.entries(tokens)) {
    if (name === 'theme-id') continue;
    const cName = toCName(name);

    // Try to convert hex colors to RGB565
    const hex = extractHexColor(value);
    if (hex && hex.length >= 4) {
      const { r, g, b } = hexToRGB(hex);
      const rgb565 = rgbToRGB565(r, g, b);
      out += `#define ${cName} 0x${rgb565.toString(16).toUpperCase().padStart(4, '0')}  /* ${value} */\n`;
      continue;
    }

    // Integer/dimension values (e.g. 400, 16px)
    const numMatch = value.match(/^(\d+)(px)?$/);
    if (numMatch) {
      out += `#define ${cName} ${numMatch[1]}\n`;
      continue;
    }

    // String values as C string macros
    if (!value.includes('\n') && value.length < 200) {
      const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      out += `#define ${cName} "${escaped}"\n`;
    }
  }

  out += `\n#endif /* ${guard} */\n`;
  return out;
}

// --- Elementor V4 Variables Manager ---
function generateElementor(tokens, themeName) {
  const variables = [];

  for (const [name, value] of Object.entries(tokens)) {
    if (name === 'theme-id') continue;

    // Determine Elementor variable type
    let type = 'Size';
    const tt = tokenType(name, value);
    if (tt === 'color') type = 'Color';
    else if (tt === 'fontFamily' || tt === 'fontSize' || tt === 'fontWeight') type = 'Typography';

    // Build a human-readable label from the token name
    const label = name
      .split('-')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    variables.push({
      name: label,
      type,
      value
    });
  }

  const output = {
    meta: {
      theme: themeName,
      version: VERSION,
      generated: new Date().toISOString(),
      format: 'elementor-v4-variables'
    },
    variables
  };

  return JSON.stringify(output, null, 2);
}

// ============================================================
// 4. Main Build Pipeline
// ============================================================

function main() {
  console.log(`\n  Vibemilk Token Builder v${VERSION}`);
  console.log('  ================================\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('  Created tokens/ directory');
  }

  // --- Parse default tokens ---
  console.log('  Parsing css/core/tokens.css ...');
  const defaultResults = parseCSSFile(TOKENS_CSS);
  if (defaultResults.length === 0) {
    console.error('  ERROR: No token block found in tokens.css');
    process.exit(1);
  }
  const defaultTokens = defaultResults[0].tokens;
  const tokenCount = Object.keys(defaultTokens).length;
  console.log(`  Found ${tokenCount} default tokens\n`);

  // --- Collect all themes: default + theme overrides ---
  const themes = [{ name: 'vibemilk-default', tokens: { ...defaultTokens } }];

  // --- Parse theme files ---
  if (fs.existsSync(THEMES_DIR)) {
    const themeFiles = fs.readdirSync(THEMES_DIR).filter(f => f.endsWith('.css')).sort();
    console.log(`  Found ${themeFiles.length} theme files:`);

    for (const file of themeFiles) {
      const filePath = path.join(THEMES_DIR, file);
      const results = parseCSSFile(filePath);

      for (const result of results) {
        // Merge: start with default tokens, override with theme tokens
        const merged = { ...defaultTokens, ...result.tokens };
        themes.push({ name: result.themeName, tokens: merged });
        const overrideCount = Object.keys(result.tokens).length;
        console.log(`    ${result.themeName} (${overrideCount} overrides, ${Object.keys(merged).length} total)`);
      }
    }
  }

  console.log('');

  // --- Generate outputs for each theme ---
  for (const theme of themes) {
    const baseName = theme.name;
    console.log(`  Generating ${baseName} ...`);

    // JSON
    const jsonPath = path.join(OUTPUT_DIR, `${baseName}.json`);
    fs.writeFileSync(jsonPath, generateJSON(theme.tokens, baseName));

    // Swift
    const swiftPath = path.join(OUTPUT_DIR, `${baseName}.swift`);
    fs.writeFileSync(swiftPath, generateSwift(theme.tokens, baseName));

    // Rust
    const rustPath = path.join(OUTPUT_DIR, `${baseName}.rs`);
    fs.writeFileSync(rustPath, generateRust(theme.tokens, baseName));

    // C Header (RGB565)
    const hPath = path.join(OUTPUT_DIR, `${baseName}.h`);
    fs.writeFileSync(hPath, generateCHeader(theme.tokens, baseName));

    // Elementor V4
    const elementorPath = path.join(OUTPUT_DIR, `${baseName}.elementor.json`);
    fs.writeFileSync(elementorPath, generateElementor(theme.tokens, baseName));

    console.log(`    -> ${baseName}.json, .swift, .rs, .h, .elementor.json`);
  }

  const totalFiles = themes.length * 5;
  console.log(`\n  Done! Generated ${totalFiles} files for ${themes.length} themes.\n`);
}

main();
