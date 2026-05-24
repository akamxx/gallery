// paint.js

const canvas      = document.querySelector("canvas");
const ctx         = canvas.getContext("2d");
const eraserBtn   = document.getElementById("eraser");
const brushBtn    = document.getElementById("paintbrush");
const bucketBtn   = document.getElementById("bucket");
const clearBtn    = document.querySelector(".btn-clear");
const saveBtn     = document.querySelector(".btn-save");
const colorsGrid  = document.getElementById("colorsGrid");
const undoBtn     = document.querySelector(".btn-undo");
const redoBtn     = document.querySelector(".btn-redo");
const toast       = document.getElementById("toast");
const zoomInBtn   = document.getElementById("zoomIn");
const zoomOutBtn  = document.getElementById("zoomOut");
const zoomReset   = document.getElementById("zoomReset");
const zoomLabel   = document.getElementById("zoomLevel");
const refPanel    = document.getElementById("refPanel");
const refHeader   = document.getElementById("refHeader");
const refResize   = document.getElementById("refResize");

const artworkData = JSON.parse(localStorage.getItem("selectedArtwork"));
const artworkId   = new URLSearchParams(window.location.search).get("artworkId");

// ── STATE ─────────────────────────────────────
let color       = "#000";
let brushSize   = 3;
let isDrawing   = false;
let currentTool = "paintbrush";
let originalImg;
let zoomScale   = 1;

// Undo / Redo stacks
let undoStack = [];
let redoStack = [];

// ── UNDO / REDO ───────────────────────────────
function saveState() {
  undoStack.push(canvas.toDataURL());
  redoStack = [];
  updateHistoryBtns();
}

function updateHistoryBtns() {
  undoBtn.disabled = undoStack.length === 0;
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

const setCanvasBackground = () => {
  ctx.fillStyle = "#faf8f4";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const setAspectRatio = () => {
  const ratio = originalImg.naturalWidth / originalImg.naturalHeight;
  const maxH = window.innerHeight - 80;
  const maxW = window.innerWidth - 180 - 60; 

  let w = maxW, h = w / ratio;
  if (h > maxH) { h = maxH; w = h * ratio; }

  canvas.width  = Math.round(w);
  canvas.height = Math.round(h);
  canvas.style.width  = canvas.width  + "px";
  canvas.style.height = canvas.height + "px";
};


const viewport = document.querySelector(".canvas-viewport");

function setZoom(scale) {
  zoomScale = Math.min(4, Math.max(0.25, scale));
  zoomScale = Math.round(zoomScale * 100) / 100;
  viewport.style.transform = `scale(${zoomScale})`;
  zoomLabel.textContent = Math.round(zoomScale * 100) + "%";
}

zoomInBtn.addEventListener("click",  () => setZoom(zoomScale + 0.25));
zoomOutBtn.addEventListener("click", () => setZoom(zoomScale - 0.25));
zoomReset.addEventListener("click",  () => setZoom(1));


document.querySelector(".canvas-area").addEventListener("wheel", e => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(zoomScale + delta);
  }
}, { passive: false });

let lastX = 0, lastY = 0;


function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
 
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY
  };
}

canvas.addEventListener("mousedown", e => {
  const { x, y } = getCanvasCoords(e);

  if (currentTool === "bucket") {
    saveState();
    floodFill(Math.round(x), Math.round(y), hexToRgba(color));
    return;
  }

  isDrawing = true;
  lastX = x;
  lastY = y;

 
  ctx.beginPath();
  ctx.arc(lastX, lastY, brushSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = currentTool === "eraser" ? "#faf8f4" : color;
  ctx.fill();
});

canvas.addEventListener("mousemove", e => {
  if (!isDrawing) return;
  const { x, y } = getCanvasCoords(e);
  const drawColor = currentTool === "eraser" ? "#faf8f4" : color;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = drawColor;
  ctx.lineWidth   = brushSize;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.stroke();

  lastX = x;
  lastY = y;
});

canvas.addEventListener("mouseup", () => {
  if (isDrawing) saveState();
  isDrawing = false;
});canvas.addEventListener("mouseleave", () => isDrawing = false);


function hexToRgba(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return [r, g, b, 255];
}

function colorsMatch(a, b, tolerance = 32) {
  return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2]) + Math.abs(a[3]-b[3]) <= tolerance;
}

function floodFill(startX, startY, fillColor) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const w = canvas.width, h = canvas.height;

  const idx = (x, y) => (y * w + x) * 4;
  const getPixel = (x, y) => [data[idx(x,y)], data[idx(x,y)+1], data[idx(x,y)+2], data[idx(x,y)+3]];
  const setPixel = (x, y, c) => {
    const i = idx(x, y);
    data[i]=c[0]; data[i+1]=c[1]; data[i+2]=c[2]; data[i+3]=c[3];
  };

  const targetColor = getPixel(startX, startY);
  if (colorsMatch(targetColor, fillColor, 4)) return; // already same color

  const stack = [[startX, startY]];
  const visited = new Uint8Array(w * h);

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    if (visited[y * w + x]) continue;
    const pixel = getPixel(x, y);
    if (!colorsMatch(pixel, targetColor)) continue;

    visited[y * w + x] = 1;
    setPixel(x, y, fillColor);

    stack.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
  }

  ctx.putImageData(imgData, 0, 0);
}

function setTool(name) {
  currentTool = name;
  [brushBtn, eraserBtn, bucketBtn].forEach(b => b.classList.remove("active"));
  document.body.className = "tool-" + name;

  if (name === "paintbrush") { brushBtn.classList.add("active"); canvas.style.cursor = "crosshair"; }
  if (name === "eraser")     { eraserBtn.classList.add("active"); canvas.style.cursor = "cell"; }
  if (name === "bucket")     { bucketBtn.classList.add("active"); canvas.style.cursor = ""; canvas.classList.add("cursor-bucket"); return; }
  canvas.classList.remove("cursor-bucket");
}

brushBtn.addEventListener("click",  () => setTool("paintbrush"));
eraserBtn.addEventListener("click", () => setTool("eraser"));
bucketBtn.addEventListener("click", () => setTool("bucket"));

document.querySelectorAll(".size-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    brushSize = parseInt(btn.dataset.size);
    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

function setColor(newColor, btn) {
  color = newColor;
  document.getElementById("currentSwatch").style.background = newColor;
  document.getElementById("currentColorLabel").textContent  = newColor.toUpperCase();
  document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  if (currentTool === "eraser") setTool("paintbrush");
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


clearBtn.addEventListener("click", () => {
  saveState();
  setCanvasBackground();
});
saveBtn.addEventListener("click", async () => {
  const image = canvas.toDataURL("image/png");

  const author = await openNameModal();
  if (!author) return;

  saveBtn.textContent = "Envoi...";
  saveBtn.disabled = true;

  try {
    const response = await fetch("http://localhost:5000/api/drawings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, artworkId, author })
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

function openNameModal() {
  return new Promise((resolve) => {
    const overlay = document.getElementById("name-modal-overlay");
    const input = document.getElementById("author-input");
    const confirmBtn = document.getElementById("name-modal-confirm");
    const cancelBtn = document.getElementById("name-modal-cancel");
    const closeBtn = document.getElementById("name-modal-close");
    const error = document.getElementById("author-error");

    input.value = "";
    error.style.display = "none";
    overlay.classList.add("open");
    setTimeout(() => input.focus(), 50);

    const cleanup = () => {
      overlay.classList.remove("open");
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      closeBtn.removeEventListener("click", onCancel);
      input.removeEventListener("keydown", onKeydown);
      overlay.removeEventListener("click", onOverlayClick);
    };

    const onConfirm = () => {
      const name = input.value.trim();
      if (!name) { error.style.display = "block"; input.focus(); return; }
      cleanup();
      resolve(name);
    };

    const onCancel = () => { cleanup(); resolve(null); };
    const onKeydown = (e) => { if (e.key === "Enter") onConfirm(); if (e.key === "Escape") onCancel(); };
    const onOverlayClick = (e) => { if (e.target === overlay) onCancel(); };

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
    closeBtn.addEventListener("click", onCancel);
    input.addEventListener("keydown", onKeydown);
    overlay.addEventListener("click", onOverlayClick);
  });
}
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

refHeader.addEventListener("click", () => {
  refPanel.classList.toggle("collapsed");
});


let isResizingRef = false;
let refResizeStartX, refResizeStartY, refResizeStartW, refResizeStartH;

refResize.addEventListener("mousedown", e => {
  e.stopPropagation();
  isResizingRef = true;
  refResizeStartX = e.clientX;
  refResizeStartY = e.clientY;
  refResizeStartW = refPanel.offsetWidth;
  refResizeStartH = refPanel.offsetHeight;
  document.body.style.userSelect = "none";
  document.body.style.cursor = "se-resize";
});

document.addEventListener("mousemove", e => {
  if (!isResizingRef) return;
  const dw = e.clientX - refResizeStartX;
  const dh = e.clientY - refResizeStartY;
  const newW = Math.max(120, Math.min(520, refResizeStartW + dw));
  const newH = Math.max(100, Math.min(window.innerHeight - 80, refResizeStartH + dh));
  refPanel.style.width  = newW + "px";
  refPanel.style.height = newH + "px";
  refPanel.style.setProperty("--ref-height", newH + "px");
});

document.addEventListener("mouseup", () => {
  if (!isResizingRef) return;
  isResizingRef = false;
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
});

window.addEventListener("load", () => {
  if (!artworkData) return;

  originalImg = document.querySelector(".original-art");
  document.querySelector(".piece-name").textContent = artworkData.title;
  originalImg.src = artworkData.imageUrl;

  originalImg.onload = () => {
    setAspectRatio();
    setCanvasBackground();
    saveState();
  };

  if (artworkData.palette) buildColorBtns(artworkData.palette);
});
