import "../css/style.css";

fetch("http://localhost:5000/api/users")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

const artworkIds = [27992, 129884, 111628, 28560, 81539, 6565, 12345, 12101];

const gallery = document.getElementById("gallery");

artworkIds.forEach(() => {
  const skeleton = document.createElement("div");
  skeleton.classList.add("card-skeleton");
  gallery.appendChild(skeleton);
});

async function fetchArtworks() {
  const artworks = await Promise.all(
    artworkIds.map(async (id) => {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks/${id}`,
      );
      const data = await response.json();
      return data.data;
    }),
  );

  gallery.innerHTML = "";

  artworks.forEach((artwork, index) => {
    if (!artwork || !artwork.image_id) return;

    const imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`;

    const card = document.createElement("div");
    card.classList.add("card");
    card.style.animationDelay = `${index * 60}ms`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const colorThief = new ColorThief();
      let palette = [];

      try {
        palette = colorThief.getPalette(img, 5);
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
          <p class="artist">${artwork.artist_title || "Unknown artist"}</p>
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

      card
        .querySelector(".create-artwork-button")
        .addEventListener("click", () => {
          const artworkData = {
            imageUrl: imageUrl,
            palette: palette,
            title: artwork.title,
          };

          localStorage.setItem("selectedArtwork", JSON.stringify(artworkData));
          window.location.href = "paint.html";
        });

      gallery.appendChild(card);
    };
  });
}

fetchArtworks();
