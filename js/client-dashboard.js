// CLIENT DASHBOARD SCRIPT

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in and is client
  if (!isLoggedIn() || isOwner()) {
    window.location.href = 'login.html';
    return;
  }

  const user = getCurrentUser();
  document.getElementById('userGreeting').textContent = `Welcome, ${user.name}`;

  // Form listeners
  document.getElementById('newOrderForm').addEventListener('submit', handleNewOrder);
  document.getElementById('clientFeedbackForm').addEventListener('submit', handleFeedback);
  document.getElementById('clientSearchInput').addEventListener('input', filterBrowseReels);
  document.getElementById('clientCategoryFilter').addEventListener('change', filterBrowseReels);

  // Load initial data
  loadMyOrders();
});

function switchTab(tabId) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });

  // Remove active class from all menu items
  document.querySelectorAll('.sidebar-menu-item').forEach(item => {
    item.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(tabId).style.display = 'block';

  // Add active class to clicked menu item
  event.target.closest('.sidebar-menu-item').classList.add('active');

  // Load data based on tab
  switch(tabId) {
    case 'my-orders':
      loadMyOrders();
      break;
    case 'browse-reels':
      loadBrowseReels();
      break;
    case 'testimonials':
      loadPublishedTestimonials();
      break;
    case 'feedback':
      loadFeedbackOrders();
      break;
  }
}

// ==================== MY ORDERS ====================

async function loadMyOrders() {
  try {
    const response = await getOrders();
    const orders = response.data || [];

    let html = `<table class="table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Package</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

    if (orders.length === 0) {
      html += '<tr><td colspan="5" style="text-align: center; color: var(--light-gray);">No orders yet. <a href="#" onclick="switchTab(\'new-order\')" style="color: var(--gold);">Create one now</a></td></tr>';
    } else {
      orders.forEach(order => {
        const statusClass = order.status === 'completed' ? 'badge-success' : 
                           order.status === 'working' ? 'badge-pending' : 'badge-danger';
        html += `
          <tr>
            <td>${order.orderNumber}</td>
            <td><span class="badge badge-gold">${order.packageType}</span></td>
            <td><span class="badge ${statusClass}">${order.status}</span></td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
              <button class="btn btn-secondary" onclick="viewOrderDetail('${order._id}')" 
                style="padding: 0.4rem 0.8rem; font-size: 0.9rem;">
                View
              </button>
            </td>
          </tr>
        `;
      });
    }

    html += '</tbody></table>';
    document.getElementById('myOrdersTable').innerHTML = html;
  } catch (error) {
    document.getElementById('myOrdersTable').innerHTML = `<p style="color: #d32f2f;">${error.message}</p>`;
  }
}

async function viewOrderDetail(orderId) {
  try {
    const response = await getOrderById(orderId);
    const order = response.data;

    const modal = `
      <div>
        <h3 style="color: var(--gold); margin-bottom: 1rem;">${order.orderNumber}</h3>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <p style="color: var(--gold);">Package</p>
            <p style="color: var(--light-gray);">${order.packageType}</p>
          </div>
          <div>
            <p style="color: var(--gold);">Status</p>
            <p style="color: var(--light-gray);">${order.status}</p>
          </div>
          <div>
            <p style="color: var(--gold);">Budget</p>
            <p style="color: var(--light-gray);">$${order.budget || 'N/A'}</p>
          </div>
          <div>
            <p style="color: var(--gold);">Delivery Date</p>
            <p style="color: var(--light-gray);">${formatDate(order.deliveryDate)}</p>
          </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <p style="color: var(--gold);">Description</p>
          <p style="color: var(--light-gray);">${order.description}</p>
        </div>

        ${order.notes ? `
          <div style="margin-bottom: 1.5rem;">
            <p style="color: var(--gold);">Notes from Creator</p>
            <p style="color: var(--light-gray);">${order.notes}</p>
          </div>
        ` : ''}

        <button class="btn btn-secondary" style="width: 100%; padding: 0.8rem;" onclick="this.closest('.modal').remove()">Close</button>
      </div>
    `;

    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal active';
    modalDiv.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Order Details</h2>
          <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        ${modal}
      </div>
    `;
    document.body.appendChild(modalDiv);
    modalDiv.onclick = (e) => {
      if (e.target === modalDiv) modalDiv.remove();
    };
  } catch (error) {
    alert('Error loading order');
  }
}

// ==================== BROWSE REELS ====================

let allBrowseReels = [];

async function loadBrowseReels() {
  try {
    const response = await getAllReels();
    allBrowseReels = response.data || [];
    displayBrowseReels(allBrowseReels);
  } catch (error) {
    document.getElementById('browseReelsGrid').innerHTML = `<p style="color: #d32f2f;">${error.message}</p>`;
  }
}

function displayBrowseReels(reels) {
  const grid = document.getElementById('browseReelsGrid');
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
      <div class="card-image">
        <img src="${reel.thumbnailPath}" alt="${reel.title}">
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
    card.onclick = () => openReelDetailClient(reel);
    grid.appendChild(card);
  });
}

function filterBrowseReels() {
  const search = document.getElementById('clientSearchInput').value.toLowerCase();
  const category = document.getElementById('clientCategoryFilter').value;

  const filtered = allBrowseReels.filter(reel => {
    const matchesSearch = reel.title.toLowerCase().includes(search) || 
                         reel.description.toLowerCase().includes(search);
    const matchesCategory = !category || reel.category === category;
    return matchesSearch && matchesCategory;
  });

  displayBrowseReels(filtered);
}

function openReelDetailClient(reel) {
  const modal = `
    <div>
      <video width="100%" controls style="margin-bottom: 1rem; border-radius: 8px;">
        <source src="${reel.videoPath}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      
      <h3 style="color: var(--gold); margin-bottom: 1rem;">${reel.title}</h3>
      <p style="color: var(--light-gray); margin-bottom: 1rem;">${reel.description}</p>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <p style="color: var(--gold);">Category</p>
          <p style="color: var(--light-gray);">${reel.category}</p>
        </div>
        <div>
          <p style="color: var(--gold);">Views</p>
          <p style="color: var(--light-gray);">${reel.views}</p>
        </div>
      </div>

      <button class="btn btn-primary" style="width: 100%; padding: 0.8rem;" onclick="switchTab('new-order'); this.closest('.modal').remove();">Order Similar Video</button>
    </div>
  `;

  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal active';
  modalDiv.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Reel Details</h2>
        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      ${modal}
    </div>
  `;
  document.body.appendChild(modalDiv);
  modalDiv.onclick = (e) => {
    if (e.target === modalDiv) modalDiv.remove();
  };
}

// ==================== NEW ORDER ====================

async function handleNewOrder(e) {
  e.preventDefault();

  try {
    const packageType = document.getElementById('orderPackageType').value;
    const description = document.getElementById('orderDescription').value;
    const budget = document.getElementById('orderBudget').value;
    const deliveryDate = document.getElementById('orderDeliveryDate').value;
    const referenceFile = document.getElementById('orderReferenceFile').files[0];

    const orderData = {
      packageType,
      description,
      budget: parseInt(budget) || 0,
      deliveryDate: deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const result = await createOrder(orderData, referenceFile);

    showAlert('orderAlert', 'Order placed successfully!', 'success');
    document.getElementById('newOrderForm').reset();

    // Reload orders
    setTimeout(() => {
      switchTab('my-orders');
    }, 1500);
  } catch (error) {
    showAlert('orderAlert', error.message, 'error');
  }
}

// ==================== TESTIMONIALS ====================

async function loadPublishedTestimonials() {
  try {
    const response = await getTestimonials();
    const testimonials = response.data || [];

    const grid = document.getElementById('clientTestimonialsGrid');
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
      `;
      
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading testimonials:', error);
  }
}

// ==================== FEEDBACK ====================

async function loadFeedbackOrders() {
  try {
    const response = await getOrders();
    const orders = response.data || [];

    const select = document.getElementById('feedbackOrder');
    select.innerHTML = '<option value="">Select an order</option>';

    orders.forEach(order => {
      const option = document.createElement('option');
      option.value = order._id;
      option.textContent = `${order.orderNumber} - ${order.packageType}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

async function handleFeedback(e) {
  e.preventDefault();

  try {
    const order = document.getElementById('feedbackOrder').value;
    const subject = document.getElementById('feedbackSubject').value;
    const message = document.getElementById('feedbackMessage').value;
    const category = document.getElementById('feedbackCategory').value;
    const rating = document.getElementById('feedbackRating').value;

    const feedbackData = {
      order,
      subject,
      message,
      category,
      rating: rating ? parseInt(rating) : null
    };

    const result = await createFeedback(feedbackData);

    showAlert('feedbackAlert', 'Feedback submitted successfully!', 'success');
    document.getElementById('clientFeedbackForm').reset();
  } catch (error) {
    showAlert('feedbackAlert', error.message, 'error');
  }
}
