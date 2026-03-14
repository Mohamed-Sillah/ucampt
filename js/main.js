function searchProduct() {
  let input = document.getElementById("searchInput").value.toLowerCase();
  let cards = document.querySelectorAll(".card");

  cards.forEach(function(card) {
    let productName = card.querySelector(".product_name").textContent.toLowerCase();

    if (productName.includes(input)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}




document.querySelectorAll(".view-details").forEach(link => {

  link.addEventListener("click", function(e) {

    e.preventDefault();

    const card = this.closest(".card");
    if (!card) return;

    const product = {
      name: card.dataset.name || card.querySelector('.product_name')?.textContent || '',
      price: card.dataset.price || (card.querySelectorAll('h3')[2] && card.querySelectorAll('h3')[2].textContent) || '',
      category: card.dataset.category || '',
      posted: card.dataset.posted || '',
      description: card.dataset.description || '',
      seller: card.dataset.seller || '',
      contact: card.dataset.contact || '',
      payment: card.dataset.payment || '',
      notes: card.dataset.notes || '',
      image: card.dataset.image || card.querySelector('img')?.src || ''
    };

    // Save selected product to sessionStorage for product detail page
    try { sessionStorage.setItem('currentProduct', JSON.stringify(product)); } catch (err) { console.warn('Could not save product data', err); }

    // If current page has an inline product details section, populate it
    const inline = document.getElementById('productDetails');
    if (inline) {
      document.getElementById("detailName").textContent = product.name;
      document.getElementById("detailPrice").textContent = product.price;
      document.getElementById("detailCategory").textContent = product.category;
      document.getElementById("detailPosted").textContent = product.posted;
      document.getElementById("detailDescription").textContent = product.description;
      document.getElementById("detailSeller").textContent = product.seller;
      document.getElementById("detailContact").textContent = product.contact;
      document.getElementById("detailPayment").textContent = product.payment;
      document.getElementById("detailNotes").textContent = product.notes;
      const imgEl = document.getElementById("detailImage");
      if (imgEl) imgEl.src = product.image;

      document.getElementById("callBtn").onclick = () => { window.location.href = "tel:" + product.contact; };
      document.getElementById("whatsappBtn").onclick = () => { window.open("https://wa.me/" + product.contact.replace("+","")); };
      document.getElementById("copyBtn").onclick = () => { navigator.clipboard.writeText(product.contact); alert("Contact copied!"); };

      inline.style.display = 'block';
    } else {
      // otherwise open product.html in a full-screen iframe overlay
      openProductOverlay('product.html');
    }

  });

});

// Open a full-screen iframe showing the given URL and hide current page content
function openProductOverlay(url) {
  if (document.getElementById('productOverlayFrame')) return;

  // store current visibility states
  const preserved = [];
  Array.from(document.body.children).forEach(child => {
    if (child.id === 'productOverlayFrame' || child.id === 'productOverlayBack') return;
    preserved.push({ el: child, display: child.style.display || '' });
    child.style.display = 'none';
  });

  const iframe = document.createElement('iframe');
  iframe.id = 'productOverlayFrame';
  iframe.src = url;
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = '0';
  iframe.style.zIndex = '99999';
  document.body.appendChild(iframe);

  const back = document.createElement('button');
  back.id = 'productOverlayBack';
  back.textContent = 'Back to Marketplace';
  back.style.position = 'fixed';
  back.style.top = '12px';
  back.style.left = '12px';
  back.style.zIndex = '100000';
  back.style.padding = '8px 12px';
  back.style.background = '#0756e7';
  back.style.color = '#fff';
  back.style.border = 'none';
  back.style.borderRadius = '6px';
  document.body.appendChild(back);

  back.addEventListener('click', function() {
    // remove iframe and back button
    const f = document.getElementById('productOverlayFrame');
    const b = document.getElementById('productOverlayBack');
    if (f) f.remove();
    if (b) b.remove();
    // restore preserved display
    preserved.forEach(p => { p.el.style.display = p.display; });
  });
}


// Admin login handler: if on admin login page, validate password and redirect
const adminForm = document.getElementById('adminLoginForm');
if (adminForm) {
  adminForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail') ? document.getElementById('adminEmail').value.trim() : '';
    const password = document.getElementById('adminPassword') ? document.getElementById('adminPassword').value : '';
    const errorEl = document.getElementById('loginError');
    if (password === 'stack001' && email) {
      if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
      window.location.href = 'adminDashboard.html';
    } else {
      if (errorEl) {
        errorEl.textContent = 'Login Failed';
        errorEl.style.display = 'block';
        // clear after a few seconds
        setTimeout(() => { errorEl.style.display = 'none'; errorEl.textContent = ''; }, 5000);
      } else {
        alert('Invalid credentials.');
      }
    }
  });
}

// Admin dashboard: update listing count and attach delete handlers
function updateListingsCount() {
  const tbody = document.querySelector('table tbody');
  const count = tbody ? tbody.querySelectorAll('tr').length : 0;
  const el = document.getElementById('listingsCount');
  if (el) el.textContent = `${count} listings`;
}

function attachDeleteHandlers() {
  document.querySelectorAll('.btn-delete').forEach(btn => {
    // avoid adding duplicate handlers
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function() {
      if (!confirm('Delete this listing?')) return;
      const row = this.closest('tr');
      if (row) row.remove();
      updateListingsCount();
      // notify about deletion (get title/price from row dataset if available or cells)
      const title = row ? (row.dataset.title || (row.cells[1] && row.cells[1].textContent) || '') : '';
      const price = row ? (row.dataset.price || (row.cells[2] && row.cells[2].textContent) || '') : '';
      addNotification({ action: 'deleted', title, price });
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  updateListingsCount();
  attachDeleteHandlers();
  attachEditHandlers();
  loadTempListings();
  updateNotificationBadge();
  const icon = document.getElementById('notificationIcon');
  if (icon) icon.addEventListener('click', function(e) { e.preventDefault(); toggleNotifications(); });
  // forgot password handler
  const sendBtn = document.getElementById('sendResetBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const emailEl = document.getElementById('resetEmail');
      const msgEl = document.getElementById('resetMsg');
      if (!emailEl || !msgEl) return;
      const email = emailEl.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        msgEl.style.display = 'block';
        msgEl.style.color = 'red';
        msgEl.textContent = 'Please enter a valid email address';
        setTimeout(() => { msgEl.style.display = 'none'; }, 5000);
        return;
      }
      // simulate sending reset link
      msgEl.style.display = 'block';
      msgEl.style.color = 'green';
      msgEl.textContent = `Reset link sent to ${email}`;
      sendBtn.disabled = true;
      setTimeout(() => { sendBtn.disabled = false; msgEl.style.display = 'none'; }, 6000);
    });
  }
});

// Helpers and edit handlers
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function attachEditHandlers() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    // avoid duplicate handlers
    if (btn.dataset.boundEdit === '1') return;
    btn.dataset.boundEdit = '1';
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      if (!row) return;
      const titleCell = row.cells[1];
      const priceCell = row.cells[2];
      const categoryCell = row.cells[3];

      if (this.dataset.mode !== 'editing') {
        // enter edit mode
        this.dataset.mode = 'editing';
        row.dataset.origTitle = titleCell.textContent;
        row.dataset.origPrice = priceCell.textContent;
        row.dataset.origCategory = categoryCell.textContent;

        titleCell.innerHTML = `<input type="text" class="edit-title" value="${escapeHtml(row.dataset.origTitle)}">`;
        priceCell.innerHTML = `<input type="text" class="edit-price" value="${escapeHtml(row.dataset.origPrice)}">`;
        categoryCell.innerHTML = `<input type="text" class="edit-category" value="${escapeHtml(row.dataset.origCategory)}">`;

        this.textContent = 'Save';

        const cancel = document.createElement('button');
        cancel.textContent = 'Cancel';
        cancel.className = 'btn-cancel';
        cancel.style.marginLeft = '6px';
        this.after(cancel);

        cancel.addEventListener('click', function() {
          titleCell.textContent = row.dataset.origTitle;
          priceCell.textContent = row.dataset.origPrice;
          categoryCell.textContent = row.dataset.origCategory;
          btn.textContent = 'Edit';
          delete btn.dataset.mode;
          cancel.remove();
        });

      } else {
        // save
        const newTitle = titleCell.querySelector('.edit-title')?.value.trim() || row.dataset.origTitle;
        const newPrice = priceCell.querySelector('.edit-price')?.value.trim() || row.dataset.origPrice;
        const newCategory = categoryCell.querySelector('.edit-category')?.value.trim() || row.dataset.origCategory;

        titleCell.textContent = newTitle;
        priceCell.textContent = newPrice;
        categoryCell.textContent = newCategory;

          // add update notification
          addNotification({ action: 'updated', title: newTitle, price: newPrice });

        this.textContent = 'Edit';
        delete this.dataset.mode;

        const next = this.nextElementSibling;
        if (next && next.classList && next.classList.contains('btn-cancel')) next.remove();
      }
    });
  });
}

// Add a single listing object as a new table row and attach handlers
function addListingToTable(listing) {
  const tbody = document.querySelector('table tbody');
  if (!tbody) return;
  const tr = document.createElement('tr');

  const imgTd = document.createElement('td');
  const img = document.createElement('img');
  img.width = 40; img.height = 40;
  img.src = listing.image || 'images/placeholder.png';
  imgTd.appendChild(img);

  const titleTd = document.createElement('td');
  titleTd.textContent = listing.title || '';

  const priceTd = document.createElement('td');
  priceTd.textContent = listing.price || '';

  const categoryTd = document.createElement('td');
  categoryTd.textContent = listing.category || '';

  const actionsTd = document.createElement('td');
  const editBtn = document.createElement('button');
  editBtn.className = 'btn-edit'; editBtn.textContent = 'Edit';
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete'; deleteBtn.textContent = 'Delete';
  actionsTd.appendChild(editBtn);
  actionsTd.appendChild(deleteBtn);

  tr.appendChild(imgTd);
  tr.appendChild(titleTd);
  tr.appendChild(priceTd);
  tr.appendChild(categoryTd);
  tr.appendChild(actionsTd);

  tbody.appendChild(tr);

  // Attach handlers directly to avoid global re-binding issues
  deleteBtn.addEventListener('click', function() {
    if (!confirm('Delete this listing?')) return;
    tr.remove();
    updateListingsCount();
    addNotification({ action: 'deleted', title: listing.title, price: listing.price });
  });

  // reuse existing edit logic by marking and calling attachEditHandlers on this button
  // ensure it gets bound
  editBtn.dataset.boundEdit = '0';
  attachEditHandlers();
  updateListingsCount();
}

// Load temporary listings saved in sessionStorage and render them
function loadTempListings() {
  const data = sessionStorage.getItem('tempListings');
  if (!data) return;
  try {
    const arr = JSON.parse(data);
    if (!Array.isArray(arr) || arr.length === 0) return;
    arr.forEach(listing => {
      addListingToTable(listing);
      addNotification({ action: 'created', title: listing.title, price: listing.price });
    });
    // clear temp listings after loading so they don't duplicate on refresh
    sessionStorage.removeItem('tempListings');
  } catch (e) {
    console.error('Failed to load temp listings', e);
  }
}

// Notifications: store in sessionStorage under 'notifications'
function getNotifications() {
  try { return JSON.parse(sessionStorage.getItem('notifications') || '[]'); } catch { return []; }
}

function saveNotifications(arr) { sessionStorage.setItem('notifications', JSON.stringify(arr)); }

function addNotification({ action, title, price }) {
  const arr = getNotifications();
  arr.unshift({ id: Date.now(), action, title, price, time: new Date().toISOString(), read: false });
  // keep only latest 50
  if (arr.length > 50) arr.length = 50;
  saveNotifications(arr);
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const el = document.getElementById('notifBadge');
  const arr = getNotifications();
  const unread = arr.filter(n => !n.read).length;
  if (!el) return;
  el.textContent = unread ? String(unread) : '';
  el.style.display = unread ? 'inline-block' : 'none';
}

function renderNotifications() {
  let popup = document.getElementById('notificationPopup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'notificationPopup';
    popup.style.position = 'absolute';
    popup.style.right = '16px';
    popup.style.top = '56px';
    popup.style.width = '320px';
    popup.style.maxHeight = '400px';
    popup.style.overflow = 'auto';
    popup.style.background = '#fff';
    popup.style.border = '1px solid #ccc';
    popup.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    popup.style.borderRadius = '8px';
    popup.style.zIndex = '9999';
    document.body.appendChild(popup);
  }
  const arr = getNotifications();
  if (arr.length === 0) {
    popup.innerHTML = '<div style="padding:12px;color:#333;">No notifications</div>';
    return popup;
  }
  popup.innerHTML = arr.map(n => {
    const when = new Date(n.time).toLocaleString();
    const verb = n.action === 'created' ? 'Created' : n.action === 'updated' ? 'Updated' : 'Deleted';
    return `<div style="padding:10px;border-bottom:1px solid #eee;"><strong>${verb}:</strong> ${escapeHtml(n.title || '')} <br><small style=\"color:#666\">${escapeHtml(n.price || '')} — ${when}</small></div>`;
  }).join('');
  return popup;
}

function toggleNotifications() {
  const popup = renderNotifications();
  if (!popup) return;
  popup.style.display = (popup.style.display === 'block') ? 'none' : 'block';
  if (popup.style.display === 'block') {
    // mark all as read
    const arr = getNotifications().map(n => ({ ...n, read: true }));
    saveNotifications(arr);
    updateNotificationBadge();
  }
}

// Close popup when clicking outside
document.addEventListener('click', function(e) {
  const popup = document.getElementById('notificationPopup');
  const icon = document.getElementById('notificationIcon');
  if (!popup || !icon) return;
  if (icon.contains(e.target)) return; // clicking icon handled elsewhere
  if (!popup.contains(e.target)) popup.style.display = 'none';
});

