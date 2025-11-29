const toothReference = {
    tumbuh: {
        atas: {
            "Seri Tengah": { min: 8, max: 12 },
            "Seri Samping": { min: 9, max: 13 },
            "Taring": { min: 16, max: 22 },
            "Geraham Depan": { min: 13, max: 19 },
            "Geraham Belakang": { min: 25, max: 33 }
        },
        bawah: {
            "Seri Tengah": { min: 6, max: 10 },
            "Seri Samping": { min: 10, max: 16 },
            "Taring": { min: 17, max: 23 },
            "Geraham Depan": { min: 14, max: 18 },
            "Geraham Belakang": { min: 23, max: 31 }
        }
    },
    copot: {
        atas: {
            "Seri Tengah": { min: 6 * 12, max: 7 * 12 },
            "Seri Samping": { min: 7 * 12, max: 8 * 12 },
            "Taring": { min: 9 * 12, max: 12 * 12 },
            "Geraham Depan": { min: 9 * 12, max: 11 * 12 },
            "Geraham Belakang": { min: 10 * 12, max: 12 * 12 }
        },
        bawah: {
            "Seri Tengah": { min: 6 * 12, max: 7 * 12 },
            "Seri Samping": { min: 7 * 12, max: 8 * 12 },
            "Taring": { min: 9 * 12, max: 12 * 12 },
            "Geraham Depan": { min: 9 * 12, max: 11 * 12 },
            "Geraham Belakang": { min: 10 * 12, max: 12 * 12 }
        }
    }
};

let currentChild = null;
let selectedToothElement = null;
let tempDeleteData = null;
let childToDeleteId = null;
let deleteMode = 'record';

function loadChildData() {
    const selectedId = localStorage.getItem("selectedChildId");
    const childrenStr = localStorage.getItem("children");

    if (!selectedId || !childrenStr) {
        window.location.href = "input-anak.html";
        return;
    }

    const children = JSON.parse(childrenStr);
    const foundChild = children.find(c => String(c.id) === String(selectedId));

    if (!foundChild) {
        window.location.href = "input-anak.html";
        return;
    }

    currentChild = {
        nama: foundChild.nama,
        tanggalLahir: new Date(foundChild.tanggalLahir),
        gender: foundChild.gender || 'boy' // Default ke boy jika data lama tidak ada gender
    };
}

document.addEventListener('DOMContentLoaded', () => {
    loadChildData();
    if (currentChild) {
        initApp();
        setupNavigation();
        setupToothInteraction();
        setupLogout();
    }
});

function initApp() {
    document.getElementById('namaAnakHeader').textContent = currentChild.nama;
    document.getElementById('namaAnakProfile').textContent = currentChild.nama;

    // UPDATE IKON PROFIL UTAMA
    const avatarIconDiv = document.querySelector('.avatar-icon');
    if (currentChild.gender === 'girl') {
        avatarIconDiv.innerHTML = '<i class="fa-solid fa-child-dress"></i>';
        avatarIconDiv.style.backgroundColor = '#fce7f3'; // Background Pink muda
        avatarIconDiv.style.color = '#db2777'; // Ikon Pink
    } else {
        avatarIconDiv.innerHTML = '<i class="fa-solid fa-child"></i>';
        avatarIconDiv.style.backgroundColor = '#e0f2fe'; // Background Biru muda
        avatarIconDiv.style.color = '#0284c7'; // Ikon Biru
    }

    const filterBtn = document.getElementById('filterName');
    if (filterBtn) filterBtn.textContent = currentChild.nama;

    const now = new Date();
    const ageNow = calculateAgeDetail(currentChild.tanggalLahir, now);
    document.getElementById('umurAnakHeader').textContent = `${ageNow.years} Thn ${ageNow.months} Bln`;

    document.getElementById('inputTanggal').valueAsDate = new Date();

    setupChildDropdown();
    loadFilterAnak(); // Menambahkan pemanggilan loadFilterAnak sesuai request
}

// Fungsi loadFilterAnak yang diminta untuk ditambahkan
function loadFilterAnak() {
    const filter = document.getElementById("filterContainer");
    // Pastikan elemen filterContainer ada di HTML Anda, atau sesuaikan ID-nya
    if (!filter) return; 

    let children = JSON.parse(localStorage.getItem("children")) || [];

    filter.innerHTML = `
        <span><i class="fa-solid fa-filter"></i> Filter</span>
        <button class="badge badge-grey" data-anak="all">Semua</button>
    `;

    children.forEach(child => {
        filter.innerHTML += `
            <button class="badge badge-pink" data-anak="${child.nama}">
                ${child.nama}
            </button>
        `;
    });

    // tambahkan event listener untuk filter
    filter.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            const selected = btn.getAttribute("data-anak");
            // Pastikan fungsi loadCatatan sudah didefinisikan atau sesuaikan logikanya
            if (typeof loadCatatan === 'function') {
                loadCatatan(selected);
            } else {
                console.warn("Fungsi loadCatatan belum didefinisikan.");
            }
        });
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('logoutModal').style.display = 'flex';
        });
    }
}

window.closeLogoutModal = function() {
    document.getElementById('logoutModal').style.display = 'none';
}

window.confirmLogout = function() {
    localStorage.removeItem("selectedChildId");
    window.location.href = "input-anak.html";
}

function getAgeInMonths(birthDate, eventDate) {
    let months = (eventDate.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += eventDate.getMonth();
    return months <= 0 ? 0 : months;
}

function analyzeToothStatus(jawPos, toothName, status, ageInMonths) {
    const rules = toothReference[status][jawPos.toLowerCase()][toothName];

    if (!rules) return { status: "Data Tidak Ada", class: "badge-grey" };

    const { min, max } = rules;

    let resultText = "";
    let badgeClass = "";
    let isDelayed = false;

    if (ageInMonths < min) {
        resultText = status === 'tumbuh' ? "Tumbuh Dini" : "Copot Dini";
        badgeClass = "badge-blue";
    } else if (ageInMonths >= min && ageInMonths <= max) {
        resultText = "Normal";
        badgeClass = "badge-green";
    } else {
        isDelayed = true;
        if (status === 'tumbuh') {
            resultText = "Telat Tumbuh";
            badgeClass = "badge-red";
        } else {
            resultText = "Telat Copot";
            badgeClass = "badge-red";
        }
    }

    let rangeText = "";
    if (status === 'tumbuh') {
        rangeText = `(Batasan Usia: ${min}-${max} bulan)`;
    } else {
        rangeText = `(Batasan Usia: ${min / 12}-${max / 12} tahun)`;
    }

    return {
        text: resultText,
        detail: rangeText,
        cssClass: badgeClass,
        isDelayed: isDelayed
    };
}

function calculateAgeDetail(birthDate, currentDate) {
    let years = currentDate.getFullYear() - birthDate.getFullYear();
    let months = currentDate.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && currentDate.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
    }
    return { years, months };
}

function setupToothInteraction() {
    const teeth = document.querySelectorAll('.tooth');
    const modal = document.getElementById('toothModal');
    const inputPosisi = document.getElementById('inputPosisi');

    teeth.forEach(tooth => {
        tooth.addEventListener('click', function() {
            selectedToothElement = this;
            const posisi = this.getAttribute('data-posisi');
            const nama = this.getAttribute('data-nama');

            inputPosisi.value = `${nama} - ${posisi}`;
            modal.style.display = 'flex';
        });
    });
}

function closeModal() {
    document.getElementById('toothModal').style.display = 'none';
    document.getElementById('toothForm').reset();
    document.getElementById('inputTanggal').valueAsDate = new Date();
}

function saveToothData(e) {
    e.preventDefault();

    if (!selectedToothElement) return;

    const rawPosisi = selectedToothElement.getAttribute('data-posisi');
    const toothName = selectedToothElement.getAttribute('data-nama');
    const inputDate = new Date(document.getElementById('inputTanggal').value);
    const statusAction = document.getElementById('inputStatus').value;
    const catatanUser = document.getElementById('inputCatatan').value;

    const jawLocation = rawPosisi.split(' ')[0];

    const ageInMonths = getAgeInMonths(currentChild.tanggalLahir, inputDate);

    const displayAgeYear = Math.floor(ageInMonths / 12);
    const displayAgeMonth = ageInMonths % 12;
    const displayAgeString = `${displayAgeYear} Thn ${displayAgeMonth} Bln`;

    const analysis = analyzeToothStatus(jawLocation, toothName, statusAction, ageInMonths);

    updateTable(inputDate, toothName, rawPosisi, statusAction, displayAgeString, analysis, catatanUser);
    updateVisualMap(statusAction);
    updateStats(statusAction);

    closeModal();
    showSavedPopup(toothName, jawLocation, statusAction, analysis);
}

function updateTable(date, tooth, pos, status, ageStr, analysis, note) {
    const tbody = document.getElementById('catatan-body');
    const emptyMsg = document.getElementById('empty-message');

    if (emptyMsg) emptyMsg.style.display = 'none';

    const row = document.createElement('tr');

    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const statusBadge = status === 'tumbuh'
        ? '<span class="status-tag tag-green">Tumbuh</span>'
        : '<span class="status-tag tag-orange">Copot</span>';

    row.innerHTML = `
        <td>${dateStr}</td>
        <td>${currentChild.nama}</td>
        <td><strong>${tooth}</strong><br><small>${pos}</small></td>
        <td>${statusBadge}</td>
        <td>${ageStr}</td>
        <td>
            <span class="badge ${analysis.cssClass}">${analysis.text}</span>
            <br><small style="font-size:10px; color:#777;">${analysis.detail}</small>
        </td>
        <td>${note || "-"}</td>
        <td>
            <button class="btn-delete" onclick="askToDelete(this, '${tooth}', '${pos}', '${status}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
    `;

    tbody.insertBefore(row, tbody.firstChild);
}

function updateVisualMap(status) {
    selectedToothElement.classList.remove('active', 'copot');
    if (status === 'tumbuh') {
        selectedToothElement.classList.add('active');
    } else if (status === 'copot') {
        selectedToothElement.classList.add('copot');
    }
}

function updateStats(status) {
    const tumbuhEl = document.getElementById('stat-tumbuh');
    const copotEl = document.getElementById('stat-copot');
    const belumEl = document.getElementById('stat-belum');

    let tumbuhCount = parseInt(tumbuhEl.innerText);
    let copotCount = parseInt(copotEl.innerText);
    let belumCount = parseInt(belumEl.innerText);

    if (status === 'tumbuh') {
        tumbuhCount++;
        belumCount--;
    } else if (status === 'copot') {
        copotCount++;
    }

    tumbuhEl.innerText = tumbuhCount;
    copotEl.innerText = copotCount;
    belumEl.innerText = belumCount < 0 ? 0 : belumCount;
}

function showSavedPopup(toothName, position, status, analysis) {
    const popup = document.getElementById('savedPopup');
    const icon = document.getElementById('popupIcon');

    document.getElementById('popupGigiName').textContent = `${toothName} (${position})`;
    document.getElementById('popupStatusVal').textContent = status === 'tumbuh' ? "Sudah Tumbuh" : "Sudah Copot";

    document.getElementById('popupAnalisisVal').textContent = `${analysis.text} — ${analysis.detail}`;

    icon.className = "fa-solid fa-circle-check";

    if (analysis.text.includes("Telat")) {
        icon.classList.add("icon-late");
    } else if (analysis.text.includes("Dini")) {
        icon.classList.add("icon-early");
    } else {
        icon.classList.add("icon-normal");
    }

    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
    }, 4000);
}

function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pages = document.querySelectorAll('.page-content');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-page');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

function setupChildDropdown() {
    const dropdownBtn = document.getElementById('profileDropdownBtn');
    const menu = document.getElementById('childMenu');

    dropdownBtn.addEventListener('click', (e) => {
        if (e.target.closest('.child-item') || e.target.closest('.add-child-btn')) return;

        menu.classList.toggle('show');
        dropdownBtn.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target)) {
            menu.classList.remove('show');
            dropdownBtn.classList.remove('open');
        }
    });

    renderChildList();
}

function renderChildList() {
    const menu = document.getElementById('childMenu');
    const children = JSON.parse(localStorage.getItem("children")) || [];
    const currentId = localStorage.getItem("selectedChildId");

    menu.innerHTML = '';

    children.forEach(child => {
        const item = document.createElement('div');
        item.className = `child-item ${String(child.id) === String(currentId) ? 'active' : ''}`;

        // IKON BERDASARKAN GENDER DI DROPDOWN
        let iconHtml = '<i class="fa-solid fa-child"></i>'; // Default Boy
        let genderClass = 'icon-boy';
        
        if (child.gender === 'girl') {
            iconHtml = '<i class="fa-solid fa-child-dress"></i>';
            genderClass = 'icon-girl';
        }

        item.innerHTML = `
            <div class="child-info">
                <span class="${genderClass}">${iconHtml}</span> ${child.nama}
            </div>
            <div class="btn-delete-child">
                <i class="fa-solid fa-trash"></i>
            </div>
        `;

        const infoDiv = item.querySelector('.child-info');
        infoDiv.addEventListener('click', () => {
            localStorage.setItem("selectedChildId", String(child.id));
            location.reload();
        });

        const deleteBtn = item.querySelector('.btn-delete-child');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            askToDeleteChild(child.id, child.nama);
        });

        menu.appendChild(item);
    });

    const addBtn = document.createElement('div');
    addBtn.className = 'add-child-btn';
    addBtn.innerHTML = `<i class="fa-solid fa-circle-plus"></i> Tambah Anak`;
    addBtn.addEventListener('click', () => {
        window.location.href = 'input-anak.html';
    });

    menu.appendChild(addBtn);
}

window.askToDelete = function(btn, toothName, position, status) {
    deleteMode = 'record';
    tempDeleteData = {
        elementBtn: btn,
        toothName: toothName,
        position: position,
        status: status
    };

    document.querySelector('.delete-modal-content h3').textContent = "Hapus Catatan?";
    document.querySelector('.delete-modal-content p').innerHTML = "Apakah Anda yakin ingin menghapus data ini?";
    document.getElementById('deleteModal').style.display = 'flex';
}

window.askToDeleteChild = function(childId, childName) {
    deleteMode = 'child';
    childToDeleteId = childId;

    document.querySelector('.delete-modal-content h3').textContent = "Hapus Profil Anak?";
    document.querySelector('.delete-modal-content p').innerHTML = `Yakin ingin menghapus profil <b>${childName}</b>? <br>Semua data gigi anak ini akan hilang permanen.`;
    document.getElementById('deleteModal').style.display = 'flex';
}

window.closeDeleteModal = function() {
    document.getElementById('deleteModal').style.display = 'none';
    tempDeleteData = null;
    childToDeleteId = null;
}

window.confirmDelete = function() {
    if (deleteMode === 'child') {
        if (!childToDeleteId) return;

        let children = JSON.parse(localStorage.getItem("children")) || [];
        children = children.filter(c => String(c.id) !== String(childToDeleteId));
        localStorage.setItem("children", JSON.stringify(children));

        if (children.length === 0) {
            localStorage.removeItem("selectedChildId");
            alert("Semua data anak telah dihapus. Kembali ke halaman awal.");
            window.location.href = 'input-anak.html';
        } else {
            if (String(childToDeleteId) === String(localStorage.getItem("selectedChildId"))) {
                localStorage.setItem("selectedChildId", children[0].id);
                location.reload();
            } else {
                renderChildList();
                closeDeleteModal();
            }
        }
        return;
    }

    if (deleteMode === 'record') {
        if (!tempDeleteData) return;
        const { elementBtn, toothName, position, status } = tempDeleteData;

        const row = elementBtn.closest('tr');
        row.remove();

        const tbody = document.getElementById('catatan-body');
        if (tbody.children.length === 0) {
            document.getElementById('empty-message').style.display = 'block';
        }

        const toothEl = document.querySelector(`.tooth[data-nama="${toothName}"][data-posisi="${position}"]`);
        if (toothEl) {
            if (status === 'tumbuh') {
                toothEl.classList.remove('active');
            } else if (status === 'copot') {
                toothEl.classList.remove('copot');
                toothEl.classList.add('active');
            }
        }

        const tumbuhEl = document.getElementById('stat-tumbuh');
        const copotEl = document.getElementById('stat-copot');
        const belumEl = document.getElementById('stat-belum');

        let tumbuhCount = parseInt(tumbuhEl.innerText);
        let copotCount = parseInt(copotEl.innerText);
        let belumCount = parseInt(belumEl.innerText);

        if (status === 'tumbuh') {
            tumbuhCount = Math.max(0, tumbuhCount - 1);
            belumCount++;
        } else if (status === 'copot') {
            copotCount = Math.max(0, copotCount - 1);
        }

        tumbuhEl.innerText = tumbuhCount;
        copotEl.innerText = copotCount;
        belumEl.innerText = belumCount;

        closeDeleteModal();
    }
}