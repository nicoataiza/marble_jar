export const MARBLE_RADIUS = 0.13;
const TARGET_PACKING_DENSITY = 0.54;
const JAR_HEIGHT_RATIO = 1.12;

export type JarDimensions = {
  width: number;
  height: number;
  depth: number;
  columns: number;
  rows: number;
  layers: number;
  layerCapacity: number;
};

export function getJarDimensions(maxCapacity: number): JarDimensions {
  const marbleVolume = (4 / 3) * Math.PI * MARBLE_RADIUS ** 3;
  const targetVolume = (marbleVolume * maxCapacity) / TARGET_PACKING_DENSITY;
  const width = Math.max(
    MARBLE_RADIUS * 4.1,
    Math.cbrt(targetVolume / JAR_HEIGHT_RATIO)
  );
  const depth = width;
  const height = Math.max(MARBLE_RADIUS * 4.1, width * JAR_HEIGHT_RATIO);
  const columns = Math.max(1, Math.floor((width - MARBLE_RADIUS) / (MARBLE_RADIUS * 2)));
  const rows = Math.max(1, Math.floor((depth - MARBLE_RADIUS) / (MARBLE_RADIUS * 2)));
  const layers = Math.max(1, Math.ceil(maxCapacity / (columns * rows)));
  const layerCapacity = columns * rows;

  return {
    width,
    height,
    depth,
    columns,
    rows,
    layers,
    layerCapacity,
  };
}

export function getMarbleLayer(index: number, dimensions: JarDimensions) {
  return Math.floor(index / dimensions.layerCapacity);
}
