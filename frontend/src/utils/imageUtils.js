// ✅ Konfigurasi Base URL (Pastikan port 5000)
const API_BASE_URL = 'http://localhost:5000';

export const getImageUrl = (imagePath) => {
  // Gambar fallback default jika path kosong/null/undefined
  const defaultImage = '/event1.jpg'; 
  
  if (!imagePath || imagePath === "null" || imagePath === "") {
    return defaultImage;
  }
  
  // 1. Jika imagePath adalah URL lengkap (misal dari Google login), gunakan langsung.
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 2. ✅ LOGIKA BARU: Deteksi file upload backend
  // Backend Anda menyimpan file dengan awalan "user-" atau "event-" atau "profile-"
  // Jika nama file cocok pattern ini, arahkan ke folder uploads di port 5000
  if (
    imagePath.startsWith('user-') || 
    imagePath.startsWith('event-') || 
    imagePath.startsWith('profile-') ||
    imagePath.startsWith('uploads/')
  ) {
    // Hapus prefix 'uploads/' jika tidak sengaja tersimpan ganda di DB (jaga-jaga)
    const cleanName = imagePath.replace('uploads/', '');
    return `${API_BASE_URL}/uploads/${cleanName}`;
  }

  // 3. Jika tidak memenuhi kriteria di atas, anggap file statis di folder /public frontend
  // (Contoh: "hero.jpg", "icon.png")
  return `/${imagePath}`;
};

// Fungsi helper untuk menangani error pemuatan gambar (opsional)
export const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/150'; // Atau ganti ke '/icon.png'
};