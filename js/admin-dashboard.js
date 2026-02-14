// ADMIN DASHBOARD SCRIPT

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in and is owner
  if (!isLoggedIn() || !isOwner()) {
    window.location.href = 'login.html';
    return;
  }

  const user = getCurrentUser();
  document.getElementById('userGreeting').textContent = `Welcome, ${user.name}`;

  // Form listeners
  document.getElementById('uploadReelForm').addEventListener('submit', handleReelUpload);

  // Load initial data
  loadManageReels();
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
    case 'manage-reels':
      loadManageReels();
      break;
    case 'orders':
      loadOrders();
      break;
    case 'testimonials':
      loadTestimonials();
      break;
    case 'feedback':
      loadFeedback();
      break;
  }
}

// ==================== REEL UPLOAD ====================

async function handleReelUpload(e) {
  e.preventDefault();

  try {
    const title = document.getElementById('reelTitle').value;
    const description = document.getElementById('reelDescription').value;
    const category = document.getElementById('reelCategory').value;
    const duration = document.getElementById('reelDuration').value;
    const videoFile = document.getElementById('reelVideo').files[0];
    const thumbnailFile = document.getElementById('reelThumbnail').files[0];

    if (!videoFile || !thumbnailFile) {
      throw new Error('Please select both video and thumbnail');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('duration', duration || 0);
    formData.append('video', videoFile);
    formData.append('thumbnail', thumbnailFile);

    const result = await uploadReel(formData);

    showAlert('uploadAlert', 'Reel uploaded successfully!', 'success');
    document.getElementById('uploadReelForm').reset();

    // Reload reels list
    setTimeout(() => {
      loadManageReels();
    }, 1500);
  } catch (error) {
    showAlert('uploadAlert', error.message, 'error');
  }
}

// ==================== MANAGE REELS ====================

async function loadManageReels() {
  try {
    const response = await getAllReels();
    const reels = response.data || [];

    let html = `<table class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Views</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

    if (reels.length === 0) {
      html += '<tr><td colspan="5" style="text-align: center;">No reels yet</td></tr>';
    } else {
      reels.forEach(reel => {
        html += `
          <tr>
            <td>${reel.title}</td>
            <td><span class="badge badge-gold">${reel.category}</span></td>
            <td>${reel.views}</td>
            <td>${reel.isFeatured ? '✓' : ''}</td>
            <td>
              <button class="btn btn-secondary" onclick="toggleFeature('${reel._id}', ${reel.isFeatured})" 
                style="padding: 0.4rem 0.8rem; font-size: 0.9rem;">
                ${reel.isFeatured ? 'Unfeature' : 'Feature'}
              </button>
              <button class="btn btn-logout" onclick="deleteReelConfirm('${reel._id}')" 
                style="padding: 0.4rem 0.8rem; font-size: 0.9rem;">
                Delete
              </button>
            </td>
          </tr>
        `;
      });
    }

    html += '</tbody></table>';
    document.getElementById('reelsTable').innerHTML = html;
  } catch (error) {
    document.getElementById('reelsTable').innerHTML = `<p style="color: #d32f2f;">${error.message}</p>`;
  }
}

async function toggleFeature(reelId, currentFeatured) {
  try {
    const formData = new FormData();
    formData.append('isFeatured', !currentFeatured);

    await updateReel(reelId, formData);
    loadManageReels();
  } catch (error) {
    alert('Error updating reel');
  }
}

async function deleteReelConfirm(reelId) {
  if (confirm('Are you sure you want to delete this reel?')) {
    try {
      await deleteReel(reelId);
      loadManageReels();
    } catch (error) {
      alert('Error deleting reel');
    }
  }
}

// ==================== ORDERS ====================

async function loadOrders() {
  try {
    const response = await getOrders();
    const orders = response.data || [];

    let html = `<table class="table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Client</th>
          <th>Package</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

    if (orders.length === 0) {
      html += '<tr><td colspan="5" style="text-align: center;">No orders yet</td></tr>';
    } else {
      orders.forEach(order => {
        const statusClass = order.status === 'completed' ? 'badge-success' : 
                           order.status === 'working' ? 'badge-pending' : 'badge-danger';
        html += `
          <tr>
            <td>${order.orderNumber}</td>
            <td>${order.client.name}</td>
            <td><span class="badge badge-gold">${order.packageType}</span></td>
            <td><span class="badge ${statusClass}">${order.status}</span></td>
            <td>
              <button class="btn btn-secondary" onclick="openOrderModal('${order._id}')" 
                style="padding: 0.4rem 0.8rem; font-size: 0.9rem;">
                View
              </button>
            </td>
          </tr>
        `;
      });
    }

    html += '</tbody></table>';
    document.getElementById('ordersTable').innerHTML = html;
  } catch (error) {
    document.getElementById('ordersTable').innerHTML = `<p style="color: #d32f2f;">${error.message}</p>`;
  }
}

async function openOrderModal(orderId) {
  try {
    const response = await getOrderById(orderId);
    const order = response.data;

    const statusOptions = ['pending', 'working', 'completed', 'cancelled'];
    const statusSelect = statusOptions.map(s => 
      `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`
    ).join('');

    const modal = `
      <div style="background: var(--secondary-black); padding: 2rem; border-radius: 10px;">
        <h3 style="color: var(--gold); margin-bottom: 1rem;">${order.orderNumber}</h3>
        
        <div style="margin-bottom: 1rem;">
          <label style="color: var(--text-primary); display: block; margin-bottom: 0.5rem;">Client: ${order.client.name}</label>
          <label style="color: var(--text-primary); display: block; margin-bottom: 0.5rem;">Email: ${order.client.email}</label>
          <label style="color: var(--text-primary); display: block; margin-bottom: 0.5rem;">Package: ${order.packageType}</label>
        </div>

        <div style="margin-bottom: 1rem;">
          <p style="color: var(--gold);">Description</p>
          <p style="color: var(--light-gray);">${order.description}</p>
        </div>

        ${order.referenceFile ? `
        <div style="margin-bottom: 1rem;">
          <p style="color: var(--gold);">Reference File</p>
          <a onclick="downloadOrderFile('${order.referenceFile}')" style="color: var(--gold); text-decoration: underline; cursor: pointer;">
            Download Reference File
          </a>
        </div>
        ` : ''}

          ${order.uploadedPhotos && order.uploadedPhotos.length > 0 ? `
          <div style="margin-bottom: 1rem;">
            <p style="color: var(--gold);">Uploaded Photos (${order.uploadedPhotos.length})</p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${order.uploadedPhotos.map((photo, index) => `
                <a onclick="downloadOrderFile('${photo}')" style="color: var(--gold); text-decoration: underline; cursor: pointer; margin-right: 1rem;">
                  Photo ${index + 1}
                </a>
              `).join('')}
            </div>
          </div>
          ` : ''}

          ${order.uploadedVideos && order.uploadedVideos.length > 0 ? `
          <div style="margin-bottom: 1rem;">
            <p style="color: var(--gold);">Uploaded Videos (${order.uploadedVideos.length})</p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${order.uploadedVideos.map((video, index) => `
                <a onclick="downloadOrderFile('${video}')" style="color: var(--gold); text-decoration: underline; cursor: pointer; margin-right: 1rem;">
                  Video ${index + 1}
                </a>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div style="margin-bottom: 1.5rem;">
          <label style="color: var(--text-primary); display: block; margin-bottom: 0.5rem;">Status</label>
          <select id="orderStatus" style="width: 100%; padding: 0.8rem; background-color: var(--tertiary-black); border: 1px solid var(--gold); color: var(--text-primary); border-radius: 5px;">
            ${statusSelect}
          </select>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="color: var(--text-primary); display: block; margin-bottom: 0.5rem;">Notes</label>
          <textarea id="orderNotes" style="width: 100%; padding: 0.8rem; background-color: var(--tertiary-black); border: 1px solid var(--gold); color: var(--text-primary); border-radius: 5px;">${order.notes || ''}</textarea>
        </div>

        <button class="btn btn-primary" style="width: 100%; padding: 0.8rem;" onclick="saveOrder('${orderId}')">Save Changes</button>
      </div>
    `;

    // Create modal
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

async function saveOrder(orderId) {
  try {
    const status = document.getElementById('orderStatus').value;
    const notes = document.getElementById('orderNotes').value;

    await updateOrder(orderId, { status, notes });

    document.querySelector('.modal').remove();
    loadOrders();
  } catch (error) {
    alert('Error saving order');
  }
}

async function downloadOrderFile(filePath) {
  try {
    const token = getToken();
    
    if (!token) {
      alert('Error: You are not logged in. Please login first.');
      window.location.href = 'login.html';
      return;
    }

    console.log('Download - Token:', token.substring(0, 20) + '...');
    console.log('Download - FilePath:', filePath);

    const response = await fetch(`${API_BASE_URL}/orders/download/${filePath}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      let errorMessage = 'Failed to download file';
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.error('Download error:', errorMessage);
      throw new Error(errorMessage);
    }

    const fileName = filePath.split('/').pop();
    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    alert('Error downloading file: ' + error.message);
  }
}

// ==================== TESTIMONIALS ====================

async function loadTestimonials() {
  try {
    const response = await getAllTestimonials();
    const testimonials = response.data || [];

    let html = `<table class="table">
      <thead>
        <tr>
          <th>Client</th>
          <th>Title</th>
          <th>Rating</th>
          <th>Published</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

    if (testimonials.length === 0) {
      html += '<tr><td colspan="5" style="text-align: center;">No testimonials</td></tr>';
    } else {
      testimonials.forEach(t => {
        html += `
          <tr>
            <td>${t.client.name}</td>
            <td>${t.title}</td>
            <td>${'⭐'.repeat(t.rating)}</td>
            <td>${t.isPublished ? '✓' : '✗'}</td>
            <td>
              <button class="btn btn-secondary" onclick="togglePublish('${t._id}', ${t.isPublished})" 
                style="padding: 0.4rem 0.8rem; font-size: 0.9rem;">
                ${t.isPublished ? 'Unpublish' : 'Publish'}
              </button>
            </td>
          </tr>
        `;
      });
    }

    html += '</tbody></table>';
    document.getElementById('testimonialsTable').innerHTML = html;
  } catch (error) {
    document.getElementById('testimonialsTable').innerHTML = `<p style="color: #d32f2f;">${error.message}</p>`;
  }
}

async function togglePublish(testimonialId, currentPublished) {
  try {
    await updateTestimonial(testimonialId, { isPublished: !currentPublished });
    loadTestimonials();
  } catch (error) {
    alert('Error updating testimonial');
  }
}

// ==================== FEEDBACK ====================

async function loadFeedback() {
  try {
    const response = await getFeedback();
    const feedback = response.data || [];

    let html = `<table class="table">
      <thead>
        <tr>
          <th>Client</th>
          <th>Subject</th>
          <th>Category</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

    if (feedback.length === 0) {
      html += '<tr><td colspan="5" style="text-align: center;">No feedback</td></tr>';
    } else {
      feedback.forEach(f => {
        const statusClass = f.status === 'resolved' ? 'badge-success' : 
                           f.status === 'reviewed' ? 'badge-pending' : 'badge-danger';
        html += `
          <tr>
            <td>${f.client.name}</td>
            <td>${f.subject}</td>
            <td><span class="badge badge-gold">${f.category}</span></td>
            <td><span class="badge ${statusClass}">${f.status}</span></td>
            <td>
              <button class="btn btn-secondary" onclick="openFeedbackModal('${f._id}')" 
                style="padding: 0.4rem 0.8rem; font-size: 0.9rem;">
                Reply
              </button>
            </td>
          </tr>
        `;
      });
    }

    html += '</tbody></table>';
    document.getElementById('feedbackTable').innerHTML = html;
  } catch (error) {
    document.getElementById('feedbackTable').innerHTML = `<p style="color: #d32f2f;">${error.message}</p>`;
  }
}

async function openFeedbackModal(feedbackId) {
  try {
    // Here you would fetch the feedback details and show a form to respond
    alert('Feedback response feature coming soon');
  } catch (error) {
    alert('Error loading feedback');
  }
}
