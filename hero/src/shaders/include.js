// Minimal shader include: resolves `#include <lib>` in our GLSL sources.
// Vite's ?raw import gives plain strings, so this keeps the noise library in
// one file instead of pasting it into every shader.

import lib from './lib.glsl?raw';

export function resolve(src) {
  return src.replace(/^\s*#include <lib>\s*$/m, lib);
}
