document.getElementById("childForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const nama = document.getElementById("namaAnak").value;
    const lahir = document.getElementById("tglLahir").value;

    const dataAnak = {
        nama: nama,
        tanggalLahir: lahir
    };

    localStorage.setItem("dataAnak", JSON.stringify(dataAnak));

    window.location.href = "dashboard.html";
});
    

document.getElementById("childForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const nama = document.getElementById("namaAnak").value;
    const tanggalLahir = document.getElementById("tglLahir").value;

    let children = JSON.parse(localStorage.getItem("children")) || [];

    const newChild = {
        id: Date.now(),
        nama,
        tanggalLahir
    };

    children.push(newChild);

    localStorage.setItem("children", JSON.stringify(children));
    localStorage.setItem("selectedChildId", newChild.id);

    window.location.href = "dashboard.html";
});


document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("childForm");
    if (!form) return;

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const nama = document.getElementById("namaAnak").value.trim();
        const tanggalLahir = document.getElementById("tglLahir").value;
        if (!nama || !tanggalLahir) return alert("Isi semua data");

        let children = JSON.parse(localStorage.getItem("children")) || [];
        const newChild = { id: Date.now(), nama, tanggalLahir };
        children.push(newChild);
        localStorage.setItem("children", JSON.stringify(children));
        localStorage.setItem("selectedChildId", String(newChild.id));
        window.location.href = "dashboard.html";
    });
});
