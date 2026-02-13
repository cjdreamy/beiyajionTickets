# EventFlow - Event Ticketing System

A complete event ticketing platform where organizers can create and manage events, and users can browse and purchase tickets.

## Features

### For Users
- Register and login
- Browse all available events
- View detailed event information
- Purchase tickets with quantity selection
- View booking history with ticket numbers
- Cancel bookings

### For Organizers
- Register and login as organizer
- Create and manage events
- View dashboard with statistics (revenue, tickets sold, etc.)
- Edit and delete events
- Track ticket sales

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and go to:
```
http://localhost:3000
```

## How to Use

### User Registration & Login
1. Click "Login as User" on the home page
2. Click "Register here" link to create a new account
3. Enter your email, password, and full name
4. Click "Register"
5. Login with your credentials

### Organizer Registration & Login
1. Click "Login as Organizer" on the home page
2. Click "Register here" link to create a new organizer account
3. Enter your email, password, and company name
4. Click "Register"
5. Login with your credentials

### Create an Event (Organizer)
1. After logging in as organizer, go to "Organizer Dashboard"
2. Fill in the event details:
   - Event Title
   - Date and Time
   - Location
   - Ticket Price
   - Total Capacity
   - Description
   - Image URL (optional)
3. Click "Create Event"

### Browse & Buy Tickets (User)
1. After logging in as user, click "Browse Events"
2. Click "View & Book" on any event
3. Select the number of tickets you want
4. Click "Book Tickets"
5. Your booking is confirmed! Save your ticket numbers

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a user
- `POST /api/auth/login` - Login user/organizer
- `POST /api/organizer/register` - Register organizer

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event (organizer)
- `PUT /api/events/:id` - Update event (organizer)
- `DELETE /api/events/:id` - Delete event (organizer)
- `GET /api/organizer/:organizerId/events` - Get organizer's events

### Bookings
- `POST /api/bookings` - Book tickets
- `GET /api/user/:userId/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `DELETE /api/bookings/:id` - Cancel booking

### Statistics
- `GET /api/organizer/:organizerId/stats` - Get organizer statistics

## Tech Stack
- **Backend**: Node.js + Express.js
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Database**: In-memory (can be replaced with MongoDB/PostgreSQL)

## Troubleshooting

### "Can't register"
- Make sure the server is running (`npm start`)
- Check that you're filling in all required fields
- Try registering with a different email address
- Check browser console for error messages (F12)
- Make sure cookies are enabled

### Port already in use
If port 3000 is already in use:
```bash
# Kill the process using port 3000 and restart
Get-Process -Name node | Stop-Process -Force
npm start
```

### Server won't start
- Make sure dependencies are installed: `npm install`
- Check Node.js is installed: `node -v`
- Delete `node_modules` and reinstall: `npm install`

## Features to Add

- Email verification
- Password reset functionality
- Payment gateway integration (Stripe/PayPal)
- Database persistence (MongoDB/PostgreSQL)
- Email notifications
- QR code ticket validation
- Admin dashboard
- Review and ratings system

## License
ISC
