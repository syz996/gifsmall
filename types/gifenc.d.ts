
declare module 'gifenc' {
  export interface GIFEncoder {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: Array<[number, number, number]> | Uint8Array;
        delay?: number;
        repeat?: number;
        transparent?: boolean;
        transparentIndex?: number;
        dispose?: number;
      }
    ): void;

    finish(): void;
    bytes(): Uint8Array;
  }

  export function GIFEncoder(options?: {
    auto?: boolean;
    initialCapacity?: number;
  }): GIFEncoder;

  export function quantize(
    rgba: Uint8Array,
    maxColors: number,
    options?: Record<string, unknown>
  ): Array<[number, number, number]>;

  export function applyPalette(
    rgba: Uint8Array,
    palette: Array<[number, number, number]>,
    format?: string
  ): Uint8Array;
}
