// Skrip global: login/register, input anak, data anak, dan dashboard

const CHILDREN_KEY = 'children';
const ANAK_LIST_KEY = 'anakList'; // kompatibel dengan halaman konsultasi lama
const SELECTED_CHILD_KEY = 'selectedChildId';

function computeAgeYears(tanggalLahir) {
  if (!tanggalLahir) return '';
  const lahir = new Date(tanggalLahir);
  if (Number.isNaN(lahir.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - lahir.getFullYear();
  const monthDiff = now.getMonth() - lahir.getMonth();
  const dayDiff = now.getDate() - lahir.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) years--;
  return years < 0 ? '0' : String(years);
}

function normalizeChild(child, idx = 0) {
  const id = child.id ?? Date.now() + idx;
  const nama = child.nama || child.name || 'Anak';
  const tanggalLahir = child.tanggalLahir || child.tgllahir || '';
  const catatan = child.catatan || '';
  const usia = child.usia || computeAgeYears(tanggalLahir);
  return { id, nama, tanggalLahir, catatan, usia };
}

function loadChildren() {
  try {
    const stored = localStorage.getItem(CHILDREN_KEY) || localStorage.getItem(ANAK_LIST_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((child, idx) => normalizeChild(child, idx));
  } catch (err) {
    console.error('Gagal membaca data anak:', err);
    return [];
  }
}

function saveChildren(children) {
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
  // Simpan juga format lama untuk kompatibilitas konsultasi
  const anakList = children.map((child, idx) => ({
    id: child.id ?? Date.now() + idx,
    nama: child.nama,
    usia: child.usia || computeAgeYears(child.tanggalLahir),
    tanggalLahir: child.tanggalLahir || '',
    catatan: child.catatan || ''
  }));
  localStorage.setItem(ANAK_LIST_KEY, JSON.stringify(anakList));
}

function clearChildData() {
  localStorage.removeItem(CHILDREN_KEY);
  localStorage.removeItem(ANAK_LIST_KEY);
  localStorage.removeItem(SELECTED_CHILD_KEY);
}

function getSelectedChildId() {
  return localStorage.getItem(SELECTED_CHILD_KEY);
}

function setSelectedChild(id) {
  if (id === undefined || id === null) return;
  localStorage.setItem(SELECTED_CHILD_KEY, String(id));
}

function setSelectedChildIfMissing(children, fallbackId) {
  const selectedId = getSelectedChildId();
  const exists = children.some((c) => String(c.id) === String(selectedId));
  if (!selectedId || !exists) {
    const newId = fallbackId ?? (children[0] ? children[0].id : null);
    if (newId !== null && newId !== undefined) setSelectedChild(newId);
  }
}

function hitungUsia(tanggalLahir) {
  if (!tanggalLahir) return '-';
  const lahir = new Date(tanggalLahir);
  if (Number.isNaN(lahir.getTime())) return '-';
  const sekarang = new Date();
  let tahun = sekarang.getFullYear() - lahir.getFullYear();
  let bulan = sekarang.getMonth() - lahir.getMonth();
  if (sekarang.getDate() < lahir.getDate()) bulan--;
  if (bulan < 0) {
    tahun--;
    bulan += 12;
  }
  if (tahun <= 0 && bulan <= 0) return '0 Bulan';
  if (tahun <= 0) return `${bulan} Bulan`;
  if (bulan <= 0) return `${tahun} Tahun`;
  return `${tahun} Tahun ${bulan} Bulan`;
}

function getCurrentPageName() {
  const last = window.location.pathname.split('/').filter(Boolean).pop();
  return last || 'index.html';
}

function loadSidebar() {
  const placeholder = document.getElementById('sidebar-placeholder');
  if (!placeholder) return;

  const requiresAuth = placeholder.dataset.public !== 'true';
  if (requiresAuth && !localStorage.getItem('token')) {
    window.location.href = 'masuk.html';
    return;
  }

  fetch('navbar.html')
    .then((res) => res.text())
    .then((html) => {
      placeholder.innerHTML = html;
      const activePage = placeholder.dataset.active || getCurrentPageName();
      placeholder.querySelectorAll('.sidebar-link').forEach((link) => {
        const page = link.getAttribute('data-page');
        link.classList.toggle('active', page === activePage);
      });

      // Filter menu untuk role dokter
      let currentUser = null;
      try {
        currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      } catch (err) {
        currentUser = null;
      }
      if (currentUser && currentUser.role === 'doctor') {
        const allowed = new Set(['konsultasi.html', 'pengaturan.html']);
        placeholder.querySelectorAll('.sidebar-link').forEach((link) => {
          const page = link.getAttribute('data-page');
          if (page && !allowed.has(page)) {
            const li = link.closest('li');
            if (li) li.style.display = 'none';
          }
        });
        const currentPage = getCurrentPageName();
        if (!allowed.has(currentPage)) {
          window.location.href = 'konsultasi.html';
        }
      }
    })
    .catch(() => {
      placeholder.innerHTML = '<p>Gagal memuat navigasi.</p>';
    });
}

function setupAuthForms() {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(registerForm);
      if (formData.get('password') !== formData.get('konfirmasi_password')) {
        alert('Password dan konfirmasi tidak sama.');
        return;
      }
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role') || 'user'
      };
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Registrasi gagal');
          return;
        }
        window.location.href = 'masuk.html';
      } catch (err) {
        alert('Terjadi kesalahan saat registrasi.');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const payload = {
        email: formData.get('email'),
        password: formData.get('password')
      };
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Login gagal');
          return;
        }
        // Bersihkan data anak hanya jika email akun berbeda
        let prevUser = null;
        try {
          prevUser = JSON.parse(localStorage.getItem('user') || 'null');
        } catch (err) {
          prevUser = null;
        }
        const emailChanged =
          prevUser && prevUser.email && data.user && data.user.email && prevUser.email !== data.user.email;
        if (emailChanged) {
          clearChildData();
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
      } catch (err) {
        alert('Terjadi kesalahan saat login.');
      }
    });
  }
}

function setupLogout() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('#logout-btn');
    if (!target) return;
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'masuk.html';
  });
}

function addChildRecord({ nama, tanggalLahir, catatan }) {
  const children = loadChildren();
  const usia = computeAgeYears(tanggalLahir);
  const newChild = { id: Date.now(), nama, tanggalLahir, catatan: catatan || '', usia };
  children.push(newChild);
  saveChildren(children);
  setSelectedChildIfMissing(children, newChild.id);
  return children;
}

function setupInputAnakForm() {
  const childForm = document.getElementById('childForm');
  if (!childForm) return;

  const childStatus = document.getElementById('childStatus');
  const childList = document.getElementById('childList');
  const redirectTarget = childForm.dataset.redirect || 'dashboard.html';

  function renderChildList() {
    if (!childList) return;
    const children = loadChildren();
    childList.innerHTML = '';
    if (children.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'child-empty';
      empty.textContent = 'Belum ada data anak.';
      childList.appendChild(empty);
      return;
    }
    children.forEach((child) => {
      const card = document.createElement('div');
      card.className = 'child-card';
      card.innerHTML = `
        <div>
          <div class="child-name">${child.nama}</div>
          <div class="child-meta">${child.tanggalLahir || '-'} • ${child.usia ? child.usia + ' th' : hitungUsia(child.tanggalLahir)}</div>
        </div>
        <button class="btn btn-outline child-delete" data-id="${child.id}">Hapus</button>
      `;
      childList.appendChild(card);
    });
  }

  if (childList) {
    childList.addEventListener('click', (e) => {
      const btn = e.target.closest('.child-delete');
      if (!btn) return;
      const id = btn.dataset.id;
      const children = loadChildren().filter((c) => String(c.id) !== String(id));
      saveChildren(children);
      setSelectedChildIfMissing(children);
      renderChildList();
    });
    renderChildList();
  }

  childForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const nama = document.getElementById('namaAnak').value.trim();
    const tanggalLahir = document.getElementById('tglLahir').value;
    if (!nama || !tanggalLahir) {
      alert('Isi semua data');
      return;
    }
    addChildRecord({ nama, tanggalLahir });
    if (childStatus) {
      childStatus.textContent = 'Data anak tersimpan.';
      childStatus.classList.add('success');
      setTimeout(() => (childStatus.textContent = ''), 2000);
    }
    if (childList) renderChildList();
    if (redirectTarget !== 'none') {
      window.location.href = redirectTarget;
    } else {
      childForm.reset();
    }
  });
}

function setupDashboard() {
  const dashboardRoot = document.querySelector('.main-content');
  if (!dashboardRoot) return;

  const children = loadChildren();
  if (children.length === 0) {
    const fallback = document.createElement('div');
    fallback.className = 'empty-state';
    fallback.style.margin = '40px';
    fallback.innerHTML =
      '<h3>Tambahkan data anak terlebih dahulu</h3><p><a href="input-anak.html" class="btn btn-primary" style="margin-top:12px;display:inline-block;">Ke halaman Input Anak</a></p>';
    dashboardRoot.innerHTML = '';
    dashboardRoot.appendChild(fallback);
    return;
  }

  setSelectedChildIfMissing(children, children[0].id);
  let selectedChildId = getSelectedChildId();
  let activeChild = children.find((c) => String(c.id) === String(selectedChildId));
  if (!activeChild) {
    activeChild = children[0];
    selectedChildId = String(activeChild.id);
    setSelectedChild(selectedChildId);
  }

  let riwayatGigi = [];
  let currentToothElement = null;

  function showPage(pageId, element) {
    document.querySelectorAll('.page-content').forEach((p) => p.classList.remove('active'));
    const pageEl = document.getElementById(pageId);
    if (pageEl) pageEl.classList.add('active');

    document.querySelectorAll('.menu-item').forEach((i) => i.classList.remove('active'));
    if (element) element.classList.add('active');

    if (pageId === 'catatan') renderTable();
  }

  document.querySelectorAll('.tooth').forEach((tooth) => {
    tooth.addEventListener('click', function () {
      openModal(this, this.dataset.posisi, this.dataset.nama);
    });
  });

  document.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('click', function (event) {
      event.preventDefault();
      const page = this.dataset.page;
      showPage(page, this);
    });
  });

  const namaHeaderEl = document.getElementById('namaAnakHeader');
  const umurHeaderEl = document.getElementById('umurAnakHeader');
  const namaProfileEl = document.getElementById('namaAnakProfile');
  if (namaHeaderEl) namaHeaderEl.innerText = activeChild.nama;
  if (umurHeaderEl) umurHeaderEl.innerText = hitungUsia(activeChild.tanggalLahir);
  if (namaProfileEl) namaProfileEl.innerText = activeChild.nama;

  const menu = document.getElementById('childMenu');
  function renderChildMenu() {
    if (!menu) return;
    menu.innerHTML = '';
    children.forEach((child) => {
      const item = document.createElement('div');
      item.className = 'child-item';
      item.innerText = child.nama;
      if (String(child.id) === String(selectedChildId)) {
        item.style.background = '#f0f6ff';
        item.style.fontWeight = '600';
      }
      item.addEventListener('click', () => {
        setSelectedChild(child.id);
        location.reload();
      });
      menu.appendChild(item);
    });
    const addBtn = document.createElement('div');
    addBtn.className = 'child-add';
    addBtn.innerText = '+ Tambah Anak';
    addBtn.addEventListener('click', () => (window.location.href = 'input-anak.html'));
    menu.appendChild(addBtn);
  }

  const profileArrow = document.getElementById('profileArrow');
  if (profileArrow) {
    profileArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      renderChildMenu();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
  }
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-profile') && menu) menu.style.display = 'none';
  });

  function openModal(element, posisi, namaGigi) {
    currentToothElement = element;
    const modal = document.getElementById('toothModal');
    document.getElementById('inputPosisi').value = `${namaGigi} (${posisi})`;
    document.getElementById('inputTanggal').valueAsDate = new Date();
    modal.style.display = 'flex';
  }
  function closeModal() {
    const modal = document.getElementById('toothModal');
    if (modal) modal.style.display = 'none';
  }
  window.openModal = openModal;
  window.closeModal = closeModal;

  function saveToothData(e) {
    e.preventDefault();
    if (!currentToothElement) return;

    const posisi = document.getElementById('inputPosisi').value;
    const tanggal = document.getElementById('inputTanggal').value;
    const status = document.getElementById('inputStatus').value;
    const catatan = document.getElementById('inputCatatan').value;

    currentToothElement.classList.remove('active', 'copot');
    if (status === 'tumbuh') currentToothElement.classList.add('active');
    else if (status === 'copot') currentToothElement.classList.add('copot');

    const dataBaru = {
      id: Date.now(),
      tanggal: formatDate(tanggal),
      anak: activeChild.nama,
      gigi: posisi,
      status: status === 'tumbuh' ? 'Tumbuh' : status === 'copot' ? 'Copot' : 'Belum',
      usia: hitungUsia(activeChild.tanggalLahir),
      catatan: catatan || '-'
    };

    riwayatGigi.unshift(dataBaru);
    updateStats();
    closeModal();
    const form = document.getElementById('toothForm');
    if (form) form.reset();
    showSavedPopup();
    renderTable();
  }
  window.saveToothData = saveToothData;

  function showSavedPopup() {
    const popup = document.getElementById('savedPopup');
    if (!popup) return;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 2000);
  }

  function deleteLog(id) {
    if (confirm('Yakin ingin menghapus catatan ini?')) {
      riwayatGigi = riwayatGigi.filter((item) => item.id !== id);
      renderTable();
      updateStats();
    }
  }
  window.deleteLog = deleteLog;

  function renderTable() {
    const tbody = document.getElementById('catatan-body');
    const emptyMsg = document.getElementById('empty-message');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (riwayatGigi.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    riwayatGigi.forEach((data) => {
      let statusClass = 'status-belum';
      if (data.status === 'Tumbuh') statusClass = 'status-tumbuh';
      if (data.status === 'Copot') statusClass = 'status-copot';

      const row = `
        <tr>
          <td>${data.tanggal}</td>
          <td>${data.anak}</td>
          <td style="font-weight:500;">${data.gigi}</td>
          <td><span class="badge-status ${statusClass}">${data.status}</span></td>
          <td>${data.usia}</td>
          <td style="font-style:italic; color:#666;">${data.catatan}</td>
          <td>
            <button class="btn-delete" onclick="deleteLog(${data.id})" title="Hapus">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', row);
    });
  }

  function updateStats() {
    let tumbuh = 0,
      copot = 0;
    document.querySelectorAll('.tooth').forEach((t) => {
      if (t.classList.contains('active')) tumbuh++;
      if (t.classList.contains('copot')) copot++;
    });
    const bel = 20 - tumbuh - copot;
    const statTumbuh = document.getElementById('stat-tumbuh');
    const statCopot = document.getElementById('stat-copot');
    const statBelum = document.getElementById('stat-belum');
    if (statTumbuh) statTumbuh.innerText = tumbuh;
    if (statCopot) statCopot.innerText = copot;
    if (statBelum) statBelum.innerText = bel;
  }

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  updateStats();
}

function setupSettingsPage() {
  const form = document.getElementById('profileForm');
  if (!form) return;
  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const statusEl = document.getElementById('profileStatus');
  const oldPwd = document.getElementById('oldPassword');
  const newPwd = document.getElementById('newPassword');
  const confirmPwd = document.getElementById('confirmPassword');

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch (err) {
    user = null;
  }

  if (user) {
    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = nameInput ? nameInput.value.trim() : '';
    if (!newName) {
      alert('Nama tidak boleh kosong');
      return;
    }
    if (!user) user = {};
    user.name = newName;
    if (emailInput && emailInput.value) user.email = emailInput.value;
    // Validasi password opsional
    const newVal = newPwd ? newPwd.value.trim() : '';
    const confirmVal = confirmPwd ? confirmPwd.value.trim() : '';
    const oldVal = oldPwd ? oldPwd.value.trim() : '';
    if (newVal || confirmVal || oldVal) {
      if (!oldVal) {
        alert('Isi password saat ini untuk mengganti password.');
        return;
      }
      if (newVal.length < 6) {
        alert('Password baru minimal 6 karakter.');
        return;
      }
      if (newVal !== confirmVal) {
        alert('Konfirmasi password tidak sama.');
        return;
      }
      // Simulasi berhasil ganti password
    }

    localStorage.setItem('user', JSON.stringify(user));
    if (statusEl) {
      statusEl.textContent = newVal ? 'Profil & password berhasil diperbarui (simulasi).' : 'Profil berhasil diperbarui (tersimpan di perangkat ini).';
      statusEl.classList.add('success');
      setTimeout(() => (statusEl.textContent = ''), 2000);
    }
    if (form) form.reset();
    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupAuthForms();
  loadSidebar();
  setupInputAnakForm();
  setupDashboard();
  setupSettingsPage();
  setupLogout();
});

function tandaiDibaca(tombol) {
    // Ubah teks tombol
    tombol.innerText = "Terbaca";
    
    // Tambahkan class CSS supaya warnanya jadi abu-abu
    tombol.classList.add('btn-disabled');
    
    // Matikan tombol supaya gak bisa diklik lagi
    tombol.disabled = true;
}
