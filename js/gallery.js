// GALLERY PAGE SCRIPT

let allReels = [];

document.addEventListener('DOMContentLoaded', () => {
  loadReels();
  loadTestimonials();

  document.getElementById('searchInput').addEventListener('input', filterReels);
  document.getElementById('categoryFilter').addEventListener('change', filterReels);
});

async function loadReels() {
  try {
    const response = await getAllReels();
    allReels = response.data || [];
    displayReels(allReels);
  } catch (error) {
    console.error('Error loading reels:', error);
    document.getElementById('reelsGrid').innerHTML = '<p style="color: #d32f2f;">Error loading reels</p>';
  }
}

function displayReels(reels) {
  const grid = document.getElementById('reelsGrid');
  grid.innerHTML = '';

  if (reels.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--light-gray);">No reels found</p>';
    return;
  }

  reels.forEach(reel => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="card-image" onmouseover="this.querySelector('img').style.opacity='0.7'" 
           onmouseout="this.querySelector('img').style.opacity='1'">
        <img src="${reel.thumbnailPath}" alt="${reel.title}">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    font-size: 3rem; opacity: 0; transition: opacity 0.3s;" 
             class="play-icon">▶️</div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${reel.title}</h3>
        <p class="card-description">${reel.description.substring(0, 80)}...</p>
        <div class="card-meta">
          <span>👁️ ${reel.views}</span>
          <span class="badge badge-gold">${reel.category}</span>
        </div>
      </div>
    `;
    card.onclick = () => openReelDetail(reel);
    grid.appendChild(card);
  });
}

function filterReels() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;

  const filtered = allReels.filter(reel => {
    const matchesSearch = reel.title.toLowerCase().includes(search) || 
                         reel.description.toLowerCase().includes(search);
    const matchesCategory = !category || reel.category === category;
    return matchesSearch && matchesCategory;
  });

  displayReels(filtered);
}

function openReelDetail(reel) {
  const modal = document.getElementById('reelModal');
  const content = document.getElementById('reelModalContent');

  content.innerHTML = `
    <div>
      <video width="100%" controls style="margin-bottom: 1rem; border-radius: 8px;">
        <source src="${reel.videoPath}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      
      <h3 style="color: var(--gold); margin-bottom: 1rem;">${reel.title}</h3>
      
      <p style="color: var(--light-gray); margin-bottom: 1rem;">${reel.description}</p>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
        <div>
          <p style="color: var(--gold);">Category</p>
          <p style="color: var(--light-gray);">${reel.category}</p>
        </div>
        <div>
          <p style="color: var(--gold);">Views</p>
          <p style="color: var(--light-gray);">${reel.views}</p>
        </div>
        <div>
          <p style="color: var(--gold);">Duration</p>
          <p style="color: var(--light-gray);">${reel.duration || 'N/A'} seconds</p>
        </div>
        <div>
          <p style="color: var(--gold);">Created</p>
          <p style="color: var(--light-gray);">${formatDate(reel.createdAt)}</p>
        </div>
      </div>

      <button class="btn btn-primary" style="width: 100%; padding: 0.8rem;" 
              onclick="window.location.href='order.html'; closeModal();">
        Order Similar Video
      </button>
    </div>
  `;

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('reelModal').classList.remove('active');
}

function loadTestimonials() {
  // Load testimonials for reference if needed
}
