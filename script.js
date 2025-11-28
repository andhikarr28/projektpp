// --- DATABASE SEMENTARA ---
let riwayatGigi = [];
let currentToothElement = null;

// --- NAVIGASI HALAMAN ---
function showPage(pageId, element) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    if(element) element.classList.add('active');

    if(pageId === 'catatan') renderTable();
}

document.querySelectorAll('.tooth').forEach(tooth => {
    tooth.addEventListener('click', function () {
        openModal(this, this.dataset.posisi, this.dataset.nama);
    });
});

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function (event) {
        event.preventDefault(); // supaya tidak reload halaman

        const page = this.dataset.page;
        showPage(page, this);
    });
});

document.addEventListener("DOMContentLoaded", () => {

  // helper: hitung usia dalam "X Tahun Y Bulan"
    function hitungUsia(tanggalLahir) {
    const lahir = new Date(tanggalLahir);
    const sekarang = new Date();

    let tahun = sekarang.getFullYear() - lahir.getFullYear();
    let bulan = sekarang.getMonth() - lahir.getMonth();

    if (sekarang.getDate() < lahir.getDate()) {
      // jika hari belum lewat di bulan ini, kurang 1 bulan
        bulan--;
        }
        if (bulan < 0) {
        tahun--;
        bulan += 12;
    }

    // format fallback jika tahun = 0 atau bulan = 0
    if (tahun <= 0 && bulan <= 0) return "0 Bulan";
    if (tahun <= 0) return `${bulan} Bulan`;
    if (bulan <= 0) return `${tahun} Tahun`;
    return `${tahun} Tahun ${bulan} Bulan`;
    }

  // Ambil data anak (array)
    let children = JSON.parse(localStorage.getItem("children")) || [];

  // jika tidak ada anak → alihkan ke input
    if (children.length === 0) {
    window.location.href = "input-anak.html";
    return;
    }

  // selectedChildId dari localStorage (disimpan sebagai string)
    let selectedChildId = localStorage.getItem("selectedChildId");
    if (!selectedChildId) {
    selectedChildId = String(children[0].id);
    localStorage.setItem("selectedChildId", selectedChildId);
    }

  // Temukan active child (== dipakai supaya tipe string/number tidak masalah)
    let activeChild = children.find(c => String(c.id) === String(selectedChildId));
    if (!activeChild) {
    // safety fallback: pilih anak pertama
    activeChild = children[0];
    localStorage.setItem("selectedChildId", String(activeChild.id));
    }

  // Pastikan elemen ada sebelum mengisinya
    const namaHeaderEl = document.getElementById("namaAnakHeader");
    const umurHeaderEl = document.getElementById("umurAnakHeader");
    const namaProfileEl = document.getElementById("namaAnakProfile");

    if (namaHeaderEl) namaHeaderEl.innerText = activeChild.nama;
    if (umurHeaderEl) umurHeaderEl.innerText = hitungUsia(activeChild.tanggalLahir);
    if (namaProfileEl) namaProfileEl.innerText = activeChild.nama;

  // dropdown child menu
    const menu = document.getElementById("childMenu");
    function renderChildMenu() {
    if (!menu) return;
    menu.innerHTML = "";

    children.forEach(child => {
        const item = document.createElement("div");
        item.className = "child-item";
        item.innerText = child.nama;

        if (String(child.id) === String(selectedChildId)) {
            item.style.background = "#f0f6ff";
            item.style.fontWeight = "600";
        }

        item.addEventListener("click", () => {
            localStorage.setItem("selectedChildId", String(child.id));
            location.reload();
        });

        menu.appendChild(item);
        });

        const addBtn = document.createElement("div");
        addBtn.className = "child-add";
        addBtn.innerText = "+ Tambah Anak";
        addBtn.addEventListener("click", () => window.location.href = "input-anak.html");
        menu.appendChild(addBtn);
    }

    const profileArrow = document.getElementById("profileArrow");
    if (profileArrow) {
        profileArrow.addEventListener("click", (e) => {
        e.stopPropagation();
        renderChildMenu();
        menu.style.display = menu.style.display === "block" ? "none" : "block";
        });
    }

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".user-profile") && menu) menu.style.display = "none";
    });

    });



// --- MODAL POPUP ---
function openModal(element, posisi, namaGigi) {
    currentToothElement = element;
    const modal = document.getElementById('toothModal');
    
    document.getElementById('inputPosisi').value = namaGigi + " (" + posisi + ")";
    document.getElementById('inputTanggal').valueAsDate = new Date();
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('toothModal').style.display = 'none';
}

// --- SIMPAN DATA ---
function saveToothData(e) {
    e.preventDefault(); 

    // Ambil Values
    const posisi = document.getElementById('inputPosisi').value;
    const tanggal = document.getElementById('inputTanggal').value;
    const status = document.getElementById('inputStatus').value; 
    const catatan = document.getElementById('inputCatatan').value;

    // Update Visual di Dashboard
    currentToothElement.classList.remove('active', 'copot'); 
    if(status === 'tumbuh') currentToothElement.classList.add('active'); 
    else if (status === 'copot') currentToothElement.classList.add('copot');


    // Simpan ke Array
    const dataBaru = {
        id: Date.now(), 
        tanggal: formatDate(tanggal),
        anak: "Salma",
        gigi: posisi,
        status: status === 'tumbuh' ? 'Tumbuh' : (status === 'copot' ? 'Copot' : 'Belum'),
        usia: "1 Thn 3 Bln", 
        catatan: catatan || "-"
    };

    riwayatGigi.unshift(dataBaru);
    updateStats();
    closeModal();
    document.getElementById('toothForm').reset();
    
    updateStats();
    closeModal();
    document.getElementById('toothForm').reset();
    
    showSavedPopup();
}

function showSavedPopup() {
    const popup = document.getElementById("savedPopup");
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, 2000);
}




// --- FUNGSI HAPUS DATA ---
function deleteLog(id) {
    if(confirm("Yakin ingin menghapus catatan ini?")) {
        riwayatGigi = riwayatGigi.filter(item => item.id !== id);
        renderTable();
        updateStats(); // Update angka statistik juga
    }
}

// --- RENDER TABEL ---
function renderTable() {
    const tbody = document.getElementById('catatan-body');
    const emptyMsg = document.getElementById('empty-message');
    
    tbody.innerHTML = ""; 

    if (riwayatGigi.length === 0) {
        emptyMsg.style.display = 'block';
        return;
    } else {
        emptyMsg.style.display = 'none';
    }

    riwayatGigi.forEach(data => {
        // 1. Tentukan Warna Status
        let statusClass = 'status-belum';
        if(data.status === 'Tumbuh') statusClass = 'status-tumbuh';
        if(data.status === 'Copot') statusClass = 'status-copot';

        // 2. Tentukan Warna Analisis (LOGIKA BARU)
        let analisisClass = 'analisis-ok'; // Default Biru (Normal)
        
        if(data.analisis === 'Lebih Lambat') {
            analisisClass = 'analisis-warn'; // Oranye (Peringatan)
        }

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
        tbody.innerHTML += row;
    });
}

// --- UPDATE STATISTIK ---
function updateStats() {
    let tumbuh = 0, copot = 0;
    document.querySelectorAll('.tooth').forEach(t => {
        if(t.classList.contains('active')) tumbuh++;
        if(t.classList.contains('copot')) copot++;
    });

    document.getElementById('stat-tumbuh').innerText = tumbuh;
    document.getElementById('stat-copot').innerText = copot;
    document.getElementById('stat-belum').innerText = 20 - tumbuh - copot;
}

// Helper Format Tanggal
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

