async function loadGallery() {
    const response = await fetch('/api/gallery');
};

const drawings = await response.json();
const gallery = document.getElementById('gallery');
drawings.forEach(drawing => {
    const img = document.createElement('img');
    img.src = drawing.imageUrl;
    gallery.appendChild(img);
});