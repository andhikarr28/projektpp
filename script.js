document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('notificationContainer');
    const showBtn = document.getElementById('showNotificationBtn');

    // 1. Fungsi untuk menutup notifikasi
    // Menggunakan event delegation pada container
    container.addEventListener('click', function(e) {
        // Cek apakah yang diklik adalah tombol tutup
        if (e.target.classList.contains('close-btn')) {
            // Hilangkan notifikasi (parent dari tombol tutup)
            e.target.parentElement.remove();
        }
    });

    // 2. Fungsi untuk menampilkan notifikasi baru secara dinamis
    showBtn.addEventListener('click', function() {
        // Data notifikasi baru (misalnya, tipe dan pesan)
        const type = ['success', 'error', 'info'][Math.floor(Math.random() * 3)]; // Random
        const message = `Ini adalah notifikasi tipe ${type.toUpperCase()} baru! Waktu: ${new Date().toLocaleTimeString()}`;

        // Buat elemen notifikasi baru
        const newNotification = document.createElement('div');
        newNotification.classList.add('notification', type);

        // Isi konten notifikasi
        newNotification.innerHTML = `
            <span class="close-btn">&times;</span>
            <p><strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong> ${message}</p>
        `;

        // Tambahkan ke bagian atas container
        container.prepend(newNotification);

        // Opsional: Hilangkan notifikasi secara otomatis setelah 5 detik
        setTimeout(() => {
            newNotification.remove();
        }, 5000); // 5000 milidetik = 5 detik
    });
});