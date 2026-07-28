import type { Land, LandscapeType } from '.';

export function initializeLands(landscapes: readonly LandscapeType[]): Land[] {
  return landscapes.map((landscape) => ({
    landscape,
    creature: undefined,
    building: undefined,
  }));
}
