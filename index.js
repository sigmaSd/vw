// THIS FILE IS AUTO-GENERATED, DO NOT EDIT
class Point {
    x;
    y;
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    equals(point) {
        return this.x == point.x && this.y == point.y;
    }
    draw(ctx, { size = 18, color = "black", outline = false, fill = false } = {}) {
        const rad = size / 2;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, rad, 0, Math.PI * 2);
        ctx.fill();
        if (outline) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.arc(this.x, this.y, rad * 0.6, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (fill) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, rad * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "yellow";
            ctx.fill();
        }
    }
}
class Segment {
    p1;
    p2;
    constructor(p1, p2){
        this.p1 = p1;
        this.p2 = p2;
    }
    equals(seg) {
        return this.includes(seg.p1) && this.includes(seg.p2);
    }
    includes(point) {
        return this.p1.equals(point) || this.p2.equals(point);
    }
    draw(ctx, { width = 2, color = "black", dash = [] } = {}) {
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
function getNearestPoint(loc, points, treshold = Number.MAX_SAFE_INTEGER) {
    let minDist = Number.MAX_SAFE_INTEGER;
    let nearest;
    for (const point of points){
        const dist = distance(point, loc);
        if (dist < minDist && dist < treshold) {
            minDist = dist;
            nearest = point;
        }
    }
    return nearest;
}
function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}
class GraphEditor {
    canvas;
    graph;
    ctx;
    mouse;
    selected;
    hovered;
    dragging;
    constructor(canvas, graph){
        this.canvas = canvas;
        this.graph = graph;
        this.dragging = false;
        this.ctx = this.canvas.getContext("2d");
        this.#addEventListeners();
    }
    #addEventListeners() {
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
        this.canvas.addEventListener("contextmenu", (evt)=>evt.preventDefault());
        this.canvas.addEventListener("mouseup", ()=>this.dragging = false);
    }
    #handleMouseMove(evt) {
        this.mouse = new Point(evt.offsetX, evt.offsetY);
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 10);
        if (this.dragging == true) {
            if (!this.selected) return;
            this.selected.x = this.mouse.x;
            this.selected.y = this.mouse.y;
        }
    }
    #handleMouseDown(evt) {
        if (!this.mouse) return;
        if (evt.button == 2) {
            if (this.selected) {
                this.selected = undefined;
            } else if (this.hovered) {
                this.#removePoint(this.hovered);
            }
        }
        if (evt.button == 0) {
            if (this.hovered) {
                this.#select(this.hovered);
                this.dragging = true;
                return;
            }
            this.graph.addPoint(this.mouse);
            this.#select(this.mouse);
            this.hovered = this.mouse;
        }
    }
    #select(point) {
        if (this.selected) {
            this.graph.tryAddSegment(new Segment(this.selected, point));
        }
        this.selected = point;
    }
    #removePoint(hovered) {
        this.graph.removePoint(hovered);
        this.hovered = undefined;
        if (this.selected == hovered) {
            this.selected = undefined;
        }
    }
    dispose() {
        this.graph.dispose();
    }
    display() {
        this.graph.draw(this.ctx);
        if (this.hovered) {
            this.hovered.draw(this.ctx, {
                fill: true
            });
        }
        if (this.selected) {
            const intent = this.hovered ? this.hovered : this.mouse;
            new Segment(this.selected, intent).draw(this.ctx, {
                dash: [
                    3,
                    3
                ]
            });
            this.selected.draw(this.ctx, {
                outline: true
            });
        }
    }
}
class Graph {
    points;
    segments;
    constructor(points = [], segments = []){
        this.points = points;
        this.segments = segments;
    }
    static load(info) {
        const points = info.points.map((i)=>new Point(i.x, i.y));
        const segments = info.segments.map((i)=>new Segment(points.find((p)=>p.equals(i.p1)), points.find((p)=>p.equals(i.p2))));
        return new Graph(points, segments);
    }
    dispose() {
        this.points = [];
        this.segments = [];
    }
    addPoint(point) {
        this.points.push(point);
    }
    tryAddSegment(segment) {
        if (!this.containsSegment(segment) && !segment.p1.equals(segment.p2)) {
            this.addSegment(segment);
            return true;
        }
        return false;
    }
    containsSegment(segment) {
        return this.segments.find((s)=>s.equals(segment));
    }
    addSegment(segment) {
        this.segments.push(segment);
    }
    removePoint(point) {
        const segs = this.getSegmentsWithPoint(point);
        for (const seg of segs){
            this.removeSegment(seg);
        }
        this.points.splice(this.points.indexOf(point), 1);
    }
    getSegmentsWithPoint(point) {
        const segs = [];
        for (const seg of this.segments){
            if (seg.includes(point)) {
                segs.push(seg);
            }
        }
        return segs;
    }
    removeSegment(segment) {
        this.segments.splice(this.segments.indexOf(segment), 1);
    }
    draw(ctx) {
        for (const point of this.points){
            point.draw(ctx);
        }
        for (const segment of this.segments){
            segment.draw(ctx);
        }
    }
}
const canvas = document.getElementById("myCanvas");
canvas.width = 500;
canvas.height = 500;
const ctx = canvas.getContext("2d");
const graphString = localStorage.getItem("graph");
const graphInfo = graphString ? JSON.parse(graphString) : undefined;
const graph = graphInfo ? Graph.load(graphInfo) : new Graph();
const graphEditor = new GraphEditor(canvas, graph);
animate();
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    graphEditor.display();
    requestAnimationFrame(animate);
}
