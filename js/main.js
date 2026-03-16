// ── Utility ────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Search ──────────────────────────────────────────────────────────────────
function searchProduct() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const name = card.querySelector('.product_name')?.textContent.toLowerCase() || '';
    card.style.display = name.includes(input) ? '' : 'none';
  });
}

// ── Product overlay (full-screen iframe) ────────────────────────────────────
function openProductOverlay(url) {
  if (document.getElementById('productOverlayFrame')) return;

  const preserved = [];
  Array.from(document.body.children).forEach(child => {
    if (child.id === 'productOverlayFrame' || child.id === 'productOverlayBack') return;
    preserved.push({ el: child, display: child.style.display || '' });
    child.style.display = 'none';
  });

  const iframe = document.createElement('iframe');
  iframe.id = 'productOverlayFrame';
  Object.assign(iframe.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%', border: '0', zIndex: '99999'
  });
  iframe.src = url;
  document.body.appendChild(iframe);

  const back = document.createElement('button');
  back.id = 'productOverlayBack';
  back.textContent = 'Back to Marketplace';
  Object.assign(back.style, {
    position: 'fixed', top: '12px', left: '12px', zIndex: '100000',
    padding: '8px 12px', background: '#0756e7', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer'
  });
  document.body.appendChild(back);

  back.addEventListener('click', () => {
    document.getElementById('productOverlayFrame')?.remove();
    document.getElementById('productOverlayBack')?.remove();
    preserved.forEach(p => { p.el.style.display = p.display; });
  });
}

// ── View-details: save product to sessionStorage & navigate ─────────────────
document.querySelectorAll('.view-details').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const card = this.closest('.card');
    if (!card) return;

    const product = {
      name:        card.dataset.name        || card.querySelector('.product_name')?.textContent || '',
      price:       card.dataset.price       || card.querySelectorAll('h3')[2]?.textContent || '',
      category:    card.dataset.category    || '',
      posted:      card.dataset.posted      || '',
      description: card.dataset.description || '',
      seller:      card.dataset.seller      || '',
      contact:     card.dataset.contact     || '',
      payment:     card.dataset.payment     || '',
      notes:       card.dataset.notes       || '',
      image:       card.dataset.image       || card.querySelector('img')?.src || ''
    };

    try { sessionStorage.setItem('currentProduct', JSON.stringify(product)); } catch (err) { console.warn(err); }

    const inline = document.getElementById('productDetails');
    if (inline) {
      document.getElementById('detailName').textContent        = product.name;
      document.getElementById('detailPrice').textContent       = product.price;
      document.getElementById('detailCategory').textContent    = product.category;
      document.getElementById('detailPosted').textContent      = product.posted;
      document.getElementById('detailDescription').textContent = product.description;
      document.getElementById('detailSeller').textContent      = product.seller;
      document.getElementById('detailContact').textContent     = product.contact;
      document.getElementById('detailPayment').textContent     = product.payment;
      document.getElementById('detailNotes').textContent       = product.notes;
      const imgEl = document.getElementById('detailImage');
      if (imgEl) imgEl.src = product.image;

      document.getElementById('callBtn').onclick     = () => { window.location.href = 'tel:' + product.contact; };
      document.getElementById('whatsappBtn').onclick = () => { window.open('https://wa.me/' + product.contact.replace('+', '')); };
      document.getElementById('copyBtn').onclick     = () => { navigator.clipboard.writeText(product.contact); alert('Contact copied!'); };

      inline.style.display = 'block';
    } else {
      openProductOverlay('product.html');
    }
  });
});

// ── Admin login ──────────────────────────────────────────────────────────────
const adminForm = document.getElementById('adminLoginForm');
if (adminForm) {
  adminForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email    = document.getElementById('adminEmail')?.value.trim() || '';
    const password = document.getElementById('adminPassword')?.value || '';
    const errorEl  = document.getElementById('loginError');

    if (password === 'stack001' && email) {
      window.location.href = 'adminDashboard.html';
    } else {
      if (errorEl) {
        errorEl.textContent = 'Login Failed';
        errorEl.style.display = 'block';
        setTimeout(() => { errorEl.style.display = 'none'; errorEl.textContent = ''; }, 5000);
      } else {
        alert('Invalid credentials.');
      }
    }
  });
}

// ── Notifications ────────────────────────────────────────────────────────────
function getNotifications() {
  try { return JSON.parse(sessionStorage.getItem('notifications') || '[]'); } catch { return []; }
}
function saveNotifications(arr) { sessionStorage.setItem('notifications', JSON.stringify(arr)); }

function addNotification({ action, title, price }) {
  const arr = getNotifications();
  arr.unshift({ id: Date.now(), action, title, price, time: new Date().toISOString(), read: false });
  if (arr.length > 50) arr.length = 50;
  saveNotifications(arr);
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const el = document.getElementById('notifBadge');
  if (!el) return;
  const unread = getNotifications().filter(n => !n.read).length;
  el.textContent = unread ? String(unread) : '';
  el.style.display = unread ? 'inline-block' : 'none';
}

function renderNotifications() {
  let popup = document.getElementById('notificationPopup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'notificationPopup';
    Object.assign(popup.style, {
      position: 'absolute', right: '16px', top: '56px',
      width: '320px', maxHeight: '400px', overflow: 'auto',
      background: '#fff', border: '1px solid #ccc',
      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      borderRadius: '8px', zIndex: '9999', display: 'none'
    });
    document.body.appendChild(popup);
  }

  const arr = getNotifications();
  if (!arr.length) {
    popup.innerHTML = '<div style="padding:12px;color:#333;">No notifications</div>';
    return popup;
  }

  const labels = { created: 'Created', updated: 'Updated', deleted: 'Deleted' };
  popup.innerHTML = arr.map(n => `
    <div style="padding:10px;border-bottom:1px solid #eee;">
      <strong>${labels[n.action] || n.action}:</strong> ${escapeHtml(n.title || '')}
      <br><small style="color:#666">${escapeHtml(n.price || '')} — ${new Date(n.time).toLocaleString()}</small>
    </div>`).join('');
  return popup;
}

function toggleNotifications() {
  const popup = renderNotifications();
  if (!popup) return;
  const isOpen = popup.style.display === 'block';
  popup.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    saveNotifications(getNotifications().map(n => ({ ...n, read: true })));
    updateNotificationBadge();
  }
}

document.addEventListener('click', e => {
  const popup = document.getElementById('notificationPopup');
  const icon  = document.getElementById('notificationIcon');
  if (!popup || !icon || icon.contains(e.target)) return;
  if (!popup.contains(e.target)) popup.style.display = 'none';
});

// ── Dashboard: listing count ─────────────────────────────────────────────────
function updateListingsCount() {
  const tbody = document.querySelector('table tbody');
  const el    = document.getElementById('listingsCount');
  if (el && tbody) el.textContent = `${tbody.querySelectorAll('tr').length} listings`;
}

// ── Dashboard: edit handlers ─────────────────────────────────────────────────
function attachEditHandlers() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', function () {
      const row          = this.closest('tr');
      if (!row) return;
      const titleCell    = row.cells[1];
      const priceCell    = row.cells[2];
      const categoryCell = row.cells[3];

      if (this.dataset.mode !== 'editing') {
        this.dataset.mode = 'editing';
        row.dataset.origTitle    = titleCell.textContent;
        row.dataset.origPrice    = priceCell.textContent;
        row.dataset.origCategory = categoryCell.textContent;

        titleCell.innerHTML    = `<input type="text" class="edit-title"    value="${escapeHtml(row.dataset.origTitle)}">`;
        priceCell.innerHTML    = `<input type="text" class="edit-price"    value="${escapeHtml(row.dataset.origPrice)}">`;
        categoryCell.innerHTML = `<input type="text" class="edit-category" value="${escapeHtml(row.dataset.origCategory)}">`;

        this.textContent = 'Save';

        const cancel = document.createElement('button');
        cancel.textContent = 'Cancel';
        cancel.className   = 'btn-cancel';
        cancel.style.marginLeft = '6px';
        this.after(cancel);

        cancel.addEventListener('click', () => {
          titleCell.textContent    = row.dataset.origTitle;
          priceCell.textContent    = row.dataset.origPrice;
          categoryCell.textContent = row.dataset.origCategory;
          btn.textContent = 'Edit';
          delete btn.dataset.mode;
          cancel.remove();
        });

      } else {
        const newTitle    = titleCell.querySelector('.edit-title')?.value.trim()    || row.dataset.origTitle;
        const newPrice    = priceCell.querySelector('.edit-price')?.value.trim()    || row.dataset.origPrice;
        const newCategory = categoryCell.querySelector('.edit-category')?.value.trim() || row.dataset.origCategory;

        titleCell.textContent    = newTitle;
        priceCell.textContent    = newPrice;
        categoryCell.textContent = newCategory;

        addNotification({ action: 'updated', title: newTitle, price: newPrice });

        this.textContent = 'Edit';
        delete this.dataset.mode;
        this.nextElementSibling?.classList.contains('btn-cancel') && this.nextElementSibling.remove();
      }
    });
  });
}

// ── Dashboard: delete handlers ───────────────────────────────────────────────
function attachDeleteHandlers() {
  document.querySelectorAll('.btn-delete').forEach(btn => {
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      if (!confirm('Delete this listing?')) return;
      const row   = this.closest('tr');
      const title = row?.cells[1]?.textContent || '';
      const price = row?.cells[2]?.textContent || '';
      row?.remove();
      updateListingsCount();
      addNotification({ action: 'deleted', title, price });
    });
  });
}

// ── Dashboard: add a new row ─────────────────────────────────────────────────
function addListingToTable(listing) {
  const tbody = document.querySelector('table tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><img src="${escapeHtml(listing.image || 'images/placeholder.png')}" width="40" height="40" style="border-radius:6px;"></td>
    <td>${escapeHtml(listing.title || '')}</td>
    <td>${escapeHtml(listing.price || '')}</td>
    <td>${escapeHtml(listing.category || '')}</td>
    <td>
      <button class="btn-edit">Edit</button>
      <button class="btn-delete">Delete</button>
    </td>`;
  tbody.appendChild(tr);

  attachEditHandlers();
  attachDeleteHandlers();
  updateListingsCount();
}

// ── Load temp listings from sessionStorage (created via createListing.html) ──
function loadTempListings() {
  try {
    const arr = JSON.parse(sessionStorage.getItem('tempListings') || '[]');
    if (!arr.length) return;
    arr.forEach(listing => {
      addListingToTable(listing);
      addNotification({ action: 'created', title: listing.title, price: listing.price });
    });
    sessionStorage.removeItem('tempListings');
  } catch (e) { console.error('Failed to load temp listings', e); }
}

// ── Forgot-password handler ──────────────────────────────────────────────────
function initForgotPassword() {
  const sendBtn = document.getElementById('sendResetBtn');
  if (!sendBtn) return;
  sendBtn.addEventListener('click', e => {
    e.preventDefault();
    const emailEl = document.getElementById('resetEmail');
    const msgEl   = document.getElementById('resetMsg');
    if (!emailEl || !msgEl) return;
    const email = emailEl.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msgEl.style.cssText = 'display:block;color:red;';
      msgEl.textContent   = 'Please enter a valid email address';
      setTimeout(() => { msgEl.style.display = 'none'; }, 5000);
      return;
    }
    msgEl.style.cssText = 'display:block;color:green;';
    msgEl.textContent   = `Reset link sent to ${email}`;
    sendBtn.disabled    = true;
    setTimeout(() => { sendBtn.disabled = false; msgEl.style.display = 'none'; }, 6000);
  });
}

// ── DOMContentLoaded bootstrap ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateListingsCount();
  attachDeleteHandlers();
  attachEditHandlers();
  loadTempListings();
  updateNotificationBadge();
  initForgotPassword();

  document.getElementById('notificationIcon')?.addEventListener('click', e => {
    e.preventDefault();
    toggleNotifications();
  });
});
