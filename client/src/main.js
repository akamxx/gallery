import "../css/style.css";
import { API, ARTWORK_IDS, ARTIC_IMG_PARAMS_MAIN, UNKNOWN_ARTIST, PALETTE_COLOR_COUNT, CARD_ANIMATION_STEP_MS, ROUTES } from "./constants.js";

fetch(`${API.LOCAL_BASE}/users`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

const gallery = document.getElementById("gallery");

ARTWORK_IDS.forEach(() => {
  const skeleton = document.createElement("div");
  skeleton.classList.add("card-skeleton");
  gallery.appendChild(skeleton);
});

async function fetchArtworks() {
  const artworks = await Promise.all(
    ARTWORK_IDS.map(async (id) => {
      const response = await fetch(`${API.ARTIC_BASE}/artworks/${id}`);
      const data     = await response.json();
      return data.data;
    }),
  );

  gallery.innerHTML = "";

  artworks.forEach((artwork, index) => {
    if (!artwork || !artwork.image_id) return;

    const imageUrl = `${API.ARTIC_IMG}/${artwork.image_id}/${ARTIC_IMG_PARAMS_MAIN}`;

    const card = document.createElement("div");
    card.classList.add("card");
    card.style.animationDelay = `${index * CARD_ANIMATION_STEP_MS}ms`;

    const img       = new Image();
    img.crossOrigin = "anonymous";
    img.src         = imageUrl;

    img.onload = () => {
      const colorThief = new ColorThief();
      let palette      = [];

      try {
        palette = colorThief.getPalette(img, PALETTE_COLOR_COUNT);
      } catch (error) {
        console.log("Palette extraction failed");
      }

      const swatchesHTML = palette
        .map(
          ([r, g, b]) => `
            <div
              class="color-swatch"
              style="background: rgb(${r},${g},${b});"
              title="rgb(${r},${g},${b})"
            ></div>
          `,
        )
        .join("");

      card.innerHTML = `
        <img src="${imageUrl}" alt="${artwork.title}" />

        <div class="card-info">
          <h2>${artwork.title}</h2>
          <p class="artist">${artwork.artist_title || UNKNOWN_ARTIST}</p>
          <p class="date">${artwork.date_display || ""}</p>
        </div>

        <div class="card-hover">
          <div class="palette-row">${swatchesHTML}</div>
          <div class="hover-title">${artwork.title}</div>
          <div class="card-buttons">
            <button class="btn btn-primary create-artwork-button">Créer une oeuvre</button>
            <button class="btn btn-secondary look-up-artworks-button">Voir la gallerie</button>
          </div>
        </div>
      `;

      card.querySelector(".create-artwork-button").addEventListener("click", () => {
        const artworkData = { imageUrl, palette, title: artwork.title };
        localStorage.setItem("selectedArtwork", JSON.stringify(artworkData));
        window.location.href = `${API.LOCAL_FRONTEND}${ROUTES.PAINT}?artworkId=${artwork.id}`;
      });

      card.querySelector(".look-up-artworks-button").addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `${API.LOCAL_FRONTEND}${ROUTES.COMMUNITY}?artworkId=${artwork.id}`;
      });

      gallery.appendChild(card);
    };
  });
}

fetchArtworks();