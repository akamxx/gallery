import { API, ARTIC_ART_FIELDS, ARTIC_IMG_PARAMS, DEFAULT_AUTHOR, DATE_LOCALE, DATE_OPTIONS } from "../src/constants.js";

const currentArtworkId = new URLSearchParams(window.location.search).get("artworkId");

async function init() {
  if (!currentArtworkId) return;

  const artRes  = await fetch(`${API.ARTIC_BASE}/artworks/${currentArtworkId}?fields=${ARTIC_ART_FIELDS}`);
  const artData = await artRes.json();

  document.getElementById("original-img").src            = `${API.ARTIC_IMG}/${artData.data.image_id}/${ARTIC_IMG_PARAMS}`;
  document.getElementById("original-title").textContent  = artData.data.title;

  const section = document.getElementById("gallery-section");
  section.innerHTML = '<p class="loading-msg">Chargement…</p>';

  try {
    const res      = await fetch(`${API.LOCAL_BASE}/drawings/${currentArtworkId}`);
    const drawings = await res.json();

    document.getElementById("drawing-count").textContent = drawings.length;
    section.innerHTML = "";

    if (drawings.length === 0) {
      section.innerHTML = '<p class="empty-msg">Aucune création pour cette œuvre.</p>';
      return;
    }

    const grid = document.createElement("div");
    grid.className = "gallery-grid";

    drawings.forEach((drawing) => {
      const card     = document.createElement("div");
      card.className = "drawing-card";

      const author = drawing.author || DEFAULT_AUTHOR;
      const date   = new Date(drawing.createdAt).toLocaleDateString(DATE_LOCALE, DATE_OPTIONS);

      card.innerHTML = `
        <div class="drawing-card-inner">
          <img src="${drawing.image}" alt="dessin par ${author}" loading="lazy" />
          <div class="card-overlay">
            <p class="card-overlay-author">${author}</p>
            <p class="card-overlay-date">${date}</p>
          </div>
        </div>
        <div class="card-footer">
          <span class="card-author">${author}</span>
          <span class="card-date">${date}</span>
        </div>
      `;
      grid.appendChild(card);
    });

    section.appendChild(grid);
  } catch (err) {
    console.error(err);
    section.innerHTML = '<p class="empty-msg">Erreur de chargement.</p>';
  }
}

init();