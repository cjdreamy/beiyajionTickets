// API Configuration
const API_BASE = 'http://localhost:3000/api';

// Global State
let currentUser = null;
let currentRole = null;
let loginRole = 'user';
let registerRole = 'user';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('role');
    
    if (savedUser && savedRole) {
        currentUser = JSON.parse(savedUser);
        currentRole = savedRole;
        updateNavBar();
        if (currentRole === 'organizer') {
            showOrganizerDashboard();
        } else {
            showUserDashboard();
        }
    }
});

// ==================== AUTH FUNCTIONS ====================

function toggleLoginRole(role) {
    loginRole = role;
    document.querySelectorAll('#loginPage .role-btn').forEach((btn, idx) => {
        btn.classList.remove('active');
        if ((idx === 0 && role === 'user') || (idx === 1 && role === 'organizer')) {
            btn.classList.add('active');
        }
    });
}

function toggleRegisterRole(role) {
    registerRole = role;
    document.querySelectorAll('#registerPage .role-btn').forEach((btn, idx) => {
        btn.classList.remove('active');
        if ((idx === 0 && role === 'user') || (idx === 1 && role === 'organizer')) {
            btn.classList.add('active');
        }
    });
    
    // Toggle form fields
    document.getElementById('nameField').style.display = role === 'user' ? 'block' : 'none';
    document.getElementById('companyField').style.display = role === 'organizer' ? 'block' : 'none';
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: loginRole })
        });

        const data = await response.json();

        if (!data.success) {
            showAlert('loginAlert', data.message, 'error');
            return;
        }

        currentUser = {
            id: data.userId,
            email: email,
            role: loginRole
        };
        currentRole = loginRole;

        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('role', currentRole);

        showAlert('loginAlert', 'Login successful!', 'success');
        updateNavBar();
        document.getElementById('loginForm').reset();

        setTimeout(() => {
            if (currentRole === 'organizer') {
                showOrganizerDashboard();
            } else {
                showUserDashboard();
            }
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);
        showAlert('loginAlert', 'An error occurred. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        let body;
        if (registerRole === 'user') {
            const name = document.getElementById('registerName').value;
            body = { email, password, name };
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();

            if (!data.success) {
                showAlert('registerAlert', data.message, 'error');
                return;
            }
        } else {
            const companyName = document.getElementById('registerCompany').value;
            body = { email, password, companyName };
            const response = await fetch(`${API_BASE}/organizer/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();

            if (!data.success) {
                showAlert('registerAlert', data.message, 'error');
                return;
            }
        }

        showAlert('registerAlert', 'Registration successful! Please login.', 'success');
        document.getElementById('registerForm').reset();

        setTimeout(() => {
            showPage('loginPage');
        }, 1500);
    } catch (error) {
        console.error('Register error:', error);
        showAlert('registerAlert', 'An error occurred. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    updateNavBar();
    showPage('homePage');
}

// ==================== NAVIGATION FUNCTIONS ====================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showUserDashboard() {
    if (!currentUser || currentRole !== 'user') {
        showPage('homePage');
        return;
    }
    document.querySelectorAll('.dashboard').forEach(d => d.classList.remove('active'));
    document.getElementById('userDashboard').classList.add('active');
    document.getElementById('userEmail').textContent = currentUser.email;
    loadUserBookings();
}

function showOrganizerDashboard() {
    if (!currentUser || currentRole !== 'organizer') {
        showPage('homePage');
        return;
    }
    document.querySelectorAll('.dashboard').forEach(d => d.classList.remove('active'));
    document.getElementById('organizerDashboard').classList.add('active');
    document.getElementById('organizerEmail').textContent = currentUser.email;
    loadOrganizerStats();
    loadOrganizerEvents();
}

function updateNavBar() {
    const userDisplay = document.getElementById('userDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginNavBtn = document.getElementById('loginNavBtn');

    if (currentUser) {
        userDisplay.textContent = `${currentUser.email}`;
        logoutBtn.style.display = 'block';
        loginNavBtn.style.display = 'none';
        logoutBtn.addEventListener('click', logout);
    } else {
        userDisplay.textContent = '';
        logoutBtn.style.display = 'none';
        loginNavBtn.style.display = 'block';
        loginNavBtn.addEventListener('click', () => showPage('loginPage'));
    }
}

// ==================== EVENT FUNCTIONS ====================

async function loadAllEvents() {
    try {
        const response = await fetch(`${API_BASE}/events`);
        const data = await response.json();

        if (!data.success) return;

        const container = document.getElementById('eventsContainer');
        container.innerHTML = '';

        data.events.forEach(event => {
            const card = createEventCard(event, 'user');
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

async function loadOrganizerEvents() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/organizer/${currentUser.id}/events`);
        const data = await response.json();

        if (!data.success) return;

        const container = document.getElementById('organizerEventsContainer');
        container.innerHTML = '';

        if (data.events.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">No events created yet. Create your first event above!</p>';
            return;
        }

        data.events.forEach(event => {
            const card = createEventCard(event, 'organizer');
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading organizer events:', error);
    }
}

function createEventCard(event, userType) {
    const availableTickets = event.ticketsAvailable || 0;
    const isSoldOut = availableTickets <= 0;

    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
        <img src="${event.image}" alt="${event.title}" class="event-image">
        <div class="event-content">
            <div class="event-title">${event.title}</div>
            <div class="event-meta">📅 ${event.date} at ${event.time}</div>
            <div class="event-meta">📍 ${event.location}</div>
            <div class="event-price">$${event.price.toFixed(2)}</div>
            <div class="event-availability ${isSoldOut ? 'sold-out' : ''}">
                ${isSoldOut ? 'SOLD OUT' : `${availableTickets} tickets available`}
            </div>
            <p class="event-description">${event.description.substring(0, 100)}...</p>
            <div class="action-buttons">
                ${userType === 'user' ? `
                    <button class="btn btn-small" onclick="viewEventDetails('${event.id}')" ${isSoldOut ? 'disabled' : ''}>
                        ${isSoldOut ? 'Sold Out' : 'View & Book'}
                    </button>
                ` : `
                    <button class="btn btn-small" onclick="editEvent('${event.id}')">Edit</button>
                    <button class="btn btn-small btn-secondary" onclick="deleteEvent('${event.id}')">Delete</button>
                `}
            </div>
        </div>
    `;
    return card;
}

async function viewEventDetails(eventId) {
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`);
        const data = await response.json();

        if (!data.success) return;

        const event = data.event;
        document.getElementById('modalEventTitle').textContent = event.title;
        document.getElementById('modalEventDetails').innerHTML = `
            <div class="booking-details">
                <p><strong>Date:</strong> ${event.date} at ${event.time}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Price per ticket:</strong> $${event.price.toFixed(2)}</p>
                <p><strong>Available tickets:</strong> ${event.ticketsAvailable}</p>
                <p><strong>Description:</strong></p>
                <p>${event.description}</p>
            </div>
        `;

        const bookingForm = document.getElementById('bookingForm');
        if (event.ticketsAvailable > 0) {
            bookingForm.innerHTML = `
                <div class="form-group">
                    <label>Number of Tickets</label>
                    <input type="number" id="ticketQuantity" min="1" max="${event.ticketsAvailable}" value="1">
                </div>
                <div class="form-group">
                    <div style="background: #f0f0f0; padding: 1rem; border-radius: 5px;">
                        <strong>Total Price:</strong> <span id="totalPrice">$${event.price.toFixed(2)}</span>
                    </div>
                </div>
                <button class="btn" onclick="bookTickets('${eventId}')">Book Tickets</button>
            `;

            document.getElementById('ticketQuantity').addEventListener('input', () => {
                const qty = parseInt(document.getElementById('ticketQuantity').value);
                const total = (qty * event.price).toFixed(2);
                document.getElementById('totalPrice').textContent = `$${total}`;
            });
        } else {
            bookingForm.innerHTML = '<p style="color: #721c24; background: #f8d7da; padding: 1rem; border-radius: 5px;">This event is sold out!</p>';
        }

        document.getElementById('eventModal').classList.add('active');
    } catch (error) {
        console.error('Error loading event details:', error);
    }
}

async function bookTickets(eventId) {
    if (!currentUser) {
        alert('Please login to book tickets');
        return;
    }

    const quantity = parseInt(document.getElementById('ticketQuantity').value);

    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                eventId: eventId,
                quantity: quantity
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        // Show booking details
        const booking = data.booking;
        document.getElementById('bookingDetailsContent').innerHTML = `
            <div class="booking-details">
                <h3 style="color: #667eea; margin-bottom: 1rem;">Booking Confirmed! 🎉</h3>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Tickets:</strong> ${booking.quantity}</p>
                <p><strong>Total Amount:</strong> $${booking.totalPrice.toFixed(2)}</p>
                <p><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toLocaleString()}</p>
                
                <div style="margin-top: 1.5rem;">
                    <h4 style="color: #667eea; margin-bottom: 1rem;">Your Ticket Numbers:</h4>
                    ${booking.ticketNumbers.map(tn => `<div class="ticket-number">${tn}</div>`).join('')}
                </div>
                
                <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
                    Please save your ticket numbers. You'll need them to enter the event.
                </p>
            </div>
        `;

        closeModal('eventModal');
        document.getElementById('bookingModal').classList.add('active');

        setTimeout(() => {
            loadUserBookings();
            loadAllEvents();
        }, 2000);
    } catch (error) {
        console.error('Booking error:', error);
        alert('An error occurred while booking. Please try again.');
    }
}

async function loadUserBookings() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/user/${currentUser.id}/bookings`);
        const data = await response.json();

        if (!data.success) return;

        const container = document.getElementById('userBookingsContainer');
        container.innerHTML = '';

        if (data.bookings.length === 0) {
            container.innerHTML = '<div style="background: #fff; padding: 2rem; border-radius: 10px; text-align: center;"><p style="color: #666;">No bookings yet. <a href="#" onclick="browseEventsClick()" style="color: #667eea; font-weight: 600;">Browse events</a></p></div>';
            return;
        }

        data.bookings.forEach(booking => {
            const event = booking.eventDetails;
            const card = document.createElement('div');
            card.style.cssText = 'background: #fff; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap;">
                    <div>
                        <h3 style="color: #667eea; margin-bottom: 0.5rem;">${event.title}</h3>
                        <p style="color: #666;">📅 ${event.date} at ${event.time}</p>
                        <p style="color: #666;">📍 ${event.location}</p>
                        <p style="color: #667eea; font-weight: 600;">Tickets: ${booking.quantity} | Total: $${booking.totalPrice.toFixed(2)}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: #f0f0f0; padding: 1rem; border-radius: 5px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #666;">Booking ID</p>
                            <p style="font-family: monospace; font-weight: bold; word-break: break-all;">${booking.id.slice(0, 12)}...</p>
                        </div>
                        <button class="btn btn-small" onclick="viewBookingDetails('${booking.id}')">View Details</button>
                    </div>
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
                    <p style="font-size: 0.85rem; color: #666;">Ticket Numbers:</p>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                        ${booking.ticketNumbers.map(tn => `<span style="background: #667eea; color: #fff; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem; font-family: monospace; font-weight: bold;">${tn}</span>`).join('')}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// ==================== ORGANIZER FUNCTIONS ====================

async function loadOrganizerStats() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/organizer/${currentUser.id}/stats`);
        const data = await response.json();

        if (!data.success) return;

        const stats = data.stats;
        const container = document.getElementById('statsContainer');
        container.innerHTML = `
            <div class="stat-card">
                <h3>Total Events</h3>
                <div class="value">${stats.totalEvents}</div>
            </div>
            <div class="stat-card">
                <h3>Tickets Sold</h3>
                <div class="value">${stats.totalTicketsSold}</div>
            </div>
            <div class="stat-card">
                <h3>Total Revenue</h3>
                <div class="value">$${stats.totalRevenue.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>Active Events</h3>
                <div class="value">${stats.activeEvents}</div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function handleCreateEvent(e) {
    e.preventDefault();

    if (!currentUser) return;

    const event = {
        organizerId: currentUser.id,
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        capacity: document.getElementById('eventCapacity').value,
        price: document.getElementById('eventPrice').value,
        image: document.getElementById('eventImage').value || undefined
    };

    try {
        const response = await fetch(`${API_BASE}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });

        const data = await response.json();

        if (!data.success) {
            showAlert('eventAlert', data.message, 'error');
            return;
        }

        showAlert('eventAlert', 'Event created successfully!', 'success');
        document.getElementById('eventForm').reset();
        loadOrganizerEvents();
        loadOrganizerStats();
    } catch (error) {
        console.error('Error creating event:', error);
        showAlert('eventAlert', 'An error occurred. Please try again.', 'error');
    }
}

async function editEvent(eventId) {
    // Placeholder for edit functionality
    alert('Edit functionality coming soon!');
}

async function deleteEvent(eventId) {
    if (!currentUser) return;

    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organizerId: currentUser.id })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        alert('Event deleted successfully!');
        loadOrganizerEvents();
        loadOrganizerStats();
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('An error occurred while deleting. Please try again.');
    }
}

// ==================== UTILITY FUNCTIONS ====================

function showAlert(elementId, message, type) {
    const alert = document.getElementById(elementId);
    alert.textContent = message;
    alert.className = `alert ${type} show`;
    setTimeout(() => {
        alert.classList.remove('show');
    }, 4000);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

async function viewBookingDetails(bookingId) {
    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}`);
        const data = await response.json();

        if (!data.success) return;

        const booking = data.booking;
        const event = booking.eventDetails;

        document.getElementById('bookingDetailsContent').innerHTML = `
            <div class="booking-details">
                <h3 style="color: #667eea; margin-bottom: 1rem;">${event.title}</h3>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Date:</strong> ${event.date} at ${event.time}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Tickets:</strong> ${booking.quantity}</p>
                <p><strong>Total Amount:</strong> $${booking.totalPrice.toFixed(2)}</p>
                <p><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toLocaleString()}</p>
                
                <div style="margin-top: 1.5rem;">
                    <h4 style="color: #667eea; margin-bottom: 1rem;">Your Ticket Numbers:</h4>
                    ${booking.ticketNumbers.map(tn => `<div class="ticket-number">${tn}</div>`).join('')}
                </div>
            </div>
        `;

        document.getElementById('bookingModal').classList.add('active');
    } catch (error) {
        console.error('Error loading booking details:', error);
    }
}

function browseEventsClick() {
    loadAllEvents();
    showPage('browseEvents');
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('userLoginBtn').addEventListener('click', () => {
        loginRole = 'user';
        toggleLoginRole('user');
        showPage('loginPage');
    });

    document.getElementById('organizerLoginBtn').addEventListener('click', () => {
        loginRole = 'organizer';
        toggleLoginRole('organizer');
        showPage('loginPage');
    });

    // Browse events button
    document.querySelectorAll('[onclick*="browseEventsClick"]').forEach(btn => {
        btn.addEventListener('click', browseEventsClick);
    });
});
