// ORDER PAGE SCRIPT

document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();

  if (isLoggedIn()) {
    document.getElementById('orderForm').style.display = 'block';
    document.getElementById('loginPrompt').style.display = 'none';
    document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);
  }
});

function checkLoginStatus() {
  if (!isLoggedIn()) {
    document.getElementById('orderForm').style.display = 'none';
    document.getElementById('loginPrompt').style.display = 'block';
  }
}

async function handleOrderSubmit(e) {
  e.preventDefault();

  try {
    const packageType = document.getElementById('packageType').value;
    const description = document.getElementById('description').value;
    const budget = document.getElementById('budget').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const photoFiles = document.getElementById('uploadPhotos').files;
    const videoFiles = document.getElementById('uploadVideos').files;

    if (photoFiles.length === 0) {
      throw new Error('Please upload at least one photo');
    }

    if (videoFiles.length === 0) {
      throw new Error('Please upload at least one video');
    }

    const orderData = {
      packageType,
      description,
      budget: parseInt(budget) || 0,
      deliveryDate: deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const result = await createOrder(orderData, null, photoFiles, videoFiles);

    showAlert('formAlert', 'Order placed successfully! Our team will review and contact you soon.', 'success');
    
    // Reset form
    document.getElementById('orderForm').reset();

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      window.location.href = isOwner() ? 'admin-dashboard.html' : 'client-dashboard.html';
    }, 2000);
  } catch (error) {
    showAlert('formAlert', error.message, 'error');
  }
}
