import { createRefillBag, pullNextItem, randomIndex, shuffleList } from '../common/questionBag';
import {
  getActiveSymmetryShapesConfig,
  getBaseSymmetryShapesConfig,
} from './symmetryShapeStore';

const DEFAULT_GRID_SIZE = 5;
const DEFAULT_AXES = ['vertical', 'horizontal'];

function toPoint(point) {
  return {
    x: Number(point?.x),
    y: Number(point?.y),
  };
}

function normalizeShapes(config, gridSize) {
  const shapes = Array.isArray(config?.shapes) ? config.shapes : [];

  return shapes
    .map((shape, index) => ({
      id: typeof shape?.id === 'string' && shape.id.trim() ? shape.id.trim() : `shape-${index + 1}`,
      points: Array.isArray(shape?.points) ? shape.points.map(toPoint) : [],
    }))
    .filter(
      (shape) =>
        shape.points.length >= 3 &&
        shape.points.every(
          (point) =>
            Number.isInteger(point.x) &&
            Number.isInteger(point.y) &&
            point.x >= 0 &&
            point.x < gridSize &&
            point.y >= 0 &&
            point.y < gridSize
        )
    );
}

function createRuntimeDataset() {
  const config = getActiveSymmetryShapesConfig();
  const gridSize = Number.isInteger(config?.gridSize) ? config.gridSize : DEFAULT_GRID_SIZE;
  const axes =
    Array.isArray(config?.axes) && config.axes.length > 0 ? config.axes : DEFAULT_AXES;
  const baseShapes = normalizeShapes(config, gridSize);

  if (baseShapes.length > 0) {
    return {
      gridSize,
      axes,
      baseShapes,
      shapesById: new Map(baseShapes.map((shape) => [shape.id, shape])),
    };
  }

  const fallback = getBaseSymmetryShapesConfig();
  const fallbackGridSize = Number.isInteger(fallback?.gridSize) ? fallback.gridSize : DEFAULT_GRID_SIZE;
  const fallbackAxes =
    Array.isArray(fallback?.axes) && fallback.axes.length > 0 ? fallback.axes : DEFAULT_AXES;
  const fallbackShapes = normalizeShapes(fallback, fallbackGridSize);

  return {
    gridSize: fallbackGridSize,
    axes: fallbackAxes,
    baseShapes: fallbackShapes,
    shapesById: new Map(fallbackShapes.map((shape) => [shape.id, shape])),
  };
}

const BASE_CONFIG = getBaseSymmetryShapesConfig();
export const SYMMETRY_BASE_SHAPE_COUNT = Array.isArray(BASE_CONFIG.shapes)
  ? BASE_CONFIG.shapes.length
  : 0;

function clonePoints(points) {
  return points.map((point) => ({ ...point }));
}

function pointKey(point) {
  return `${point.x}:${point.y}`;
}

function pointsKey(points) {
  return clonePoints(points)
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map(pointKey)
    .join('|');
}

function keepInGrid(point, gridSize) {
  return point.x >= 0 && point.x < gridSize && point.y >= 0 && point.y < gridSize;
}

function shiftPoints(points, shiftX, shiftY, gridSize) {
  return points
    .map((point) => ({
      x: point.x + shiftX,
      y: point.y + shiftY,
    }))
    .filter((point) => keepInGrid(point, gridSize));
}

function seedKey(seed) {
  return `${seed.axis}|${seed.shapeId}|${seed.renderMode}`;
}

function getShapeById(shapeId, dataset) {
  return dataset.shapesById.get(shapeId) || dataset.baseShapes[0];
}

function buildAxisSeeds(axis, randomFn, dataset) {
  const seeds = [];

  for (const shape of dataset.baseShapes) {
    seeds.push({ axis, shapeId: shape.id, renderMode: 'open' });
    seeds.push({ axis, shapeId: shape.id, renderMode: 'closed' });
  }

  return shuffleList(seeds, randomFn);
}

function takeNextSeed(seeds, lastMeta, allowFallback = true) {
  return pullNextItem(
    seeds,
    (seed) => seed.shapeId !== lastMeta.shapeId && seedKey(seed) !== lastMeta.seedKey,
    allowFallback
  );
}

function buildBalancedCycle(lastMeta, randomFn, dataset) {
  const verticalSeeds = buildAxisSeeds('vertical', randomFn, dataset);
  const horizontalSeeds = buildAxisSeeds('horizontal', randomFn, dataset);
  const cycle = [];

  let preferredAxis = randomFn() < 0.5 ? 'vertical' : 'horizontal';
  let localLast = lastMeta;

  while (verticalSeeds.length > 0 || horizontalSeeds.length > 0) {
    const primary = preferredAxis === 'vertical' ? verticalSeeds : horizontalSeeds;
    const secondary = preferredAxis === 'vertical' ? horizontalSeeds : verticalSeeds;

    let next = takeNextSeed(primary, localLast, false);
    if (!next) {
      next = takeNextSeed(secondary, localLast, false);
    }
    if (!next) {
      next = takeNextSeed(primary, localLast, true) || takeNextSeed(secondary, localLast, true);
    }
    if (!next) {
      break;
    }

    cycle.push(next);
    localLast = {
      shapeId: next.shapeId,
      seedKey: seedKey(next),
    };
    preferredAxis = preferredAxis === 'vertical' ? 'horizontal' : 'vertical';
  }

  return cycle;
}

export function createSymmetryQuestionBag(randomFn = Math.random) {
  const dataset = createRuntimeDataset();
  let lastMeta = {
    shapeId: '',
    seedKey: '',
  };

  const bag = createRefillBag({
    refill: () => buildBalancedCycle(lastMeta, randomFn, dataset),
  });

  return {
    next() {
      const seed = bag.next();
      if (!seed) {
        return generateSymmetryQuestion(randomFn);
      }

      lastMeta = {
        shapeId: seed.shapeId,
        seedKey: seedKey(seed),
      };

      return buildQuestionFromSeed(seed, randomFn, dataset);
    },
  };
}

export function mirrorPointVertical(point, gridSize = DEFAULT_GRID_SIZE) {
  return {
    x: gridSize - 1 - point.x,
    y: point.y,
  };
}

export function mirrorShapeVertical(points, gridSize = DEFAULT_GRID_SIZE) {
  return points.map((point) => mirrorPointVertical(point, gridSize));
}

export function mirrorPointHorizontal(point, gridSize = DEFAULT_GRID_SIZE) {
  return {
    x: point.x,
    y: gridSize - 1 - point.y,
  };
}

export function mirrorShapeHorizontal(points, gridSize = DEFAULT_GRID_SIZE) {
  return points.map((point) => mirrorPointHorizontal(point, gridSize));
}

function transposeShape(points) {
  return points.map((point) => ({ x: point.y, y: point.x }));
}

function shapeForAxis(shape, axis) {
  if (axis === 'horizontal') {
    return transposeShape(shape);
  }
  return clonePoints(shape);
}

function mirrorShapeByAxis(points, axis, gridSize) {
  return axis === 'horizontal'
    ? mirrorShapeHorizontal(points, gridSize)
    : mirrorShapeVertical(points, gridSize);
}

function createDistractors(baseShape, correctShape, axis, gridSize) {
  const distractors = [];

  // Wrong 1: original shape (not mirrored).
  distractors.push(clonePoints(baseShape));

  // Wrong 2 + 3: mirrored shape shifted on each axis.
  if (axis === 'horizontal') {
    distractors.push(shiftPoints(correctShape, 1, 0, gridSize));
    distractors.push(shiftPoints(correctShape, 0, -1, gridSize));
  } else {
    distractors.push(shiftPoints(correctShape, 0, 1, gridSize));
    distractors.push(shiftPoints(correctShape, -1, 0, gridSize));
  }

  return distractors.filter((shape) => shape.length >= 3 && shape.length === baseShape.length);
}

function toOptionShape(shape) {
  return {
    points: clonePoints(shape),
    key: pointsKey(shape),
  };
}

function buildQuestionFromSeed(seed, randomFn, dataset) {
  const seedShape = getShapeById(seed.shapeId, dataset);
  const baseShape = shapeForAxis(seedShape.points, seed.axis);
  const correctShape = mirrorShapeByAxis(baseShape, seed.axis, dataset.gridSize);
  const renderMode = seed.renderMode;

  const options = [];
  const usedKeys = new Set();

  const correctOption = toOptionShape(correctShape);
  options.push({
    id: 'correct',
    points: correctOption.points,
    isCorrect: true,
  });
  usedKeys.add(correctOption.key);

  const distractors = createDistractors(baseShape, correctShape, seed.axis, dataset.gridSize);
  for (const shape of distractors) {
    const candidate = toOptionShape(shape);
    if (usedKeys.has(candidate.key)) {
      continue;
    }
    options.push({
      id: `wrong-${options.length}`,
      points: candidate.points,
      isCorrect: false,
    });
    usedKeys.add(candidate.key);
  }

  for (const fallbackShape of dataset.baseShapes) {
    if (options.length >= 4) {
      break;
    }

    const mirroredFallback = toOptionShape(
      mirrorShapeByAxis(shapeForAxis(fallbackShape.points, seed.axis), seed.axis, dataset.gridSize)
    );
    if (usedKeys.has(mirroredFallback.key)) {
      continue;
    }

    options.push({
      id: `wrong-${options.length}`,
      points: mirroredFallback.points,
      isCorrect: false,
    });
    usedKeys.add(mirroredFallback.key);
  }

  while (options.length < 4) {
    const randomShape = shapeForAxis(
      dataset.baseShapes[randomIndex(dataset.baseShapes.length, randomFn)].points,
      seed.axis
    );
    const shifted = toOptionShape(
      seed.axis === 'horizontal'
        ? shiftPoints(randomShape, 0, 2, dataset.gridSize)
        : shiftPoints(randomShape, 2, 0, dataset.gridSize)
    );
    if (shifted.points.length < 3 || usedKeys.has(shifted.key)) {
      continue;
    }

    options.push({
      id: `wrong-${options.length}`,
      points: shifted.points,
      isCorrect: false,
    });
    usedKeys.add(shifted.key);
  }

  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1, randomFn);
    [options[i], options[j]] = [options[j], options[i]];
  }

  const correctOptionId = options.find((option) => option.isCorrect)?.id || '';

  return {
    axis: seed.axis,
    shapeId: seed.shapeId,
    gridSize: dataset.gridSize,
    renderMode,
    prompt:
      seed.axis === 'horizontal'
        ? "Choisis la figure symétrique par rapport à l'axe horizontal."
        : "Choisis la figure symétrique par rapport à l'axe vertical.",
    baseShape,
    options,
    correctOptionId,
  };
}

export function generateSymmetryQuestion(randomFn = Math.random) {
  const dataset = createRuntimeDataset();
  const axis = dataset.axes[randomIndex(dataset.axes.length, randomFn)];
  const seedShape = dataset.baseShapes[randomIndex(dataset.baseShapes.length, randomFn)];
  const renderMode = seedShape.points.length < 3 || randomFn() < 0.5 ? 'open' : 'closed';
  return buildQuestionFromSeed({ axis, shapeId: seedShape.id, renderMode }, randomFn, dataset);
}

export function evaluateSymmetryAnswer(question, selectedOptionId) {
  if (!selectedOptionId) {
    return {
      isValid: false,
      isCorrect: false,
      message: 'Choisis une réponse avant de vérifier.',
    };
  }

  const isCorrect = selectedOptionId === question.correctOptionId;
  const axisLabel = question.axis === 'horizontal' ? 'horizontal' : 'vertical';
  return {
    isValid: true,
    isCorrect,
    message: isCorrect
      ? "Bravo ! C'est la bonne symétrie."
      : `Ce n'est pas la bonne symétrie. Observe bien l'axe ${axisLabel}.`,
  };
}
