function tandaiDibaca(tombol) {
    // Ubah teks tombol
    tombol.innerText = "Terbaca";
    
    // Tambahkan class CSS supaya warnanya jadi abu-abu
    tombol.classList.add('btn-disabled');
    
    // Matikan tombol supaya gak bisa diklik lagi
    tombol.disabled = true;
}