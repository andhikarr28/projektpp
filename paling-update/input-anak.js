document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("childForm");

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const nama = document.getElementById("namaAnak").value.trim();
        const tanggalLahir = document.getElementById("tglLahir").value;

        if (!nama || !tanggalLahir) {
            alert("Harap isi semua data dengan benar.");
            return;
        }

        let children = JSON.parse(localStorage.getItem("children")) || [];

        const newChild = {
            id: Date.now(), 
            nama: nama,
            tanggalLahir: tanggalLahir
        };

        children.push(newChild);
        localStorage.setItem("children", JSON.stringify(children));

        localStorage.setItem("selectedChildId", String(newChild.id));

        window.location.href = "dashboard.html";
    });
});