import "./style.css";
const title = document.createElement("h1");
title.textContent = "Sticker Sketchpad";
document.body.appendChild(title);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "drawcanvas";

document.body.appendChild(title);
document.body.appendChild(canvas);
