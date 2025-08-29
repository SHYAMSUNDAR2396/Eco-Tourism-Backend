# Eco-Tourism Backend

A comprehensive backend API for eco-tourism event management, built with Node.js, Express, and MongoDB.

## Features

### User Features

- **Authentication**: Sign up, login, and profile management
- **Home Page (Dashboard)**: Browse all eco-events with search and filtering
- **Event Details**: View comprehensive event information and register
- **Profile Management**: View and edit personal information
- **Event Registration**: Register for events and manage bookings

### Admin Features

- **Admin Dashboard**: Overview of created events and statistics
- **Event Management**: Create, edit, and delete eco-events
- **Progress Tracking**: Update event progress and status in real-time
- **Registration Management**: View and manage event registrations
- **User Management**: Manage user accounts and permissions

## API Endpoints

### Authentication (`/api/auth`)

- `POST /signup` - User registration
- `POST /login` - User login
- `POST /logout` - User logout

### User Routes (`/api/user`)

- `GET /dashboard` - User dashboard with eco-event statistics
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `PATCH /deactivate` - Deactivate account

### Events (`/api/events`)

- `GET /` - Get all active eco-events (Home Page)
- `GET /:eventId` - Get event details
- `POST /:eventId/register` - Register for an event
- `DELETE /:eventId/register` - Cancel event registration
- `GET /user/registrations` - Get user's event registrations

### Admin Routes (`/api/admin`)

- `GET /dashboard` - Admin dashboard with user statistics
- `GET /users` - Get all users with pagination and filters
- `PATCH /users/:userId/status` - Update user status
- `DELETE /users/:userId` - Delete user
- `GET /users/:userId` - Get user details

### Admin Events (`/api/admin/events`)

- `GET /dashboard` - Admin events dashboard
- `GET /` - Get all events created by admin
- `POST /` - Create new event
- `GET /:eventId` - Get event details (admin view)
- `PUT /:eventId` - Update event
- `PATCH /:eventId/progress` - Update event progress
- `PATCH /:eventId/status` - Update event status
- `DELETE /:eventId` - Delete event
- `GET /:eventId/registrations` - Get event registrations
- `PATCH /:eventId/registrations/:registrationId` - Update registration status

## Data Models

### User

- Basic user information (name, email, password)
- Role-based access control (user/admin)
- Account status management

### EcoEvent

- Event details (title, description, category, date, location)
- Participant management (max/current participants)
- Progress tracking and status updates
- Image support and organizer information
- Category-based classification

### EventRegistration

- User-event relationship tracking
- Registration status and payment information
- Special requirements and emergency contacts
- Cancellation and refund handling

## Event Categories

- Wildlife Safari
- Nature Trek
- Bird Watching
- Conservation
- Cultural Tour
- Adventure
- Photography
- Other

## Event Statuses

- `upcoming` - Event is scheduled for the future
- `ongoing` - Event is currently happening
- `completed` - Event has finished
- `cancelled` - Event was cancelled

## Registration Statuses

- `pending` - Registration submitted, awaiting confirmation
- `confirmed` - Registration confirmed
- `cancelled` - Registration cancelled
- `completed` - Event completed

## Search and Filtering

### Event Search

- Text search across title, description, and location
- Category-based filtering
- Status-based filtering
- Date-based sorting
- Pagination support

### User Management

- Search users by name or email
- Filter by role and status
- Pagination for large user lists

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Protected route middleware

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```
4. Start the server: `npm start`

## Environment Variables

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default: 5000)

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": {
    // Response data
  }
}
```

## Error Handling

The API includes comprehensive error handling:

- Validation errors for invalid input
- Authentication errors for unauthorized access
- Database errors with appropriate HTTP status codes
- Global error handler for unexpected errors

## Real-time Features

- Event progress updates
- Participant count management
- Registration status tracking
- Event status transitions

## Future Enhancements

- WebSocket support for real-time updates
- File upload for event images
- Payment gateway integration
- Email notifications
- Mobile app API endpoints
- Analytics and reporting
