import { Point } from "../math/point.ts";
import { Segment } from "../math/segment.ts";

export class Graph {
  constructor(public points: Point[], public segments: Segment[]) {}
  addPoint(point: Point) {
    this.points.push(point);
  }
  tryAddSegment(segment: Segment) {
    if (!this.containsSegment(segment) && !segment.p1.equals(segment.p2)) {
      this.addSegment(segment);
      return true;
    }
    return false;
  }
  containsSegment(segment: Segment) {
    return this.segments.find((s) => s.equals(segment));
  }
  addSegment(segment: Segment) {
    this.segments.push(segment);
  }
  removePoint(point: Point) {
    const segs = this.getSegmentsWithPoint(point);
    for (const seg of segs) {
      this.removeSegment(seg);
    }
    this.points.splice(this.points.indexOf(point), 1);
  }
  getSegmentsWithPoint(point: Point) {
    const segs: Segment[] = [];
    for (const seg of this.segments) {
      if (seg.includes(point)) {
        segs.push(seg);
      }
    }
    return segs;
  }
  removeSegment(segment: Segment) {
    this.segments.splice(this.segments.indexOf(segment), 1);
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const point of this.points) {
      point.draw(ctx);
    }
    for (const segment of this.segments) {
      segment.draw(ctx);
    }
  }
}
