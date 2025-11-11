import pool from '../db.js';
import generateTicketCode from '../utils/generateTicketCode.js';

// ✅ PERBAIKAN: Helper format untuk memetakan DB ke gRPC
const formatTicket = (ticket) => {
  if (!ticket) return null;
  
  // 1. Buat objek event (nested)
  const event = {
    id: ticket.event_id.toString(),
    title: ticket.event_title,
    description: ticket.event_description,
    location: ticket.event_location,
    date: ticket.event_date,
    time: ticket.event_time,
    capacity: ticket.event_capacity,
    availableTickets: ticket.event_available_tickets, // Mapping
    price: ticket.event_price,
    category: ticket.event_category,
    imageUrl: ticket.event_image_url, // Mapping
    createdAt: ticket.event_createdAt,
    updatedAt: ticket.event_updatedAt,
  };
  
  // 2. Buat objek tiket (flat)
  return {
    id: ticket.id.toString(),
    ticketCode: ticket.ticket_code, // Mapping
    eventId: ticket.event_id.toString(),
    userId: ticket.user_id.toString(),
    quantity: ticket.quantity,
    totalPrice: ticket.total_price, // Mapping
    status: ticket.status,
    purchaseDate: ticket.purchase_date, // Mapping
    event: event // Masukkan objek event yang sudah di-nest
  };
};

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
    const connection = await pool.getConnection();
    try {
      const { eventId, userId, quantity, totalPrice } = call.request;

      await connection.beginTransaction(); 

      const [rows] = await connection.query('SELECT * FROM events WHERE id = ? FOR UPDATE', [eventId]);
      if (rows.length === 0) {
        await connection.rollback();
        return callback(null, { success: false, message: 'Event not found', ticket: null });
      }
      const event = rows[0];

      if (event.available_tickets < quantity) {
        await connection.rollback();
        return callback(null, { success: false, message: `Only ${event.available_tickets} tickets available`, ticket: null });
      }

      const ticketCode = generateTicketCode();

      const [result] = await connection.query(
        `INSERT INTO tickets (ticket_code, event_id, user_id, quantity, total_price, status, purchase_date, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW(), NOW())`,
        [ticketCode, eventId, userId, quantity, totalPrice]
      );
      const insertId = result.insertId;

      await connection.query(
        'UPDATE events SET available_tickets = available_tickets - ? WHERE id = ?',
        [quantity, eventId]
      );
      
      await connection.commit();

      const [ticketRows] = await pool.query(`${TICKET_EVENT_JOIN_QUERY} WHERE t.id = ?`, [insertId]);

      callback(null, {
        success: true,
        message: 'Ticket created successfully',
        ticket: formatTicket(ticketRows[0]) // ✅ Gunakan helper format
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
      const [rows] = await pool.query(`${TICKET_EVENT_JOIN_QUERY} WHERE t.id = ?`, [ticketId]);

      if (rows.length === 0) {
        return callback(null, { success: false, message: 'Ticket not found', ticket: null });
      }

      callback(null, {
        success: true,
        message: 'Ticket retrieved successfully',
        ticket: formatTicket(rows[0]) // ✅ Gunakan helper format
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, ticket: null });
    }
  }

  async getTicketsByUser(call, callback) {
    try {
      const { userId } = call.request;
      const [tickets] = await pool.query(
        `${TICKET_EVENT_JOIN_QUERY} WHERE t.user_id = ? ORDER BY t.purchase_date DESC`, 
        [userId]
      );

      callback(null, {
        success: true,
        message: 'Tickets retrieved successfully',
        tickets: tickets.map(formatTicket) // ✅ Gunakan helper format
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, tickets: [] });
    }
  }

  async getTicketsByEvent(call, callback) {
    try {
      const { eventId } = call.request;
      const [tickets] = await pool.query(
        `${TICKET_EVENT_JOIN_QUERY} WHERE t.event_id = ? ORDER BY t.purchase_date DESC`, 
        [eventId]
      );

      callback(null, {
        success: true,
        message: 'Tickets retrieved successfully',
        tickets: tickets.map(formatTicket) // ✅ Gunakan helper format
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, tickets: [] });
    }
  }

  async updateTicketStatus(call, callback) {
    const connection = await pool.getConnection();
    try {
      const { ticketId, status } = call.request;

      await connection.beginTransaction(); 

      const [rows] = await connection.query('SELECT * FROM tickets WHERE id = ? FOR UPDATE', [ticketId]);
      if (rows.length === 0) {
        await connection.rollback();
        return callback(null, { success: false, message: 'Ticket not found', ticket: null });
      }
      const ticket = rows[0];

      if (status === 'cancelled' && ticket.status !== 'cancelled') {
        await connection.query(
          'UPDATE events SET available_tickets = available_tickets + ? WHERE id = ?',
          [ticket.quantity, ticket.event_id]
        );
      }

      await connection.query(
        'UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, ticketId]
      );
      
      await connection.commit();

      const [updatedRows] = await pool.query(`${TICKET_EVENT_JOIN_QUERY} WHERE t.id = ?`, [ticketId]);

      callback(null, {
        success: true,
        message: 'Ticket status updated successfully',
        ticket: formatTicket(updatedRows[0]) // ✅ Gunakan helper format
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
      const [rows] = await pool.query(`${TICKET_EVENT_JOIN_QUERY} WHERE t.ticket_code = ?`, [ticketCode]);

      if (rows.length === 0) {
        return callback(null, { success: false, message: 'Ticket not found', isValid: false, ticket: null });
      }
      
      const ticket = rows[0];
      const isValid = ticket.status === 'paid' || ticket.status === 'used';

      if (isValid && ticket.status === 'paid') {
        await pool.query('UPDATE tickets SET status = \'used\' WHERE id = ?', [ticket.id]);
        ticket.status = 'used';
      }

      callback(null, {
        success: true,
        message: isValid ? 'Ticket is valid' : 'Ticket is not valid',
        isValid,
        ticket: formatTicket(ticket) // ✅ Gunakan helper format
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, isValid: false, ticket: null });
    }
  }
}

export default new TicketController();