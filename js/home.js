// HOME PAGE SCRIPT

let testimonialIndex = 0;
let testimonials = [];

// LOAD LATEST REELS ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
  loadLatestReels();
  loadTestimonialsSlider();
});

async function loadLatestReels() {
  try {
    const response = await getAllReels({ featured: 'true' });
    const reels = response.data.slice(0, 6);

    const grid = document.getElementById('latestReelsGrid');
    grid.innerHTML = '';

    if (reels.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--light-gray);">No reels available yet</p>';
      return;
    }

    reels.forEach(reel => {
      const card = createReelCard(reel);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading reels:', error);
    document.getElementById('latestReelsGrid').innerHTML = '<p style="color: #d32f2f;">Error loading reels</p>';
  }
}

async function loadTestimonialsSlider() {
  try {
    const response = await getTestimonials();
    testimonials = response.data || [];

    if (testimonials.length === 0) {
      document.getElementById('testimonialCard').innerHTML = '<p style="color: var(--light-gray); text-align: center;">No testimonials yet</p>';
      return;
    }

    showTestimonial(0);
  } catch (error) {
    console.error('Error loading testimonials:', error);
  }
}

function showTestimonial(index) {
  if (testimonials.length === 0) return;

  testimonialIndex = (index + testimonials.length) % testimonials.length;
  const testimonial = testimonials[testimonialIndex];

  const stars = '⭐'.repeat(testimonial.rating);
  document.getElementById('testimonialCard').innerHTML = `
    <div class="testimonial-stars">${stars}</div>
    <p class="testimonial-text">"${testimonial.comment}"</p>
    <p class="testimonial-author">- ${testimonial.client.name}</p>
  `;

  document.getElementById('testimonialCounter').textContent = `${testimonialIndex + 1} / ${testimonials.length}`;
}

function nextTestimonial() {
  showTestimonial(testimonialIndex + 1);
}

function previousTestimonial() {
  showTestimonial(testimonialIndex - 1);
}

function createReelCard(reel) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-image">
      <img src="${reel.thumbnailPath}" alt="${reel.title}" style="cursor: pointer;" 
           onclick="window.location.href='gallery.html'">
    </div>
    <div class="card-content">
      <h3 class="card-title">${reel.title}</h3>
      <p class="card-description">${reel.description.substring(0, 100)}...</p>
      <div class="card-meta">
        <span>👁️ ${reel.views} views</span>
        <span class="badge badge-gold">${reel.category}</span>
      </div>
    </div>
  `;
  return card;
}
