import { shuffle, type Rng } from "@/logic/rng";
import { type TilePosition } from "@/logic/stack/types";

export type Difficulty = "easy" | "medium" | "hard";

export type LayoutTemplate = {
  id: string;
  positions: TilePosition[];
  difficultyWeight: Record<Difficulty, number>;
  levelBias: number;
};

function createLayer(
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
  z: number,
): TilePosition[] {
  const positions: TilePosition[] = [];
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      positions.push({
        x: offsetX + col,
        y: offsetY + row,
        z,
      });
    }
  }
  return positions;
}

function buildTemplate(
  id: string,
  layers: Array<{ width: number; height: number; offsetX: number; offsetY: number; z: number }>,
  difficultyWeight: Record<Difficulty, number>,
  levelBias: number,
): LayoutTemplate {
  const positions = layers.flatMap((layer) =>
    createLayer(layer.width, layer.height, layer.offsetX, layer.offsetY, layer.z),
  );
  return { id, positions, difficultyWeight, levelBias };
}

const TEMPLATES: LayoutTemplate[] = [
  buildTemplate(
    "low-pyramid",
    [
      { width: 8, height: 8, offsetX: 0.5, offsetY: 0.5, z: 0 },
      { width: 4, height: 4, offsetX: 2.5, offsetY: 2.5, z: 1 },
      { width: 1, height: 1, offsetX: 4, offsetY: 4, z: 2 },
    ],
    { easy: 1.3, medium: 0.9, hard: 0.4 },
    -0.3,
  ),
  buildTemplate(
    "terraces",
    [
      { width: 9, height: 6, offsetX: 0, offsetY: 1.5, z: 0 },
      { width: 6, height: 4, offsetX: 1.5, offsetY: 2.5, z: 1 },
      { width: 3, height: 1, offsetX: 3, offsetY: 4, z: 2 },
    ],
    { easy: 0.9, medium: 1.1, hard: 0.8 },
    0,
  ),
  buildTemplate(
    "dense-core",
    [
      { width: 7, height: 7, offsetX: 1, offsetY: 1, z: 0 },
      { width: 4, height: 4, offsetX: 2.5, offsetY: 2.5, z: 1 },
      { width: 4, height: 4, offsetX: 2.5, offsetY: 2.5, z: 2 },
    ],
    { easy: 0.4, medium: 0.9, hard: 1.3 },
    0.4,
  ),
];

export function getLayoutTemplates(): LayoutTemplate[] {
  return TEMPLATES.map((template) => ({
    ...template,
    positions: [...template.positions],
  }));
}

export function pickLayoutTemplate(
  difficulty: Difficulty,
  levelNumber: number,
  rng: Rng,
): LayoutTemplate {
  const levelFactor = Math.min(1, Math.max(0, (levelNumber - 1) / 10));
  const weighted = TEMPLATES.map((template) => {
    const bias = 1 + levelFactor * template.levelBias;
    const weight = Math.max(0.05, template.difficultyWeight[difficulty] * bias);
    return { template, weight };
  });
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.template;
    }
  }
  return weighted[weighted.length - 1].template;
}

export function shufflePositions(rng: Rng, positions: TilePosition[]): TilePosition[] {
  return shuffle(rng, positions);
}

export function validateTemplate(template: LayoutTemplate): boolean {
  if (template.positions.length < 40 || template.positions.length > 81) return false;
  const seen = new Set<string>();
  for (const pos of template.positions) {
    const key = `${pos.x},${pos.y},${pos.z}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}
