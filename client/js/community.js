const currentArtworkId = new URLSearchParams(window.location.search).get("artworkId");

async function init() {
  if (!currentArtworkId) return;

  const artRes = await fetch(`https://api.artic.edu/api/v1/artworks/${currentArtworkId}?fields=id,title,image_id`);
  const artData = await artRes.json();
  document.getElementById("original-img").src = `https://www.artic.edu/iiif/2/${artData.data.image_id}/full/400,/0/default.jpg`;
  document.getElementById("original-title").textContent = artData.data.title;

  const section = document.getElementById("gallery-section");
  section.innerHTML = '<p class="loading-msg">Chargement…</p>';

  try {
    const res = await fetch(`http://localhost:5000/api/drawings/${currentArtworkId}`);
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
      const card = document.createElement("div");
      card.className = "drawing-card";
      const author = drawing.author || "Anonyme";
      const date = new Date(drawing.createdAt).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" });
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