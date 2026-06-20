/**
 * Unit conversions for the dual m/ft altitude display.
 * Example: 5630 -> "18,471"
 */

export function mToFt(metres: number): number {
  return Math.round(metres * 3.28084);
}

export function mToFtString(metres: number): string {
  return mToFt(metres).toLocaleString('en-US');
}

export function formatAltitude(metres: number): string {
  // Dual unit display: "5,630 m (18,471 ft)"
  return metres.toLocaleString('en-US') + ' m (' + mToFtString(metres) + ' ft)';
}
