const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const eraser = document.getElementById("eraser");
const paintbrush = document.getElementById("paintbrush");
const clearButton = document.querySelector(".clear-canvas");
const saveButton = document.querySelector(".save-image");
const colorBtns = document.querySelectorAll(".color");

//constantes
const brushWidth = 5;
const artworkData = JSON.parse(localStorage.getItem("selectedArtwork"));

//etat du canvas
let color = "#FFF";
let isDrawing = false;
let previousX = 0;
let previousY = 0;
let currentTool = paintbrush.id;
let orignalImage;

//Fonctions
const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
};

const startDrawing = (e) => {
  let drawingColor = currentTool === eraser.id ? "#FFF" : color;

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

const setAspectRatio = () => {
  const ratio = orignalImage.naturalWidth / orignalImage.naturalHeight;

  const maxHeight = 700;
  const maxWidth = 550;

  let width = maxWidth;
  let height = width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  canvas.width = width;
  canvas.height = height;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
};

//Event listeners
window.addEventListener("load", () => {
  if (!artworkData) return;
  orignalImage = document.querySelector(".original-art");
  const name = document.querySelector(".piece-name");

  orignalImage.src = artworkData.imageUrl;
  name.textContent = artworkData.title;

  colorBtns.forEach((btn, index) => {
    const [r, g, b] = artworkData.palette[index];
    btn.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  });

  orignalImage.onload = () => {
    setAspectRatio();
    setCanvasBackground();
  };
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
