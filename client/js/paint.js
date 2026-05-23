const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const eraser = document.getElementById("eraser");
const paintbrush = document.getElementById("paintbrush");
const clearButton = document.querySelector(".clear-canvas");
const saveButton = document.querySelector(".save-image");
const colorBtns = document.querySelectorAll(".color");

//constantes
const brushWidth = 5;

//etat du canvas
let color = "#000";
let isDrawing = false;
let previousX = 0;
let previousY = 0;
let currentTool = paintbrush.id;

//Fonctions
const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
};

const startDrawing = (e) => {
  drawingColor = currentTool === eraser.id ? "#FFF" : color;

  isDrawing = true;
  previousX = e.offsetX;
  previousY = e.offsetY;

  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = drawingColor;
  ctx.fillStyle = drawingColor;
  canvasImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const draw = (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBackground();
  currentTool = paintbrush.id;
};

//Event listeners
window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mouseleave", () => (isDrawing = false));

paintbrush.addEventListener("click", () => (currentTool = paintbrush.id));
eraser.addEventListener("click", () => (currentTool = eraser.id));

clearButton.addEventListener("click", () => clearCanvas());
saveButton.addEventListener("click", () => {});

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    color = getComputedStyle(btn).backgroundColor;
  });
});

const artworkId = new URLSearchParams(window.location.search).get("artworkId");

saveButton.addEventListener("click", async () => {

  const image = canvas.toDataURL("image/png");

  try {

    const response = await fetch("http://localhost:5000/api/drawings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image,
        artworkId
      })
    });

    const data = await response.json();

    console.log(data);

    window.location.href =
      `http://localhost:5173/community?artworkId=${artworkId}`;

  } catch (err) {

    console.error(err);

    alert("Erreur sauvegarde");
  }
});