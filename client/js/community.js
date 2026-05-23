const ARTWORK_IDS = [27992, 129884, 111628, 28560, 81539, 6565, 12345, 12311]

async function loadGallery(artworkId) {
  const section = document.getElementById('gallery-section')
  section.innerHTML = '<p class="loading-msg">Chargement...</p>'

  try {
    const response = await fetch(`/api/drawings/${artworkId}`)
    const drawings = await response.json()

    section.innerHTML = ''

    if (drawings.length === 0) {
      section.innerHTML = '<p class="empty-msg">Aucun dessin pour cette œuvre encore 🎨</p>'
      return
    }

    const grid = document.createElement('div')
    grid.className = 'gallery-grid'

    drawings.forEach((drawing, i) => {
      const card = document.createElement('div')
      card.className = 'drawing-card'
      card.style.animationDelay = `${i * 0.06}s`
      card.innerHTML = `
        <img src="${drawing.image}" alt="dessin" />
        <div class="card-footer">
          <span class="card-author">${drawing.author || 'Anonyme'}</span>
          <span class="card-score">${drawing.score ?? '—'}%</span>
        </div>
      `
      grid.appendChild(card)
    })

    section.appendChild(grid)

  } catch (err) {
    section.innerHTML = '<p class="empty-msg">Erreur de chargement.</p>'
  }
}

async function buildTabs() {
  const artworks = await Promise.all(
    ARTWORK_IDS.map(async (id) => {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks/${id}?fields=id,title,image_id`)
      const data = await res.json()
      return {
        id: String(data.data.id),
        title: data.data.title,
        img: `https://www.artic.edu/iiif/2/${data.data.image_id}/full/400,/0/default.jpg`
      }
    })
  )

  const tabsEl = document.getElementById('tabs')

  artworks.forEach((art, i) => {
    const btn = document.createElement('button')
    btn.className = 'tab' + (i === 0 ? ' active' : '')
    btn.dataset.id = art.id
    btn.innerHTML = `<img src="${art.img}" alt="${art.title}" /><span>${art.title}</span>`

    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
      btn.classList.add('active')
      loadGallery(art.id)
    })

    tabsEl.appendChild(btn)
  })

  loadGallery(artworks[0].id)
}

buildTabs()