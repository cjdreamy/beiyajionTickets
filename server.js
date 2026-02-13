const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// In-memory database (replace with actual DB for production)
const db = {
  users: [], // { id, email, password, name, role, createdAt }
  organizers: [], // { id, email, password, companyName, createdAt }
  events: [], // { id, organizerId, title, description, date, time, location, capacity, ticketsAvailable, price, image, status }
  bookings: [] // { id, userId, eventId, quantity, totalPrice, bookingDate, ticketNumbers }
};

// Utility Functions
const findUser = (email) => db.users.find(u => u.email === email);
const findOrganizer = (email) => db.organizers.find(o => o.email === email);
const findEvent = (id) => db.events.find(e => e.id === id);
const findBooking = (id) => db.bookings.find(b => b.id === id);

// ==================== USER ROUTES ====================

// User Registration
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  if (findUser(email)) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = {
    id: uuidv4(),
    email,
    password, // In production, hash this!
    name,
    role: 'user',
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  res.status(201).json({ success: true, message: 'Registration successful', userId: user.id });
});

// User Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  let user;
  if (role === 'user') {
    user = db.users.find(u => u.email === email && u.password === password);
  } else if (role === 'organizer') {
    user = db.organizers.find(o => o.email === email && o.password === password);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  res.json({ 
    success: true, 
    message: 'Login successful',
    userId: user.id,
    role: role
  });
});

// ==================== ORGANIZER ROUTES ====================

// Organizer Registration
app.post('/api/organizer/register', (req, res) => {
  const { email, password, companyName } = req.body;

  if (!email || !password || !companyName) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  if (findOrganizer(email)) {
    return res.status(400).json({ success: false, message: 'Organizer already exists' });
  }

  const organizer = {
    id: uuidv4(),
    email,
    password, // In production, hash this!
    companyName,
    createdAt: new Date().toISOString()
  };

  db.organizers.push(organizer);
  res.status(201).json({ success: true, message: 'Registration successful', organizerId: organizer.id });
});

// ==================== EVENT ROUTES ====================

// Get All Events
app.get('/api/events', (req, res) => {
  const events = db.events.map(event => ({
    ...event,
    ticketsAvailable: event.capacity - (db.bookings
      .filter(b => b.eventId === event.id)
      .reduce((sum, b) => sum + b.quantity, 0))
  }));
  res.json({ success: true, events });
});

// Get Event by ID
app.get('/api/events/:id', (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  
  const bookedTickets = db.bookings
    .filter(b => b.eventId === event.id)
    .reduce((sum, b) => sum + b.quantity, 0);
  
  res.json({ 
    success: true, 
    event: {
      ...event,
      ticketsAvailable: event.capacity - bookedTickets
    }
  });
});

// Create Event (Organizer)
app.post('/api/events', (req, res) => {
  const { organizerId, title, description, date, time, location, capacity, price, image } = req.body;

  if (!organizerId || !title || !description || !date || !time || !location || !capacity || !price) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  const organizer = db.organizers.find(o => o.id === organizerId);
  if (!organizer) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const event = {
    id: uuidv4(),
    organizerId,
    title,
    description,
    date,
    time,
    location,
    capacity: parseInt(capacity),
    price: parseFloat(price),
    image: image || 'https://via.placeholder.com/400x300?text=Event',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.events.push(event);
  res.status(201).json({ success: true, message: 'Event created successfully', event });
});

// Update Event (Organizer)
app.put('/api/events/:id', (req, res) => {
  const { organizerId, title, description, date, time, location, capacity, price, image, status } = req.body;
  const event = findEvent(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (event.organizerId !== organizerId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  Object.assign(event, {
    title: title || event.title,
    description: description || event.description,
    date: date || event.date,
    time: time || event.time,
    location: location || event.location,
    capacity: capacity ? parseInt(capacity) : event.capacity,
    price: price ? parseFloat(price) : event.price,
    image: image || event.image,
    status: status || event.status
  });

  res.json({ success: true, message: 'Event updated successfully', event });
});

// Delete Event (Organizer)
app.delete('/api/events/:id', (req, res) => {
  const { organizerId } = req.body;
  const event = findEvent(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (event.organizerId !== organizerId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const index = db.events.indexOf(event);
  db.events.splice(index, 1);
  res.json({ success: true, message: 'Event deleted successfully' });
});

// Get Organizer Events
app.get('/api/organizer/:organizerId/events', (req, res) => {
  const events = db.events.filter(e => e.organizerId === req.params.organizerId);
  res.json({ success: true, events });
});

// ==================== BOOKING ROUTES ====================

// Book Tickets
app.post('/api/bookings', (req, res) => {
  const { userId, eventId, quantity } = req.body;

  if (!userId || !eventId || !quantity) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  const event = findEvent(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const bookedTickets = db.bookings
    .filter(b => b.eventId === eventId)
    .reduce((sum, b) => sum + b.quantity, 0);

  if (bookedTickets + quantity > event.capacity) {
    return res.status(400).json({ success: false, message: 'Not enough tickets available' });
  }

  const ticketNumbers = Array.from({ length: quantity }, (_, i) => 
    `${event.id.slice(0, 8)}-${bookedTickets + i + 1}`.toUpperCase()
  );

  const booking = {
    id: uuidv4(),
    userId,
    eventId,
    quantity: parseInt(quantity),
    totalPrice: parseFloat(quantity) * event.price,
    bookingDate: new Date().toISOString(),
    ticketNumbers,
    status: 'confirmed'
  };

  db.bookings.push(booking);
  res.status(201).json({ 
    success: true, 
    message: 'Booking successful',
    booking
  });
});

// Get User Bookings
app.get('/api/user/:userId/bookings', (req, res) => {
  const bookings = db.bookings.filter(b => b.userId === req.params.userId);
  const bookingsWithDetails = bookings.map(booking => {
    const event = findEvent(booking.eventId);
    return { ...booking, eventDetails: event };
  });
  res.json({ success: true, bookings: bookingsWithDetails });
});

// Get Booking by ID
app.get('/api/bookings/:id', (req, res) => {
  const booking = findBooking(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  
  const event = findEvent(booking.eventId);
  res.json({ success: true, booking: { ...booking, eventDetails: event } });
});

// Cancel Booking
app.delete('/api/bookings/:id', (req, res) => {
  const { userId } = req.body;
  const booking = findBooking(req.params.id);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.userId !== userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const index = db.bookings.indexOf(booking);
  db.bookings.splice(index, 1);
  res.json({ success: true, message: 'Booking cancelled successfully' });
});

// ==================== STATS ROUTES ====================

// Get Organizer Dashboard Stats
app.get('/api/organizer/:organizerId/stats', (req, res) => {
  const events = db.events.filter(e => e.organizerId === req.params.organizerId);
  const eventIds = events.map(e => e.id);
  const bookings = db.bookings.filter(b => eventIds.includes(b.eventId));
  
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalTicketsSold = bookings.reduce((sum, b) => sum + b.quantity, 0);

  res.json({ 
    success: true, 
    stats: {
      totalEvents: events.length,
      totalTicketsSold,
      totalRevenue,
      activeEvents: events.filter(e => e.status === 'active').length
    }
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
