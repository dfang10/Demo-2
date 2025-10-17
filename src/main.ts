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

const cursor = { active: false, x: 0, y: 0 };

const lines: { x: number; y: number }[][] = [];
const redoLines: { x: number; y: number }[][] = [];

let currentLine: { x: number; y: number }[] | null = null;

// Mouse is held down
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = [];
  lines.push(currentLine);
  redoLines.splice(0, redoLines.length);
  currentLine.push({ x: cursor.x, y: cursor.y });

  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

// Mouse is moving
canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    if (!currentLine) { // Throw an error if currentLine can't be obtained
      throw Error("Error! Unsupported browser.");
    }
    currentLine.push({ x: cursor.x, y: cursor.y });

    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

// Mouse isn't held down
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;

  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

function redraw() {
  if (!ctx) { // Throw an error if ctx can't be obtained (unsupported browser)
    throw Error("Error! Unsupported browser.");
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length > 1) {
      ctx.beginPath();
      const { x, y } = line[0];
      ctx.moveTo(x, y);
      for (const { x, y } of line) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

//document.body.append(document.createElement("br"));

canvas.addEventListener("drawing-changed", redraw);

// Create clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => { // When button is clicked clear canvas
  lines.splice(0, lines.length);
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});
// Undo button and function
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
document.body.append(undoButton);

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const prevLine = lines.pop()!;
    redoLines.push(prevLine);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

// Redo button and function
const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoLines.length > 0) {
    const nextLine = redoLines.pop()!;
    lines.push(nextLine);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});
