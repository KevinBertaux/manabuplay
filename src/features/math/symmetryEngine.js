import symmetryShapesConfig from '../../content/math/symmetry-shapes.v1.json';

const DEFAULT_GRID_SIZE = 5;
const DEFAULT_AXES = ['vertical', 'horizontal'];

function toPoint(point) {
  return {
    x: Number(point?.x),
    y: Number(point?.y),
  };
}

function normalizeShapes(config) {
  const shapes = Array.isArray(config?.shapes) ? config.shapes : [];

  return shapes
    .map((shape) => (Array.isArray(shape?.points) ? shape.points.map(toPoint) : []))
    .filter((points) =>
      points.every((point) => Number.isInteger(point.x) && Number.isInteger(point.y))
    );
}

const GRID_SIZE = Number.isInteger(symmetryShapesConfig?.gridSize)
  ? symmetryShapesConfig.gridSize
  : DEFAULT_GRID_SIZE;
const AXES =
  Array.isArray(symmetryShapesConfig?.axes) && symmetryShapesConfig.axes.length > 0
    ? symmetryShapesConfig.axes
    : DEFAULT_AXES;

// Shapes are authored for vertical mode (left side of the axis) and re-used for
// horizontal mode via transposition.
const BASE_SHAPES = normalizeShapes(symmetryShapesConfig);

if (BASE_SHAPES.length === 0) {
  throw new Error('Symmetry shapes dataset is empty or invalid.');
}

export const SYMMETRY_BASE_SHAPE_COUNT = BASE_SHAPES.length;

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

function keepInGrid(point) {
  return point.x >= 0 && point.x < GRID_SIZE && point.y >= 0 && point.y < GRID_SIZE;
}

function shiftPoints(points, shiftX, shiftY) {
  return points
    .map((point) => ({
      x: point.x + shiftX,
      y: point.y + shiftY,
    }))
    .filter(keepInGrid);
}

function randomIndex(length, randomFn) {
  return Math.floor(randomFn() * length);
}

function pickRenderMode(baseShape, randomFn) {
  if (baseShape.length < 3) {
    return 'open';
  }
  return randomFn() < 0.5 ? 'open' : 'closed';
}

export function mirrorPointVertical(point, gridSize = GRID_SIZE) {
  return {
    x: gridSize - 1 - point.x,
    y: point.y,
  };
}

export function mirrorShapeVertical(points, gridSize = GRID_SIZE) {
  return points.map((point) => mirrorPointVertical(point, gridSize));
}

export function mirrorPointHorizontal(point, gridSize = GRID_SIZE) {
  return {
    x: point.x,
    y: gridSize - 1 - point.y,
  };
}

export function mirrorShapeHorizontal(points, gridSize = GRID_SIZE) {
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

function mirrorShapeByAxis(points, axis) {
  return axis === 'horizontal' ? mirrorShapeHorizontal(points) : mirrorShapeVertical(points);
}

function createDistractors(baseShape, correctShape, axis) {
  const distractors = [];

  // Wrong 1: original shape (not mirrored).
  distractors.push(clonePoints(baseShape));

  // Wrong 2 + 3: mirrored shape shifted on each axis.
  if (axis === 'horizontal') {
    distractors.push(shiftPoints(correctShape, 1, 0));
    distractors.push(shiftPoints(correctShape, 0, -1));
  } else {
    distractors.push(shiftPoints(correctShape, 0, 1));
    distractors.push(shiftPoints(correctShape, -1, 0));
  }

  return distractors.filter((shape) => shape.length >= 3 && shape.length === baseShape.length);
}

function toOptionShape(shape) {
  return {
    points: clonePoints(shape),
    key: pointsKey(shape),
  };
}

export function generateSymmetryQuestion(randomFn = Math.random) {
  const axis = AXES[randomIndex(AXES.length, randomFn)];
  const seedShape = BASE_SHAPES[randomIndex(BASE_SHAPES.length, randomFn)];
  const baseShape = shapeForAxis(seedShape, axis);
  const correctShape = mirrorShapeByAxis(baseShape, axis);
  const renderMode = pickRenderMode(baseShape, randomFn);

  const options = [];
  const usedKeys = new Set();

  const correctOption = toOptionShape(correctShape);
  options.push({
    id: 'correct',
    points: correctOption.points,
    isCorrect: true,
  });
  usedKeys.add(correctOption.key);

  const distractors = createDistractors(baseShape, correctShape, axis);
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

  for (const fallbackShape of BASE_SHAPES) {
    if (options.length >= 4) {
      break;
    }

    const mirroredFallback = toOptionShape(mirrorShapeByAxis(shapeForAxis(fallbackShape, axis), axis));
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
    const randomShape = shapeForAxis(BASE_SHAPES[randomIndex(BASE_SHAPES.length, randomFn)], axis);
    const shifted = toOptionShape(
      axis === 'horizontal' ? shiftPoints(randomShape, 0, 2) : shiftPoints(randomShape, 2, 0)
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
    axis,
    gridSize: GRID_SIZE,
    renderMode,
    prompt:
      axis === 'horizontal'
        ? "Choisis la figure symétrique par rapport à l'axe horizontal."
        : "Choisis la figure symétrique par rapport à l'axe vertical.",
    baseShape,
    options,
    correctOptionId,
  };
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
      ? 'Bravo ! C\'est la bonne symétrie.'
      : `Ce n'est pas la bonne symétrie. Observe bien l'axe ${axisLabel}.`,
  };
}
