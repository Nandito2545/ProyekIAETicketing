// FILE: src/controllers/ticketController.js
// Business Logic untuk Ticket Management

const Ticket = require('../models/ticketModel');
const Event = require('../models/eventModel');
const generateTicketCode = require('../utils/generateTicketCode');

class TicketController {

  /**
   * CREATE TICKET (Purchase)
   * User membeli ticket untuk event
   */
  async createTicket(call, callback) {
    try {
      const { eventId, userId, quantity, totalPrice } = call.request;

      // 1. Cek apakah event ada
      const event = await Event.findById(eventId);
      
      if (!event) {
        return callback(null, {
          success: false,
          message: 'Event not found',
          ticket: null
        });
      }

      // 2. Cek ketersediaan ticket
      if (event.availableTickets < quantity) {
        return callback(null, {
          success: false,
          message: `Only ${event.availableTickets} tickets available`,
          ticket: null
        });
      }

      // 3. Generate kode ticket unik
      const ticketCode = generateTicketCode();

      // 4. Buat ticket baru
      const ticket = new Ticket({
        ticketCode,
        eventId,
        userId,
        quantity,
        totalPrice,
        status: 'pending' // Status awal pending
      });

      // 5. Simpan ticket
      await ticket.save();

      // 6. Update available tickets di event
      event.availableTickets -= quantity;
      await event.save();

      // 7. Populate event data
      await ticket.populate('eventId');

      // 8. Return success response
      callback(null, {
        success: true,
        message: 'Ticket created successfully',
        ticket: this._formatTicketResponse(ticket)
      });
      
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
        ticket: null
      });
    }
  }

  /**
   * GET TICKET BY ID
   * Ambil detail ticket
   */
  async getTicket(call, callback) {
    try {
      const { ticketId } = call.request;

      const ticket = await Ticket.findById(ticketId).populate('eventId');

      if (!ticket) {
        return callback(null, {
          success: false,
          message: 'Ticket not found',
          ticket: null
        });
      }

      callback(null, {
        success: true,
        message: 'Ticket retrieved successfully',
        ticket: this._formatTicketResponse(ticket)
      });
      
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
        ticket: null
      });
    }
  }

  /**
   * GET TICKETS BY USER
   * List semua ticket milik user
   */
  async getTicketsByUser(call, callback) {
    try {
      const { userId } = call.request;

      const tickets = await Ticket.find({ userId })
        .populate('eventId')
        .sort({ purchaseDate: -1 }); // Sort terbaru dulu

      const ticketsList = tickets.map(ticket => 
        this._formatTicketResponse(ticket)
      );

      callback(null, {
        success: true,
        message: 'Tickets retrieved successfully',
        tickets: ticketsList
      });
      
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
        tickets: []
      });
    }
  }

  /**
   * GET TICKETS BY EVENT
   * List semua ticket untuk suatu event
   */
  async getTicketsByEvent(call, callback) {
    try {
      const { eventId } = call.request;

      const tickets = await Ticket.find({ eventId })
        .populate('eventId')
        .sort({ purchaseDate: -1 });

      const ticketsList = tickets.map(ticket => 
        this._formatTicketResponse(ticket)
      );

      callback(null, {
        success: true,
        message: 'Tickets retrieved successfully',
        tickets: ticketsList
      });
      
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
        tickets: []
      });
    }
  }

  /**
   * UPDATE TICKET STATUS
   * Update status ticket (pending -> paid -> used)
   */
  async updateTicketStatus(call, callback) {
    try {
      const { ticketId, status } = call.request;

      const ticket = await Ticket.findById(ticketId).populate('eventId');

      if (!ticket) {
        return callback(null, {
          success: false,
          message: 'Ticket not found',
          ticket: null
        });
      }

      // Jika cancel, kembalikan available tickets
      if (status === 'cancelled' && ticket.status !== 'cancelled') {
        const event = await Event.findById(ticket.eventId);
        if (event) {
          event.availableTickets += ticket.quantity;
          await event.save();
        }
      }

      // Update status
      ticket.status = status;
      await ticket.save();

      callback(null, {
        success: true,
        message: 'Ticket status updated successfully',
        ticket: this._formatTicketResponse(ticket)
      });
      
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
        ticket: null
      });
    }
  }

  /**
   * VALIDATE TICKET
   * Validasi ticket saat masuk event
   */
  async validateTicket(call, callback) {
    try {
      const { ticketCode } = call.request;

      // Cari ticket by code
      const ticket = await Ticket.findOne({ ticketCode })
        .populate('eventId');

      if (!ticket) {
        return callback(null, {
          success: false,
          message: 'Ticket not found',
          isValid: false,
          ticket: null
        });
      }

      // Cek apakah valid (paid atau used)
      const isValid = ticket.status === 'paid' || ticket.status === 'used';

      // Jika valid dan belum digunakan, mark as used
      if (isValid && ticket.status === 'paid') {
        ticket.status = 'used';
        await ticket.save();
      }

      callback(null, {
        success: true,
        message: isValid ? 'Ticket is valid' : 'Ticket is not valid',
        isValid,
        ticket: this._formatTicketResponse(ticket)
      });
      
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
        isValid: false,
        ticket: null
      });
    }
  }

  /**
   * HELPER: Format ticket response
   * Merapikan response data
   */
  _formatTicketResponse(ticket) {
    return {
      id: ticket._id.toString(),
      ticketCode: ticket.ticketCode,
      eventId: ticket.eventId._id.toString(),
      userId: ticket.userId,
      quantity: ticket.quantity,
      totalPrice: ticket.totalPrice,
      status: ticket.status,
      purchaseDate: ticket.purchaseDate.toISOString(),
      event: {
        id: ticket.eventId._id.toString(),
        title: ticket.eventId.title,
        description: ticket.eventId.description,
        location: ticket.eventId.location,
        date: ticket.eventId.date,
        time: ticket.eventId.time,
        capacity: ticket.eventId.capacity,
        availableTickets: ticket.eventId.availableTickets,
        price: ticket.eventId.price,
        category: ticket.eventId.category,
        imageUrl: ticket.eventId.imageUrl,
        createdAt: ticket.eventId.createdAt.toISOString(),
        updatedAt: ticket.eventId.updatedAt.toISOString()
      }
    };
  }
}

module.exports = new TicketController();