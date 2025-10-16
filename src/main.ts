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

// When mouse is held down
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true; // Mouse is held down
  cursor.x = e.offsetX; // Set the starting x to where the player clicked x value
  cursor.y = e.offsetY; // Set the starting x to where the player clicked y value
});

// When the mouse is moved
canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) { // If the mouse is held down
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y); // Move to the next x and y
    ctx.lineTo(e.offsetX, e.offsetY); // Make a line
    ctx.stroke(); // Outline the path
    cursor.x = e.offsetX; // Set the new x
    cursor.y = e.offsetY; // Set the new y
  }
});

// Mouse is no longer held down
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

// Create clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => { // When button is clicked clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
