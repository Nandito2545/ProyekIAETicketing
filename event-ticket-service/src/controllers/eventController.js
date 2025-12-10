import pool from '../db.js';

const formatEvent = (event) => {
  if (!event) return null;
  return {
    id: event.id.toString(),
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    time: event.time,
    capacity: event.capacity,
    availableTickets: event.available_tickets, 
    price: event.price,
    category: event.category,
    imageUrl: event.image_url, 
    createdAt: event.created_at, 
    updatedAt: event.updated_at
  };
};

class EventController {
  
  async createEvent(call, callback) {
    try {
      const { 
        title, description, location, date, time, 
        capacity, price, category, imageUrl 
      } = call.request;

      const [result] = await pool.query(
        `INSERT INTO events (title, description, location, date, time, capacity, available_tickets, price, category, image_url, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          title, description, location, date, time, 
          capacity, capacity, 
          price, category, imageUrl || ''
        ]
      );
      
      const insertId = result.insertId;
      const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [insertId]);
      
      callback(null, {
        success: true,
        message: 'Event created successfully',
        event: formatEvent(rows[0]) 
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, event: null });
    }
  }

  async getEvent(call, callback) {
    try {
      const { eventId } = call.request;
      const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);

      if (rows.length === 0) {
        return callback(null, { success: false, message: 'Event not found', event: null });
      }

      callback(null, {
        success: true,
        message: 'Event retrieved successfully',
        event: formatEvent(rows[0]) 
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, event: null });
    }
  }

  async getAllEvents(call, callback) {
    try {
      const { page = 1, limit = 10, category, search } = call.request;
      
      let query = 'SELECT * FROM events';
      let params = [];
      let whereAdded = false;

      if (category) {
        query += ' WHERE category = ?';
        params.push(category);
        whereAdded = true;
      }
      if (search) {
        query += whereAdded ? ' AND' : ' WHERE';
        query += ' (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`);
        params.push(`%${search}%`);
      }

      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const [countRows] = await pool.query(countQuery, params);
      const total = countRows[0].total;

      const offset = (page - 1) * limit;
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [events] = await pool.query(query, params);

      callback(null, {
        success: true,
        message: 'Events retrieved successfully',
        events: events.map(formatEvent), 
        total,
        page,
        limit
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, events: [], total: 0, page: 1, limit: 10 });
    }
  }

  async updateEvent(call, callback) {
    try {
      const { 
        eventId, title, description, location, date, 
        time, capacity, price, category, imageUrl 
      } = call.request;

      const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
      if (rows.length === 0) {
        return callback(null, { success: false, message: 'Event not found', event: null });
      }
      const event = rows[0];

      const newTitle = title || event.title;
      const newDesc = description || event.description;
      const newLoc = location || event.location;
      const newDate = date || event.date;
      const newTime = time || event.time;
      const newPrice = price !== undefined ? price : event.price;
      const newCategory = category || event.category;
      const newImageUrl = imageUrl !== undefined ? imageUrl : event.image_url;
      
      let newCapacity = event.capacity;
      let newAvailable = event.available_tickets;

      if (capacity !== undefined) {
        const difference = capacity - event.capacity;
        newCapacity = capacity;
        newAvailable = event.available_tickets + difference;
        if (newAvailable < 0) newAvailable = 0;
        if (newAvailable > newCapacity) newAvailable = newCapacity;
      }

      await pool.query(
        `UPDATE events SET 
         title = ?, description = ?, location = ?, date = ?, time = ?, 
         capacity = ?, available_tickets = ?, price = ?, category = ?, 
         image_url = ?, updated_at = NOW() 
         WHERE id = ?`,
        [
          newTitle, newDesc, newLoc, newDate, newTime, 
          newCapacity, newAvailable, newPrice, newCategory, 
          newImageUrl, eventId
        ]
      );
      
      const [updatedRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);

      callback(null, {
        success: true,
        message: 'Event updated successfully',
        event: formatEvent(updatedRows[0]) 
      });
      
    } catch (error) {
      callback(null, { success: false, message: error.message, event: null });
    }
  }

  async deleteEvent(call, callback) {
    try {
      const { eventId } = call.request;
      const [result] = await pool.query('DELETE FROM events WHERE id = ?', [eventId]);

      if (result.affectedRows === 0) {
        return callback(null, { success: false, message: 'Event not found' });
      }

      callback(null, { success: true, message: 'Event deleted successfully' });
      
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
         return callback(null, { success: false, message: 'Cannot delete event. Tickets are still associated with it.' });
      }
      callback(null, { success: false, message: error.message });
    }
  }
}

export default new EventController();