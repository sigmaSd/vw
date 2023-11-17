import { Point } from "./point.ts";

export function getNearestPoint(
  loc: Point,
  points: Point[],
  treshold = Number.MAX_SAFE_INTEGER,
) {
  let minDist = Number.MAX_SAFE_INTEGER;
  let nearest: Point | undefined;
  for (const point of points) {
    const dist = distance(point, loc);
    if (dist < minDist && dist < treshold) {
      minDist = dist;
      nearest = point;
    }
  }
  return nearest;
}

function distance(p1: Point, p2: Point) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}
