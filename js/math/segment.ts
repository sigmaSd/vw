import { Point } from "./point.ts";

export class Segment {
  constructor(public p1: Point, public p2: Point) {
  }
  equals(seg: Segment) {
    return this.includes(seg.p1) && this.includes(seg.p2);
  }
  includes(point: Point) {
    return this.p1.equals(point) || this.p2.equals(point);
  }
  draw(
    ctx: CanvasRenderingContext2D,
    { width = 2, color = "black", dash = [] }: {
      width?: number;
      dash?: number[];
      color?: string;
    } = {},
  ) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
