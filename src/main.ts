import "./style.css";
// Title
const title = document.createElement("h1");
title.textContent = "Sticker Sketchpad";
document.body.appendChild(title);

// Canvas
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "drawcanvas";
document.body.appendChild(canvas);

// Handle drawing
const ctx = canvas.getContext("2d");
if (!ctx) { // Throw an error if ctx can't be obtained (unsupported browser)
  throw Error("Error! Unsupported browser.");
}

interface DrawCommand {
  display(ctx: CanvasRenderingContext2D): void;
}
interface PreviewCommand {
  draw(ctx: CanvasRenderingContext2D): void;
  setPosition(x: number, y: number): void;
}

class MarkerPreview implements PreviewCommand {
  x = 0;
  y = 0;
  radius = 0;

  constructor(radius: number) {
    this.radius = radius;
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.restore();
  }
}

function createLineCommand(width: number) {
  const points: { x: number; y: number }[] = [];
  return {
    addPoint(x: number, y: number) {
      points.push({ x, y });
    },
    display(ctx: CanvasRenderingContext2D) {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    },
  };
}

const cursor = { active: false, x: 0, y: 0 };

const commands: DrawCommand[] = [];
const redoCommands: DrawCommand[] = [];

let currentCommand: ReturnType<typeof createLineCommand> | null = null;
let brushSize = 2;
const curTool: "marker" | "sticker" = "marker";
let currentPreview: PreviewCommand | null = null;

currentPreview = new MarkerPreview(brushSize / 2);

// Mouse is held down
canvas.addEventListener("mousedown", (e) => {
  const cmd = createLineCommand(brushSize);
  cursor.active = true;
  cmd.addPoint(e.offsetX, e.offsetY);
  currentCommand = cmd;
  commands.push(cmd);
  redoCommands.splice(0, redoCommands.length); // clear redo stack

  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

// Mouse is moving
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (cursor.active && currentCommand) {
    currentCommand.addPoint(x, y);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  } else {
    // Update preview position if it exists
    if (currentPreview) {
      currentPreview.setPosition(x, y);
    }
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
  }
});

function render() {
  if (!ctx) return;

  // Always redraw from scratch
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw all saved commands
  for (const cmd of commands) {
    cmd.display(ctx);
  }

  // Draw preview only if mouse is up and preview exists
  if (!cursor.active && currentPreview) {
    currentPreview.draw(ctx);
  }
}

// Attach both events to the same render
canvas.addEventListener("drawing-changed", render);
canvas.addEventListener("tool-moved", render);

// Mouse isn't held down
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentCommand = null;

  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

//document.body.append(document.createElement("br"));

canvas.addEventListener("drawing-changed", () => {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const cmd of commands) {
    cmd.display(ctx);
  }
  if (currentPreview && !cursor.active && curTool === "marker") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    //ctx.arc(currentPreview.x, currentPreview.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
});

// Create clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  commands.splice(0, commands.length);
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

// Undo button and function
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
document.body.append(undoButton);

undoButton.addEventListener("click", () => {
  if (commands.length > 0) {
    const last = commands.pop()!;
    redoCommands.push(last);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

// Redo button and function
const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoCommands.length > 0) {
    const next = redoCommands.pop()!;
    commands.push(next);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

// Thin marker
const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin";
document.body.append(thinButton);

thinButton.addEventListener("click", () => {
  brushSize = 2;
  currentPreview = new MarkerPreview(brushSize / 2);
  canvas.dispatchEvent(new CustomEvent("tool-moved"));
});

// Thick marker
const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick";
document.body.append(thickButton);

thickButton.addEventListener("click", () => {
  brushSize = 5;
  currentPreview = new MarkerPreview(brushSize / 2);
  canvas.dispatchEvent(new CustomEvent("tool-moved"));
});

console.log("hi");
