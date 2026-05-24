// paint.js

const canvas      = document.querySelector("canvas");
const ctx         = canvas.getContext("2d");
const eraserBtn   = document.getElementById("eraser");
const brushBtn    = document.getElementById("paintbrush");
const clearBtn    = document.querySelector(".btn-clear");
const saveBtn     = document.querySelector(".btn-save");
const colorsGrid  = document.getElementById("colorsGrid");
const undoBtn     = document.querySelector(".btn-undo");
const redoBtn     = document.querySelector(".btn-redo");
const toast       = document.getElementById("toast");

const artworkData = JSON.parse(localStorage.getItem("selectedArtwork"));
const artworkId   = new URLSearchParams(window.location.search).get("artworkId");

// ── STATE ─────────────────────────────────────────────
let color       = "#000";
let brushSize   = 3;
let isDrawing   = false;
let currentTool = "paintbrush";
let originalImg;

// Undo / Redo stacks
let undoStack = [];
let redoStack = [];

// ── UNDO / REDO ───────────────────────────────────────
function saveState() {
  undoStack.push(canvas.toDataURL());
  redoStack = [];           // nouvelle action annule le redo
  updateHistoryBtns();
}

function updateHistoryBtns() {
  undoBtn.disabled = undoStack.length < 2; // garde au moins l'état blanc
  redoBtn.disabled = redoStack.length === 0;
}

function restoreState(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve();
    };
    img.src = dataUrl;
  });
}

undoBtn.addEventListener("click", async () => {
  if (undoStack.length < 2) return;
  redoStack.push(undoStack.pop());
  await restoreState(undoStack[undoStack.length - 1]);
  updateHistoryBtns();
});

redoBtn.addEventListener("click", async () => {
  if (!redoStack.length) return;
  const state = redoStack.pop();
  undoStack.push(state);
  await restoreState(state);
  updateHistoryBtns();
});

// Keyboard shortcuts
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undoBtn.click(); }
  if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redoBtn.click(); }
});

// ── CANVAS SETUP ──────────────────────────────────────
const setCanvasBackground = () => {
  ctx.fillStyle = "#faf8f4";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const setAspectRatio = () => {
  const ratio = originalImg.naturalWidth / originalImg.naturalHeight;
  const maxH = window.innerHeight - 80;
  const maxW = window.innerWidth - 220 - 200 - 60;

  let w = maxW, h = w / ratio;
  if (h > maxH) { h = maxH; w = h * ratio; }

  canvas.width  = Math.round(w);
  canvas.height = Math.round(h);
  canvas.style.width  = canvas.width  + "px";
  canvas.style.height = canvas.height + "px";
};

// ── DRAWING ───────────────────────────────────────────
let lastX = 0, lastY = 0;

canvas.addEventListener("mousedown", e => {
  saveState();
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;

  // dot on click
  ctx.beginPath();
  ctx.arc(lastX, lastY, brushSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = currentTool === "eraser" ? "#faf8f4" : color;
  ctx.fill();
});

canvas.addEventListener("mousemove", e => {
  if (!isDrawing) return;
  const drawColor = currentTool === "eraser" ? "#faf8f4" : color;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = drawColor;
  ctx.lineWidth   = brushSize;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.stroke();

  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mouseup",    () => isDrawing = false);
canvas.addEventListener("mouseleave", () => isDrawing = false);

// ── TOOLS ─────────────────────────────────────────────
brushBtn.addEventListener("click", () => {
  currentTool = "paintbrush";
  brushBtn.classList.add("active");
  eraserBtn.classList.remove("active");
  canvas.style.cursor = "crosshair";
});

eraserBtn.addEventListener("click", () => {
  currentTool = "eraser";
  eraserBtn.classList.add("active");
  brushBtn.classList.remove("active");
  canvas.style.cursor = "cell";
});

// ── BRUSH SIZE ────────────────────────────────────────
document.querySelectorAll(".size-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    brushSize = parseInt(btn.dataset.size);
    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ── COLORS ────────────────────────────────────────────
function setColor(newColor, btn) {
  color = newColor;
  document.getElementById("currentSwatch").style.background = newColor;
  document.getElementById("currentColorLabel").textContent  = newColor.toUpperCase();
  document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  // switch back to brush if on eraser
  if (currentTool === "eraser") brushBtn.click();
}

function buildColorBtns(palette) {
  colorsGrid.innerHTML = "";
  palette.forEach(([r, g, b], i) => {
    const hex = rgbToHex(r, g, b);
    const btn = document.createElement("button");
    btn.className = "color-btn" + (i === 0 ? " active" : "");
    btn.style.background = hex;
    btn.title = hex;
    btn.addEventListener("click", () => setColor(hex, btn));
    colorsGrid.appendChild(btn);
    if (i === 0) setColor(hex, btn);
  });
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

// ── CLEAR ─────────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  saveState();
  setCanvasBackground();
});

// ── SAVE ──────────────────────────────────────────────
saveBtn.addEventListener("click", async () => {
  const image = canvas.toDataURL("image/png");
  saveBtn.textContent = "Envoi...";
  saveBtn.disabled = true;

  try {
    const response = await fetch("http://localhost:5000/api/drawings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, artworkId })
    });

    if (!response.ok) throw new Error();
    showToast("✓ Dessin sauvegardé !");
    setTimeout(() => {
      window.location.href = `http://localhost:5173/community?artworkId=${artworkId}`;
    }, 1200);
  } catch {
    showToast("Erreur lors de la sauvegarde");
    saveBtn.textContent = "Sauvegarder →";
    saveBtn.disabled = false;
  }
});

// ── TOAST ─────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ── INIT ──────────────────────────────────────────────
window.addEventListener("load", () => {
  if (!artworkData) return;

  originalImg = document.querySelector(".original-art");
  document.querySelector(".piece-name").textContent = artworkData.title;
  originalImg.src = artworkData.imageUrl;

  originalImg.onload = () => {
    setAspectRatio();
    setCanvasBackground();
    saveState(); // état initial dans le stack
  };

  if (artworkData.palette) buildColorBtns(artworkData.palette);
});