const artworkId = new URLSearchParams(window.location.search).get("artworkId");

async function loadGallery() {

  try {

    const response = await fetch(
      `http://localhost:5000/api/drawings/${artworkId}`
    );

    const drawings = await response.json();

    console.log(drawings);

    const gallery = document.getElementById("gallery");

    gallery.innerHTML = "";

    drawings.forEach((drawing) => {

      const card = document.createElement("div");
      card.classList.add("gallery-card");

      const img = document.createElement("img");

      img.src = drawing.image;

      card.appendChild(img);

      gallery.appendChild(card);
    });

  } catch (err) {

    console.error(err);
  }
}

loadGallery();