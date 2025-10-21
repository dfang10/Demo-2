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
// Code taken from cmpm-121-f25-quaint=paint paint0
const ctx = canvas.getContext("2d");
if (!ctx) { // Throw an error if ctx can't be obtained (unsupported browser)
  throw Error("Error! Unsupported browser.");
}

interface DrawCommand {
  display(ctx: CanvasRenderingContext2D): void;
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
  if (cursor.active && currentCommand) {
    currentCommand.addPoint(e.offsetX, e.offsetY);

    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

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
});

// Thick marker
const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick";
document.body.append(thickButton);

thickButton.addEventListener("click", () => {
  brushSize = 5;
});
