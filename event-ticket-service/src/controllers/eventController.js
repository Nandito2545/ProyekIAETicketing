// FILE: src/controllers/eventController.js
// Business Logic untuk Event Management

const Event = require('../models/eventModel');

class EventController {
  
  /**
   * CREATE EVENT
   * Membuat event baru
   */
  async createEvent(call, callback) {
    try {
      // 1. Ambil data dari request
      const { 
        title, 
        description, 
        location, 
        date, 
        time, 
        capacity, 
        price, 
        category, 
        imageUrl 
      } = call.request;

      // 2. Buat instance Event baru
      const event = new Event({
        title,
        description,
        location,
        date,
        time,
        capacity,
        availableTickets: capacity, // Default = capacity
        price,
        category,
        imageUrl: imageUrl || ''
      });

      // 3. Simpan ke database
      await event.save();

      // 4. Return success response
      callback(null, {
        success: true,
        message: 'Event created successfully',
        event: {
          id: event._id.toString(),
          title: event.title,
          description: event.description,
          location: event.location,
          date: event.date,
          time: event.time,
          capacity: event.capacity,
          availableTickets: event.availableTickets,
          price: event.price,
          category: event.category,
          imageUrl: event.imageUrl,
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString()
        }
      });
      
    } catch (error) {
      // Handle error
      callback(null, {
        success: false,
        message: error.message,
        event: null
      });
    }
  }

  /**
   * GET EVENT BY ID
   * Mengambil detail event berdasarkan ID
   */
  async getEvent(call, callback) {
    try {
      const { eventId } = call.request;

      // Cari event by ID
      const event = await Event.findById(eventId);

      // Jika tidak ditemukan
      if (!event) {
        return callback(null, {
          success: false,
          message: 'Event not found',
          event: null
        });
      }

      // Return event data
      callback(null, {
        success: true,
        message: 'Event retrieved successfully',
        event: {
          id: event._id.toString(),
          title: event.title,
          description: event.description,
          location: event.location,
          date: event.date,
          time: event.time,
          capacity: event.capacity,
          availableTickets: event.availableTickets,
          price: event.price,
          category: event.category,
          imageUrl: event.imageUrl,
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString()
        }
      });
      
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
        event: null
      });
    }
  }

  /**
   * GET ALL EVENTS
   * List semua events dengan pagination dan filter
   */
  async getAllEvents(call, callback) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        search 
      } = call.request;

      // Build query
      let query = {};

      // Filter by category
      if (category) {
        query.category = category;
      }

      // Search by text
      if (search) {
        query.$text = { $search: search };
      }

      // Pagination
      const skip = (page - 1) * limit;

      // Execute query
      const events = await Event.find(query)
        .sort({ createdAt: -1 }) // Sort terbaru dulu
        .skip(skip)
        .limit(limit);

      // Count total
      const total = await Event.countDocuments(query);

      // Transform data
      const eventsList = events.map(event => ({
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        location: event.location,
        date: event.date,
        time: event.time,
        capacity: event.capacity,
        availableTickets: event.availableTickets,
        price: event.price,
        category: event.category,
        imageUrl: event.imageUrl,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString()
      }));

      // Return response
      callback(null, {
        success: true,
        message: 'Events retrieved successfully',
        events: eventsList,
        total,
        page,
        limit
      });
      
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
        events: [],
        total: 0,
        page: 1,
        limit: 10
      });
    }
  }

  /**
   * UPDATE EVENT
   * Update data event
   */
  async updateEvent(call, callback) {
    try {
      const { 
        eventId, 
        title, 
        description, 
        location, 
        date, 
        time, 
        capacity, 
        price, 
        category, 
        imageUrl 
      } = call.request;

      // Cari event
      const event = await Event.findById(eventId);

      if (!event) {
        return callback(null, {
          success: false,
          message: 'Event not found',
          event: null
        });
      }

      // Update fields (hanya yang dikirim)
      if (title) event.title = title;
      if (description) event.description = description;
      if (location) event.location = location;
      if (date) event.date = date;
      if (time) event.time = time;
      
      // Update capacity dan availableTickets
      if (capacity) {
        const difference = capacity - event.capacity;
        event.capacity = capacity;
        event.availableTickets += difference;
      }
      
      if (price !== undefined) event.price = price;
      if (category) event.category = category;
      if (imageUrl) event.imageUrl = imageUrl;

      // Save changes
      await event.save();

      // Return updated event
      callback(null, {
        success: true,
        message: 'Event updated successfully',
        event: {
          id: event._id.toString(),
          title: event.title,
          description: event.description,
          location: event.location,
          date: event.date,
          time: event.time,
          capacity: event.capacity,
          availableTickets: event.availableTickets,
          price: event.price,
          category: event.category,
          imageUrl: event.imageUrl,
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString()
        }
      });
      
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message,
        event: null
      });
    }
  }

  /**
   * DELETE EVENT
   * Hapus event
   */
  async deleteEvent(call, callback) {
    try {
      const { eventId } = call.request;

      // Hapus event
      const event = await Event.findByIdAndDelete(eventId);

      if (!event) {
        return callback(null, {
          success: false,
          message: 'Event not found'
        });
      }

      callback(null, {
        success: true,
        message: 'Event deleted successfully'
      });
      
    } catch (error) {
      callback(null, {
        success: false,
        message: error.message
      });
    }
  }
}

// Export instance
module.exports = new EventController();