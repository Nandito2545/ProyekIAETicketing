// ✅ PERBAIKAN: Dapatkan base URL dari environment
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') // Hapus /api
  : 'http://localhost:5000';

export const getImageUrl = (imagePath) => {
  const defaultImage = '/event1.jpg'; // Gambar fallback default
  
  if (!imagePath) {
    return defaultImage;
  }
  
  // 1. Jika imagePath adalah URL lengkap (dimulai dgn http), gunakan langsung.
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 2. Jika imagePath adalah hasil upload backend (dimulai dgn 'uploads/'),
  //    tambahkan base URL dari API gateway kita.
  if (imagePath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${imagePath}`;
  }

  // 3. Jika hanya nama file (dari /public), tambahkan '/'.
  return `/${imagePath}`;
};

// Fungsi helper untuk menangani error pemuatan gambar
export const handleImageError = (e) => {
  e.target.src = '/event1.jpg'; // Set ke gambar fallback jika gagal dimuat
};