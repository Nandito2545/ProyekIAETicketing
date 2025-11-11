import crypto from 'crypto'; // ✅ PERBAIKAN: Ganti 'require' menjadi 'import'

/**
 * Generate unique ticket code
 * Format: TKT-YYYYMMDD-RANDOM8
 */
const generateTicketCode = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  
  return `TKT-${year}${month}${day}-${randomPart}`;
};

export default generateTicketCode; // ✅ PERBAIKAN: Ganti 'module.exports' menjadi 'export default'