fetch('http://localhost:5000/api/users')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error))

const artworkIds = [27992, 129884, 111628, 28560, 81539, 6565, 12345, 12311];

import "../css/style.css";

const gallery = document.getElementById("gallery");

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
artworks.forEach((artwork) => {
  if (!artwork.image_id) return;

  const imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`;

  const card = document.createElement("div");
  card.classList.add("card");

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

    const paletteHTML = palette
      .map(
        (color) => `
          <div 
            class="color-circle"
            style="
              background: rgb(${color[0]}, ${color[1]}, ${color[2]});
            "
          ></div>
        `,
      )
      .join("");

    card.innerHTML = `
      <img 
        src="${imageUrl}" 
        alt="${artwork.title}"
      />

      <div class="card-content">
        <h2>${artwork.title}</h2>

        <p>${artwork.artist_title || "Unknown artist"}</p>

        <p>${artwork.date_display || ""}</p>

        <div class="palette">
          ${paletteHTML}
        </div>
      </div>
    `;

    gallery.appendChild(card);
  };
});
}

fetchArtworks();
