import { GraphEditor } from "./js/graphEditor.ts";
import { Graph } from "./js/primitives/graph.ts";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

canvas.width = 500;
canvas.height = 500;

const ctx = canvas.getContext("2d")!;

const graphString = localStorage.getItem("graph");
const graphInfo = graphString ? JSON.parse(graphString) : undefined;
const graph = graphInfo ? Graph.load(graphInfo) : new Graph();
const graphEditor = new GraphEditor(canvas, graph);

//@ts-ignore hack expose to other script tags
window._app = { graph, graphEditor };

animate();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  graphEditor.display();
  requestAnimationFrame(animate);
}
