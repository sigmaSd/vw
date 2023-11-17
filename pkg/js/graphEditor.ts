import { Point } from "./math/point.ts";
import { Segment } from "./math/segment.ts";
import { getNearestPoint } from "./math/utils.ts";
import { Graph } from "./primitives/graph.ts";

export class GraphEditor {
  ctx: CanvasRenderingContext2D;
  mouse?: Point;
  selected?: Point;
  hovered?: Point;
  dragging = false;
  constructor(public canvas: HTMLCanvasElement, public graph: Graph) {
    this.ctx = this.canvas.getContext("2d")!;
    this.#addEventListeners();
  }

  #addEventListeners() {
    this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
    this.canvas.addEventListener("contextmenu", (evt) => evt.preventDefault());
    this.canvas.addEventListener("mouseup", () => this.dragging = false);
  }

  #handleMouseMove(evt: MouseEvent) {
    this.mouse = new Point(evt.offsetX, evt.offsetY);
    this.hovered = getNearestPoint(this.mouse, this.graph.points, 10);
    if (this.dragging == true) {
      this.selected = new Point(this.mouse.x, this.mouse.y);
    }
  }
  #handleMouseDown(evt: MouseEvent) {
    if (!this.mouse) return;

    if (evt.button == 2 /*Right Click*/) {
      if (this.selected) {
        this.selected = undefined;
      } else if (this.hovered) {
        this.#removePoint(this.hovered);
      }
    }
    if (evt.button == 0 /*Left Click*/) {
      if (this.hovered) {
        this.#select(this.hovered);
        this.dragging = true;
        return;
      }
      this.graph.addPoint(this.mouse);
      this.#select(this.mouse);
      // snap
      this.hovered = this.mouse;
    }
  }
  #select(point: Point) {
    if (this.selected) {
      this.graph.tryAddSegment(new Segment(this.selected, point));
    }
    this.selected = point;
  }
  #removePoint(hovered: Point) {
    this.graph.removePoint(hovered);
    this.hovered = undefined;
    if (this.selected == hovered) {
      this.selected = undefined;
    }
  }

  display() {
    this.graph.draw(this.ctx);
    if (this.hovered) {
      this.hovered.draw(this.ctx, { fill: true });
    }
    if (this.selected) {
      const intent = this.hovered ? this.hovered : this.mouse;
      new Segment(this.selected, intent!).draw(this.ctx, { dash: [3, 3] });
      this.selected.draw(this.ctx, { outline: true });
    }
  }
}
