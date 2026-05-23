async function loadGallery() {
    const response = await fetch('/api/gallery');


    const drawings = await response.json();

    const gallery = document.getElementById('galerie');
    drawings.forEach(drawing => {
        const img = document.createElement('img');
        img.src = drawing.image;
        gallery.appendChild(img);
    });
}

loadGallery();