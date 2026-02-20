const GRID_SIZE = 5;
const AXIS = 'vertical';

const BASE_SHAPES = [
  [
    { x: 0, y: 1 },
    { x: 1, y: 2 },
    { x: 0, y: 3 },
  ],
  [
    { x: 1, y: 0 },
    { x: 0, y: 2 },
    { x: 1, y: 4 },
  ],
  [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 0, y: 4 },
  ],
  [
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 1, y: 3 },
  ],
  [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 0, y: 3 },
  ],
  [
    { x: 1, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 3 },
  ],
];

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

export function mirrorPointVertical(point, gridSize = GRID_SIZE) {
  return {
    x: gridSize - 1 - point.x,
    y: point.y,
  };
}

export function mirrorShapeVertical(points, gridSize = GRID_SIZE) {
  return points.map((point) => mirrorPointVertical(point, gridSize));
}

function createDistractors(baseShape, correctShape) {
  const distractors = [];

  // Wrong 1: original shape kept on left side.
  distractors.push(clonePoints(baseShape));

  // Wrong 2: mirrored shape but shifted down.
  distractors.push(shiftPoints(correctShape, 0, 1));

  // Wrong 3: mirrored shape but shifted left.
  distractors.push(shiftPoints(correctShape, -1, 0));

  return distractors.filter((shape) => shape.length >= 3);
}

function toOptionShape(shape) {
  return {
    points: clonePoints(shape),
    key: pointsKey(shape),
  };
}

export function generateSymmetryQuestion(randomFn = Math.random) {
  const baseShape = clonePoints(BASE_SHAPES[randomIndex(BASE_SHAPES.length, randomFn)]);
  const correctShape = mirrorShapeVertical(baseShape);

  const options = [];
  const usedKeys = new Set();

  const correctOption = toOptionShape(correctShape);
  options.push({
    id: 'correct',
    points: correctOption.points,
    isCorrect: true,
  });
  usedKeys.add(correctOption.key);

  const distractors = createDistractors(baseShape, correctShape);
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

    const mirroredFallback = toOptionShape(mirrorShapeVertical(fallbackShape));
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
    const randomShape = BASE_SHAPES[randomIndex(BASE_SHAPES.length, randomFn)];
    const shifted = toOptionShape(shiftPoints(randomShape, 2, 0));
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
    axis: AXIS,
    gridSize: GRID_SIZE,
    prompt: "Choisis la figure symétrique par rapport à l'axe vertical.",
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
  return {
    isValid: true,
    isCorrect,
    message: isCorrect
      ? 'Bravo ! C\'est la bonne symétrie.'
      : 'Ce n\'est pas la bonne symétrie. Observe bien l\'axe vertical.',
  };
}
