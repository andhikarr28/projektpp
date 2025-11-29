// ========================================= 
// TEETH TRACKING SYSTEM - Reference Data
// =========================================

const referenceData = {
  "atas": [
    { "id": "A1", "nama": "Gigi Seri Tengah", "min": 6, "max": 7 },
    { "id": "A2", "nama": "Gigi Seri Samping", "min": 7, "max": 8 },
    { "id": "A3", "nama": "Gigi Taring", "min": 10, "max": 12 },
    { "id": "A4", "nama": "Gigi Geraham Pertama", "min": 9, "max": 11 },
    { "id": "A5", "nama": "Gigi Geraham Kedua", "min": 10, "max": 12 }
  ],
  "bawah": [
    { "id": "B1", "nama": "Gigi Seri Tengah", "min": 6, "max": 7 },
    { "id": "B2", "nama": "Gigi Seri Samping", "min": 7, "max": 8 },
    { "id": "B3", "nama": "Gigi Taring", "min": 9, "max": 12 },
    { "id": "B4", "nama": "Gigi Geraham Pertama", "min": 9, "max": 11 },
    { "id": "B5", "nama": "Gigi Geraham Kedua", "min": 10, "max": 12 }
  ]
};

// =========================================
// Dummy Child Data
// =========================================
const childrenData = [
  {
    id: 1,
    name: "Aisyah",
    birthDate: new Date(2017, 4, 15), // 7 tahun 6 bulan
    teeth: {
      "A1": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "A2": { "sudah_copot": false, "gigi_tetap_muncul": true }, // ALERT: Gigi tetap sudah muncul
      "A3": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "A4": { "sudah_copot": true, "gigi_tetap_muncul": false },
      "A5": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "B1": { "sudah_copot": true, "gigi_tetap_muncul": false },
      "B2": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "B3": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "B4": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "B5": { "sudah_copot": false, "gigi_tetap_muncul": false }
    }
  },
  {
    id: 2,
    name: "Salma",
    birthDate: new Date(2018, 2, 10), // 6 tahun 8 bulan
    teeth: {
      "A1": { "sudah_copot": true, "gigi_tetap_muncul": true },
      "A2": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "A3": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "A4": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "A5": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "B1": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "B2": { "sudah_copot": true, "gigi_tetap_muncul": false },
      "B3": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "B4": { "sudah_copot": false, "gigi_tetap_muncul": false },
      "B5": { "sudah_copot": false, "gigi_tetap_muncul": false }
    }
  }
];

// =========================================
// Calculate Age Function
// =========================================
function hitungUmur(birthDate) {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 + (12 + month) / 12;
  }
  return age + month / 12;
}

// =========================================
// Check Teeth Status Function
// =========================================
function cekStatusGigi(umurAnak, dataGigi, statusUser) {
  // KASUS 1: Gigi sudah copot
  if (statusUser.sudah_copot === true) {
    return {
      status: "SELESAI",
      color: "success",
      icon: "fa-check-circle",
      message: "Gigi sudah copot dengan baik."
    };
  }

  // KASUS 2: Gigi belum copot TAPI gigi tetap sudah nongol (CRITICAL)
  if (statusUser.sudah_copot === false && statusUser.gigi_tetap_muncul === true) {
    return {
      status: "ALERT",
      color: "danger",
      icon: "fa-triangle-exclamation",
      message: "Gigi tetap sudah muncul! Segera ke dokter untuk pencabutan agar gigi rapi."
    };
  }

  // KASUS 3: Belum copot, cek berdasarkan Umur
  if (umurAnak < dataGigi.min) {
    return {
      status: "BELUM WAKTUNYA",
      color: "secondary",
      icon: "fa-hourglass-end",
      message: `Jaga kebersihan gigi. Target waktu copot: ${dataGigi.min}-${dataGigi.max} tahun.`
    };
  } else if (umurAnak >= dataGigi.min && umurAnak <= (dataGigi.max + 1)) {
    return {
      status: "PERIODE GOYANG",
      color: "warning",
      icon: "fa-clock",
      message: "Cek apakah gigi sudah goyang? Dorong anak untuk sering menggoyangkannya."
    };
  } else if (umurAnak > (dataGigi.max + 1)) {
    return {
      status: "TERLAMBAT COPOT",
      color: "warning-orange",
      icon: "fa-exclamation",
      message: "Gigi melewati batas usia umum copot. Cek apakah ada benih gigi tetap di belakangnya."
    };
  }
}

// =========================================
// Generate Notifications Function
// =========================================
function generateNotifications(childId = 1) {
  const child = childrenData.find(c => c.id === childId);
  if (!child) return [];

  const umurAnak = hitungUmur(child.birthDate);
  const notifications = [];

  // Loop through all teeth (atas dan bawah)
  Object.keys(child.teeth).forEach(teethId => {
    const teethStatus = child.teeth[teethId];
    
    // Find reference data
    let refData;
    if (teethId.startsWith('A')) {
      refData = referenceData.atas.find(t => t.id === teethId);
    } else {
      refData = referenceData.bawah.find(t => t.id === teethId);
    }

    if (!refData) return;

    const statusResult = cekStatusGigi(umurAnak, refData, teethStatus);

    // Only add critical and warning notifications
    if (statusResult.status !== "SELESAI" && statusResult.status !== "BELUM WAKTUNYA") {
      notifications.push({
        id: teethId,
        childName: child.name,
        teethName: refData.nama,
        position: teethId.startsWith('A') ? 'Atas' : 'Bawah',
        status: statusResult.status,
        color: statusResult.color,
        icon: statusResult.icon,
        message: statusResult.message,
        time: getRandomTime()
      });
    }
  });

  return notifications;
}

// =========================================
// Helper Functions
// =========================================
function getRandomTime() {
  const times = [
    "2 jam yang lalu",
    "4 jam yang lalu",
    "1 hari yang lalu",
    "2 hari yang lalu",
    "Baru saja"
  ];
  return times[Math.floor(Math.random() * times.length)];
}

function getNotificationCounts() {
  const allNotifications = [
    ...generateNotifications(1),
    ...generateNotifications(2)
  ];

  const counts = {
    alert: 0,
    warning: 0,
    info: 0,
    unread: 0
  };

  allNotifications.forEach(notif => {
    if (notif.status === "ALERT") counts.alert++;
    else if (notif.status === "TERLAMBAT COPOT" || notif.status === "PERIODE GOYANG") counts.warning++;
    else counts.info++;
  });

  counts.unread = counts.alert + counts.warning;

  return counts;
}
