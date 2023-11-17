///<reference lib="dom"/>

import { GraphEditor } from "./js/graphEditor.ts";
import { Point } from "./js/math/point.ts";
import { Segment } from "./js/math/segment.ts";
import { Graph } from "./js/primitives/graph.ts";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

canvas.width = 500;
canvas.height = 500;

const ctx = canvas.getContext("2d")!;

const p1 = new Point(200, 200);
const p2 = new Point(400, 400);
const p3 = new Point(150, 340);

const s1 = new Segment(p1, p2);
const s2 = new Segment(p1, p3);

const graph = new Graph([p1, p2, p3], [s1, s2]);
const graphEditor = new GraphEditor(canvas, graph);

animate();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  graphEditor.display();
  requestAnimationFrame(animate);
}
