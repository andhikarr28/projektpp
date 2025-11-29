function tandaiDibaca(tombol) {
    // Ubah teks tombol
    tombol.innerText = "Terbaca";
    
    // Tambahkan class CSS supaya warnanya jadi abu-abu
    tombol.classList.add('btn-disabled');
    
    // Matikan tombol supaya gak bisa diklik lagi
    tombol.disabled = true;
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

    // Update counts
    const counts = getNotificationCounts();
    document.getElementById('alertCount').innerText = counts.alert;
    document.getElementById('warningCount').innerText = counts.warning;
    document.getElementById('infoCount').innerText = counts.info;
    document.getElementById('unreadCount').innerText = counts.unread;

    // Render notifications
    const notificationList = document.getElementById('notificationList');
    notificationList.innerHTML = '';

    if (allNotifications.length === 0) {
        notificationList.innerHTML = '<p style="text-align: center; color: #94A3B8; padding: 40px;">Tidak ada notifikasi saat ini</p>';
        return;
    }

    allNotifications.forEach(notif => {
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

    return div;
}
