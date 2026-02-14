// TESTIMONIALS PAGE SCRIPT

let allTestimonials = [];

document.addEventListener('DOMContentLoaded', () => {
  loadTestimonials();
  checkLoginStatus();

  if (isLoggedIn() && !isOwner()) {
    document.getElementById('testimonialForm').style.display = 'block';
    document.getElementById('loginPromptTestimonial').style.display = 'none';
    document.getElementById('testimonialForm').addEventListener('submit', handleTestimonialSubmit);
  }
});

function checkLoginStatus() {
  if (!isLoggedIn()) {
    document.getElementById('testimonialForm').style.display = 'none';
    document.getElementById('loginPromptTestimonial').style.display = 'block';
  }
}

async function loadTestimonials() {
  try {
    const response = await getTestimonials();
    allTestimonials = response.data || [];
    displayTestimonials(allTestimonials);
  } catch (error) {
    console.error('Error loading testimonials:', error);
  }
}

function displayTestimonials(testimonials) {
  const grid = document.getElementById('testimonialsGrid');
  grid.innerHTML = '';

  if (testimonials.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--light-gray);">No testimonials yet</p>';
    return;
  }

  testimonials.forEach(testimonial => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    const stars = '⭐'.repeat(testimonial.rating);
    
    card.innerHTML = `
      <div class="testimonial-stars">${stars}</div>
      <h3 style="color: var(--gold); margin-bottom: 1rem;">${testimonial.title}</h3>
      <p class="testimonial-text">"${testimonial.comment}"</p>
      <p class="testimonial-author">- ${testimonial.client.name}</p>
      <p style="color: var(--dark-gray); font-size: 0.9rem; margin-top: 1rem;">${formatDate(testimonial.createdAt)}</p>
    `;
    
    grid.appendChild(card);
  });
}

async function handleTestimonialSubmit(e) {
  e.preventDefault();

  try {
    const title = document.getElementById('testimonialTitle').value;
    const comment = document.getElementById('testimonialComment').value;
    const rating = parseInt(document.getElementById('testimonialRating').value);

    const result = await createTestimonial({ title, comment, rating });

    showAlert('testimonialAlert', 'Testimonial submitted successfully! Thank you for your feedback.', 'success');
    
    document.getElementById('testimonialForm').reset();

    // Reload testimonials
    setTimeout(() => {
      loadTestimonials();
    }, 1500);
  } catch (error) {
    showAlert('testimonialAlert', error.message, 'error');
  }
}
