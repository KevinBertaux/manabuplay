export const SYMMETRY_VALIDATOR_VERSION = '1';
export const SYMMETRY_AUTO_STATUS = Object.freeze({
  ACCEPTED: 'accepted',
  REVIEW: 'review',
  REJECTED: 'rejected',
});

const GRID_SIZE = 5;
const AXIS_X = 2;

function pointKey(point) {
  return `${point.x}:${point.y}`;
}

export function buildSymmetryShapeSignature(points) {
  return [...points]
    .sort((a, b) => (a.x - b.x) || (a.y - b.y))
    .map(pointKey)
    .join('|');
}

export function buildNormalizedSymmetryShapeSignature(points) {
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const normalized = points.map((point) => ({
    x: point.x - minX,
    y: point.y - minY,
  }));
  return buildSymmetryShapeSignature(normalized);
}

export function areSymmetryShapePointsCollinear(points) {
  if (points.length < 3) {
    return true;
  }

  const [a, b] = points;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return points.slice(2).every((point) => (point.x - a.x) * dy === (point.y - a.y) * dx);
}

function computeBounds(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

function countAxisPoints(points) {
  return points.filter((point) => point.x === AXIS_X).length;
}

function countDirectionChanges(points) {
  if (points.length < 3) {
    return 0;
  }

  const directions = [];
  for (let index = 1; index < points.length; index += 1) {
    directions.push({
      x: Math.sign(points[index].x - points[index - 1].x),
      y: Math.sign(points[index].y - points[index - 1].y),
    });
  }

  let changes = 0;
  for (let index = 1; index < directions.length; index += 1) {
    if (directions[index].x !== directions[index - 1].x || directions[index].y !== directions[index - 1].y) {
      changes += 1;
    }
  }

  return changes;
}

export function scoreSymmetryShape(points) {
  const bounds = computeBounds(points);
  const axisPoints = countAxisPoints(points);
  const directionChanges = countDirectionChanges(points);
  let score = 50;

  if (bounds.width >= 2) score += 10;
  if (bounds.height >= 2) score += 10;
  if (bounds.width >= 3 || bounds.height >= 3) score += 8;
  if (bounds.width > 0 && bounds.height > 0) score += 8;
  score += Math.min(directionChanges * 4, 12);
  if (axisPoints === 0) score += 6;
  if (axisPoints === 1) score += 4;
  if (axisPoints >= 2) score -= axisPoints * 3;
  if (bounds.width === 0 || bounds.height === 0) score -= 25;
  if (bounds.width < 2 && bounds.height < 2) score -= 20;

  return Math.max(0, Math.min(100, score));
}

function createEmptySeenState() {
  return {
    exact: new Set(),
    normalized: new Set(),
  };
}

export function evaluateSymmetryShape(shape, options = {}) {
  const { file = null, exactSeen = new Set(), normalizedSeen = new Set(), gridSize = GRID_SIZE } = options;
  const hardFailures = [];
  const warnings = [];
  const notes = [];
  const points = Array.isArray(shape?.points) ? shape.points : [];

  if (points.length < 3) {
    hardFailures.push('moins_de_3_points');
  }
  if (points.some((point) => !Number.isInteger(point?.x) || !Number.isInteger(point?.y))) {
    hardFailures.push('point_invalide');
  }
  if (points.some((point) => point.x < 0 || point.x >= gridSize || point.y < 0 || point.y >= gridSize)) {
    hardFailures.push('hors_grille');
  }

  const keys = points.map(pointKey);
  if (new Set(keys).size !== keys.length) {
    hardFailures.push('points_dupliques');
  }
  if (points.length >= 3 && areSymmetryShapePointsCollinear(points)) {
    hardFailures.push('tous_alignes');
  }

  const bounds = computeBounds(points);
  if (bounds.width < 2 && bounds.height < 2) {
    hardFailures.push('forme_trop_petite');
  }

  const axisPoints = countAxisPoints(points);
  if (points.length <= 4 && axisPoints > 2) {
    hardFailures.push('trop_de_points_sur_axe');
  }

  const exactSignature = buildSymmetryShapeSignature(points);
  const normalizedSignature = buildNormalizedSymmetryShapeSignature(points);

  if (exactSeen.has(exactSignature)) {
    hardFailures.push('doublon_exact');
  }
  if (normalizedSeen.has(normalizedSignature)) {
    warnings.push('doublon_normalise');
  }

  const score = scoreSymmetryShape(points);

  if (axisPoints >= 2) warnings.push('axe_charge');
  if (bounds.width === 0 || bounds.height === 0) warnings.push('silhouette_peu_variee');
  if (countDirectionChanges(points) <= 1) warnings.push('peu_de_changements_de_direction');
  if (score >= 80) notes.push('bon_potentiel_pedagogique');
  if (score >= 60 && score < 80) notes.push('forme_correcte');

  let status = SYMMETRY_AUTO_STATUS.ACCEPTED;
  if (hardFailures.length > 0 || score < 40) {
    status = SYMMETRY_AUTO_STATUS.REJECTED;
  } else if (score < 70 || warnings.length > 0) {
    status = SYMMETRY_AUTO_STATUS.REVIEW;
  }

  exactSeen.add(exactSignature);
  normalizedSeen.add(normalizedSignature);

  return {
    file,
    id: shape?.id ?? null,
    pointCount: points.length,
    points,
    signature: exactSignature,
    normalizedSignature,
    score,
    status,
    hardFailures,
    warnings,
    notes,
  };
}

export function buildSymmetryShapeReviewReport(files, options = {}) {
  const seen = createEmptySeenState();
  const results = [];
  const fileEntries = Array.isArray(files) ? files : [];

  for (const entry of fileEntries) {
    const shapes = Array.isArray(entry?.shapes) ? entry.shapes : [];
    for (const shape of shapes) {
      results.push(
        evaluateSymmetryShape(shape, {
          file: entry.file,
          exactSeen: seen.exact,
          normalizedSeen: seen.normalized,
          gridSize: options.gridSize ?? GRID_SIZE,
        })
      );
    }
  }

  const summary = {
    total: results.length,
    accepted: results.filter((item) => item.status === SYMMETRY_AUTO_STATUS.ACCEPTED).length,
    review: results.filter((item) => item.status === SYMMETRY_AUTO_STATUS.REVIEW).length,
    rejected: results.filter((item) => item.status === SYMMETRY_AUTO_STATUS.REJECTED).length,
    byFile: Object.fromEntries(
      fileEntries.map((entry) => {
        const fileResults = results.filter((item) => item.file === entry.file);
        return [
          entry.file,
          {
            total: fileResults.length,
            accepted: fileResults.filter((item) => item.status === SYMMETRY_AUTO_STATUS.ACCEPTED).length,
            review: fileResults.filter((item) => item.status === SYMMETRY_AUTO_STATUS.REVIEW).length,
            rejected: fileResults.filter((item) => item.status === SYMMETRY_AUTO_STATUS.REJECTED).length,
          },
        ];
      })
    ),
  };

  return {
    generatedAt: new Date().toISOString(),
    gridSize: options.gridSize ?? GRID_SIZE,
    validatorVersion: SYMMETRY_VALIDATOR_VERSION,
    summary,
    results,
  };
}
