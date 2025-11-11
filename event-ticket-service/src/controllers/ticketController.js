import pool from '../db.js'; // ✅ Impor pool MySQL
import generateTicketCode from '../utils/generateTicketCode.js';

// Helper untuk format (MySQL tidak butuh populate, kita pakai JOIN)
const formatTicket = (ticket) => {
  if (!ticket) return null;
  
  // Pisahkan data event dari ticket
  const event = {
    id: ticket.event_id.toString(),
    title: ticket.event_title,
    description: ticket.event_description,
    location: ticket.event_location,
    date: ticket.event_date,
    time: ticket.event_time,
    capacity: ticket.event_capacity,
    availableTickets: ticket.event_available_tickets,
    price: ticket.event_price,
    category: ticket.event_category,
    imageUrl: ticket.event_image_url,
    createdAt: ticket.event_createdAt,
    updatedAt: ticket.event_updatedAt,
  };
  
  // Hapus properti event duplikat dari tiket
  delete ticket.event_title;
  delete ticket.event_description;
  // ... (hapus semua field event_* dari objek ticket)
  // (Ini bisa dilewati jika SELECT * di-manage dengan baik)

  return { ...ticket, id: ticket.id.toString(), event: event };
};

// Query JOIN yang akan kita gunakan berulang kali
const TICKET_EVENT_JOIN_QUERY = `
  SELECT 
    t.*, 
    e.title as event_title,
    e.description as event_description,
    e.location as event_location,
    e.date as event_date,
    e.time as event_time,
    e.capacity as event_capacity,
    e.available_tickets as event_available_tickets,
    e.price as event_price,
    e.category as event_category,
    e.image_url as event_image_url,
    e.created_at as event_createdAt,
    e.updated_at as event_updatedAt
  FROM tickets t
  JOIN events e ON t.event_id = e.id
`;


class TicketController {

  async createTicket(call, callback) {
    const connection = await pool.getConnection(); // Butuh transaksi
    try {
      const { eventId, userId, quantity, totalPrice } = call.request;

      await connection.beginTransaction(); // ✅ Mulai Transaksi

      // 1. Cek event & Kunci row (FOR UPDATE)
      const [rows] = await connection.query('SELECT * FROM events WHERE id = ? FOR UPDATE', [eventId]);
      if (rows.length === 0) {
        await connection.rollback();
        return callback(null, { success: false, message: 'Event not found', ticket: null });
      }
      const event = rows[0];

      // 2. Cek ketersediaan
      if (event.available_tickets < quantity) {
        await connection.rollback();
        return callback(null, { success: false, message: `Only ${event.available_tickets} tickets available`, ticket: null });
      }

      // 3. Generate kode
      const ticketCode = generateTicketCode();

      // 4. Buat ticket baru
      const [result] = await connection.query(
        `INSERT INTO tickets (ticket_code, event_id, user_id, quantity, total_price, status, purchase_date, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW(), NOW())`,
        [ticketCode, eventId, userId, quantity, totalPrice]
      );
      const insertId = result.insertId;

      // 5. Update available tickets
      await connection.query(
        'UPDATE events SET available_tickets = available_tickets - ? WHERE id = ?',
        [quantity, eventId]
      );
      
      await connection.commit(); // ✅ Selesaikan Transaksi

      // 7. Ambil data lengkap untuk dikirim balik
      const [ticketRows] = await pool.query(`${TICKET_EVENT_JOIN_QUERY} WHERE t.id = ?`, [insertId]);

      callback(null, {
        success: true,
        message: 'Ticket created successfully',
        ticket: formatTicket(ticketRows[0])
      });
      
    } catch (error) {
      await connection.rollback();
      callback(null, { success: false, message: error.message, ticket: null });
    } finally {
      connection.release();
    }
  }

  async getTicket(call, callback) {
    try {
      const { ticketId } = call.request;
      // ✅ Logika SQL
      const [rows] = await pool.query(`${TICKET_EVENT_JOIN_QUERY} WHERE t.id = ?`, [ticketId]);

      if (rows.length === 0) {
        return callback(null, { success: false, message: 'Ticket not found', ticket: null });
      }

      callback(null, {
        success: true,
        message: 'Ticket retrieved successfully',
        ticket: formatTicket(rows[0])
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, ticket: null });
    }
  }

  async getTicketsByUser(call, callback) {
    try {
      const { userId } = call.request;
      // ✅ Logika SQL
      const [tickets] = await pool.query(
        `${TICKET_EVENT_JOIN_QUERY} WHERE t.user_id = ? ORDER BY t.purchase_date DESC`, 
        [userId]
      );

      callback(null, {
        success: true,
        message: 'Tickets retrieved successfully',
        tickets: tickets.map(formatTicket)
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, tickets: [] });
    }
  }

  async getTicketsByEvent(call, callback) {
    try {
      const { eventId } = call.request;
      // ✅ Logika SQL
      const [tickets] = await pool.query(
        `${TICKET_EVENT_JOIN_QUERY} WHERE t.event_id = ? ORDER BY t.purchase_date DESC`, 
        [eventId]
      );

      callback(null, {
        success: true,
        message: 'Tickets retrieved successfully',
        tickets: tickets.map(formatTicket)
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, tickets: [] });
    }
  }

  async updateTicketStatus(call, callback) {
    const connection = await pool.getConnection();
    try {
      const { ticketId, status } = call.request;

      await connection.beginTransaction(); // ✅ Mulai Transaksi

      // ✅ Cek tiket
      const [rows] = await connection.query('SELECT * FROM tickets WHERE id = ? FOR UPDATE', [ticketId]);
      if (rows.length === 0) {
        await connection.rollback();
        return callback(null, { success: false, message: 'Ticket not found', ticket: null });
      }
      const ticket = rows[0];

      // Jika cancel, kembalikan stok
      if (status === 'cancelled' && ticket.status !== 'cancelled') {
        await connection.query(
          'UPDATE events SET available_tickets = available_tickets + ? WHERE id = ?',
          [ticket.quantity, ticket.event_id]
        );
      }

      // Update status
      await connection.query(
        'UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, ticketId]
      );
      
      await connection.commit(); // ✅ Selesaikan Transaksi

      // Ambil data lengkap
      const [updatedRows] = await pool.query(`${TICKET_EVENT_JOIN_QUERY} WHERE t.id = ?`, [ticketId]);

      callback(null, {
        success: true,
        message: 'Ticket status updated successfully',
        ticket: formatTicket(updatedRows[0])
      });
      
    } catch (error) {
      await connection.rollback();
      callback(null, { success: false, message: error.message, ticket: null });
    } finally {
      connection.release();
    }
  }

  async validateTicket(call, callback) {
    try {
      const { ticketCode } = call.request;
      // ✅ Logika SQL
      const [rows] = await pool.query(`${TICKET_EVENT_JOIN_QUERY} WHERE t.ticket_code = ?`, [ticketCode]);

      if (rows.length === 0) {
        return callback(null, { success: false, message: 'Ticket not found', isValid: false, ticket: null });
      }
      
      const ticket = rows[0];
      const isValid = ticket.status === 'paid' || ticket.status === 'used';

      if (isValid && ticket.status === 'paid') {
        await pool.query('UPDATE tickets SET status = \'used\' WHERE id = ?', [ticket.id]);
        ticket.status = 'used'; // Update objek lokal
      }

      callback(null, {
        success: true,
        message: isValid ? 'Ticket is valid' : 'Ticket is not valid',
        isValid,
        ticket: formatTicket(ticket)
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, isValid: false, ticket: null });
    }
  }
}

export default new TicketController();