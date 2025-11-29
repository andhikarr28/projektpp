function tandaiDibaca(tombol) {
    // Ubah teks tombol
    tombol.innerText = "Terbaca";
    
    // Tambahkan class CSS supaya warnanya jadi abu-abu
    tombol.classList.add('btn-disabled');
    
    // Matikan tombol supaya gak bisa diklik lagi
    tombol.disabled = true;

    // Get notif ID dari parent element
    const notifItem = tombol.closest('.notif-item');
    if (notifItem) {
        const notifId = notifItem.dataset.notifId;
        if (notifId) {
            // Simpan ke localStorage bahwa notifikasi ini sudah dibaca
            let readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];
            if (!readNotifications.includes(notifId)) {
                readNotifications.push(notifId);
                localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
            }

            // Refresh notifikasi setelah 0.3 detik agar user bisa melihat perubahan tombol
            setTimeout(() => {
                renderAllNotifications();
            }, 300);
        }
    }
}

// =========================================
// Render Notifications on Page Load
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    renderAllNotifications();
});

function renderAllNotifications() {
    // Get all notifications from both children
    const allNotifications = [
        ...generateNotifications(1),
        ...generateNotifications(2)
    ];

    // Get read notification IDs dari localStorage
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];

    // Filter out notifikasi yang sudah dibaca
    const unreadNotifications = allNotifications.filter(notif => !readNotifications.includes(notif.id));

    // Update counts
    const counts = getNotificationCounts();
    document.getElementById('alertCount').innerText = counts.alert;
    document.getElementById('warningCount').innerText = counts.warning;
    document.getElementById('infoCount').innerText = counts.info;
    document.getElementById('unreadCount').innerText = counts.unread;
    document.getElementById('historyCount').innerText = counts.history;

    // Render only unread notifications
    const notificationList = document.getElementById('notificationList');
    notificationList.innerHTML = '';

    if (unreadNotifications.length === 0) {
        notificationList.innerHTML = '<p style="text-align: center; color: #94A3B8; padding: 40px;">Tidak ada notifikasi saat ini</p>';
        return;
    }

    unreadNotifications.forEach(notif => {
        const notifItem = createNotificationElement(notif);
        notificationList.appendChild(notifItem);
    });
}

function createNotificationElement(notif) {
    const div = document.createElement('div');
    div.className = 'notif-item';
    div.dataset.notifId = notif.id;

    // Determine icon color class
    let iconColorClass = 'icon-pink';
    if (notif.color === 'warning' || notif.color === 'warning-orange') {
        iconColorClass = 'icon-yellow';
    } else if (notif.color === 'info-green') {
        iconColorClass = 'icon-green';
    }

    div.innerHTML = `
        <div class="notif-icon-box ${iconColorClass}">
            <i class="fa-solid ${notif.icon}"></i>
        </div>
        <div class="notif-body">
            <div class="notif-top">
                <h3 class="notif-title">${notif.status}: ${notif.teethName} (${notif.position})</h3>
                <span class="notif-time">${notif.time}</span>
            </div>
            <p class="notif-desc"><strong>${notif.childName}</strong> - ${notif.message}</p>
            <div class="notif-actions">
                ${notif.status === 'ALERT' ? '<button class="btn btn-primary">Booking Dokter</button>' : ''}
                <button class="btn btn-outline" onclick="tandaiDibaca(this)">Tandai sudah dibaca</button>
            </div>
        </div>
    `;

    // Make "TERLAMBAT COPOT" notifikasi clickable to open modal
    if (notif.status === 'TERLAMBAT COPOT') {
        div.style.cursor = 'pointer';
        div.addEventListener('click', function(e) {
            // Jangan trigger jika click di tombol
            if (e.target.classList.contains('btn')) return;
            openNotificationModal(notif);
        });
    }

    return div;
}

// =========================================
// Category panel / card click handling
// =========================================
function attachCategoryCardHandlers() {
    const cards = document.querySelectorAll('.notif-card[role="button"]');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.dataset.category;
            showCategoryPanel(cat);
        });
        // keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    const closeBtn = document.getElementById('categoryPanelClose');
    if (closeBtn) closeBtn.addEventListener('click', closeCategoryPanel);
}

function showCategoryPanel(category) {
    const panel = document.getElementById('categoryPanel');
    const title = document.getElementById('categoryPanelTitle');
    const list = document.getElementById('categoryPanelList');
    if (!panel || !list || !title) return;

    // Determine title
    const titles = {
        'alert': 'Perhatian (Alert)',
        'reminder': 'Pengingat',
        'info': 'Info',
        'unread': 'Belum dibaca',
        'history': 'Histori Notifikasi'
    };
    title.innerText = titles[category] || 'Detail';

    // Get all notifications and filter by category
    const all = [ ...generateNotifications(1), ...generateNotifications(2) ];
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];
    let filtered = [];

    if (category === 'alert') {
        filtered = all.filter(n => n.status === 'ALERT' && !readNotifications.includes(n.id));
    } else if (category === 'reminder') {
        filtered = all.filter(n => (n.status === 'PERIODE GOYANG' || n.status === 'TERLAMBAT COPOT') && !readNotifications.includes(n.id));
    } else if (category === 'info') {
        filtered = all.filter(n => n.status !== 'ALERT' && n.status !== 'PERIODE GOYANG' && n.status !== 'TERLAMBAT COPOT' && !readNotifications.includes(n.id));
    } else if (category === 'unread') {
        filtered = all.filter(n => n.status !== 'SELESAI' && !readNotifications.includes(n.id));
    } else if (category === 'history') {
        // Show only read notifications
        filtered = all.filter(n => readNotifications.includes(n.id));
    }

    list.innerHTML = '';
    if (filtered.length === 0) {
        list.innerHTML = '<p style="color:#94A3B8;">Tidak ada notifikasi di kategori ini.</p>';
    } else {
        filtered.forEach(n => {
            const el = createNotificationElement(n);
            list.appendChild(el);
        });
    }

    panel.setAttribute('aria-hidden', 'false');
}

function closeCategoryPanel() {
    const panel = document.getElementById('categoryPanel');
    if (!panel) return;
    panel.setAttribute('aria-hidden', 'true');
}

// Attach handlers after initial render
document.addEventListener('DOMContentLoaded', function() {
    attachCategoryCardHandlers();
    attachModalHandlers();
});

// =========================================
// Modal Notification Handlers
// =========================================
let currentModalNotification = null;

function attachModalHandlers() {
    const modalClose = document.getElementById('modalClose');
    const modalYesBtn = document.getElementById('modalYesBtn');
    const modalNoBtn = document.getElementById('modalNoBtn');

    if (modalClose) {
        modalClose.addEventListener('click', closeNotificationModal);
    }
    if (modalYesBtn) {
        modalYesBtn.addEventListener('click', handleModalYes);
    }
    if (modalNoBtn) {
        modalNoBtn.addEventListener('click', handleModalNo);
    }

    // Close modal when clicking overlay
    const overlay = document.getElementById('notificationModal');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeNotificationModal();
            }
        });
    }
}

function openNotificationModal(notif) {
    currentModalNotification = notif;
    
    const modal = document.getElementById('notificationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalQuestion = document.getElementById('modalQuestion');

    modalTitle.innerText = `${notif.teethName} - ${notif.childName}`;
    modalQuestion.innerText = 'Apakah terlihat benih gigi tetap di belakang gusi?';

    modal.setAttribute('aria-hidden', 'false');
}

function closeNotificationModal() {
    const modal = document.getElementById('notificationModal');
    modal.setAttribute('aria-hidden', 'true');
    currentModalNotification = null;
}

function handleModalYes() {
    if (!currentModalNotification) return;

    // Update notifikasi menjadi ALERT (urgent ke dokter)
    const childId = childrenData.find(c => c.name === currentModalNotification.childName)?.id;
    if (childId) {
        const child = childrenData.find(c => c.id === childId);
        if (child && child.teeth[currentModalNotification.id]) {
            child.teeth[currentModalNotification.id].gigi_tetap_muncul = true;
        }
    }

    // Close modal dan refresh notifikasi
    closeNotificationModal();
    renderAllNotifications();
}

function handleModalNo() {
    if (!currentModalNotification) return;

    // Tandai sebagai "safe to wait" - simpan status khusus
    const childId = childrenData.find(c => c.name === currentModalNotification.childName)?.id;
    if (childId) {
        const child = childrenData.find(c => c.id === childId);
        if (child && child.teeth[currentModalNotification.id]) {
            // Tambah property baru untuk tracking status user input
            child.teeth[currentModalNotification.id].user_checked = true;
            child.teeth[currentModalNotification.id].gigi_tetap_muncul = false;
            // Hitung target date 3 bulan dari sekarang
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 3);
            child.teeth[currentModalNotification.id].check_date = futureDate.toISOString();
        }
    }

    // Close modal dan refresh notifikasi
    closeNotificationModal();
    renderAllNotifications();
}
