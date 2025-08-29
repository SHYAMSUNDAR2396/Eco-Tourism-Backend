# Eco-Tourism API Documentation

## Overview

This API provides comprehensive functionality for managing eco-tourism events, user registrations, and administrative tasks.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## User Endpoints

### 1. Home Page (Dashboard) - Get All Events

**GET** `/events`

**Description**: Retrieves all active eco-events with search, filtering, and pagination.

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Events per page (default: 12)
- `search` (optional): Search term for title, description, or location
- `category` (optional): Filter by event category
- `status` (optional): Filter by event status (default: 'upcoming')
- `sortBy` (optional): Sort field (default: 'date')
- `sortOrder` (optional): Sort direction - 'asc' or 'desc' (default: 'asc')

**Response**:

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "event_id",
        "title": "Wildlife Safari Adventure",
        "date": "2024-02-15T08:00:00.000Z",
        "location": "Serengeti National Park",
        "progress": 0,
        "category": "Wildlife Safari",
        "images": [...],
        "maxParticipants": 20,
        "currentParticipants": 5,
        "price": 1500,
        "duration": 8,
        "difficulty": "Moderate",
        "status": "upcoming"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalEvents": 25,
      "eventsPerPage": 12
    },
    "filters": {
      "categories": ["Wildlife Safari", "Nature Trek", "Bird Watching"],
      "search": "",
      "category": "",
      "status": "upcoming"
    }
  }
}
```

### 2. Event Details

**GET** `/events/:eventId`

**Description**: Retrieves detailed information about a specific event.

**Response**:

```json
{
  "success": true,
  "data": {
    "event": {
      "_id": "event_id",
      "title": "Wildlife Safari Adventure",
      "description": "Experience the thrill of spotting wild animals...",
      "category": "Wildlife Safari",
      "date": "2024-02-15T08:00:00.000Z",
      "location": "Serengeti National Park",
      "coordinates": { "latitude": -2.3333, "longitude": 34.8333 },
      "images": [...],
      "maxParticipants": 20,
      "currentParticipants": 5,
      "price": 1500,
      "duration": 8,
      "difficulty": "Moderate",
      "status": "upcoming",
      "progress": 0,
      "requirements": ["Comfortable walking shoes", "Camera"],
      "highlights": ["Lion sightings", "Elephant encounters"],
      "organizer": {
        "name": "Wildlife Adventures Ltd",
        "contact": "+255-123-456-789",
        "email": "info@wildlifeadventures.com"
      }
    },
    "userRegistration": {
      "status": "confirmed",
      "paymentStatus": "paid",
      "registrationDate": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

### 3. Register for Event

**POST** `/events/:eventId/register`

**Description**: Registers the authenticated user for a specific event.

**Headers**: `Authorization: Bearer <token>`

**Body**:

```json
{
  "specialRequirements": "Vegetarian meals",
  "emergencyContact": {
    "name": "John Doe",
    "phone": "+123-456-7890",
    "relationship": "Spouse"
  },
  "paymentMethod": "credit_card"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Successfully registered for event",
  "data": {
    "registration": {
      "_id": "registration_id",
      "user": "user_id",
      "event": "event_id",
      "status": "pending",
      "paymentStatus": "pending",
      "paymentAmount": 1500
    },
    "event": {
      "id": "event_id",
      "title": "Wildlife Safari Adventure",
      "currentParticipants": 6,
      "maxParticipants": 20
    }
  }
}
```

### 4. Cancel Event Registration

**DELETE** `/events/:eventId/register`

**Description**: Cancels the user's registration for a specific event.

**Headers**: `Authorization: Bearer <token>`

**Body**:

```json
{
  "reason": "Schedule conflict"
}
```

### 5. Get User's Event Registrations

**GET** `/events/user/registrations`

**Description**: Retrieves all event registrations for the authenticated user.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

- `status` (optional): Filter by registration status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Registrations per page (default: 10)

**Response**:

```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "_id": "registration_id",
        "status": "confirmed",
        "paymentStatus": "paid",
        "registrationDate": "2024-01-20T10:30:00.000Z",
        "event": {
          "_id": "event_id",
          "title": "Wildlife Safari Adventure",
          "date": "2024-02-15T08:00:00.000Z",
          "location": "Serengeti National Park",
          "progress": 0,
          "status": "upcoming",
          "images": [...],
          "category": "Wildlife Safari"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalRegistrations": 15,
      "registrationsPerPage": 10
    }
  }
}
```

---

## Admin Endpoints

### 1. Admin Events Dashboard

**GET** `/admin/events/dashboard`

**Description**: Retrieves overview of events created by the admin.

**Headers**: `Authorization: Bearer <admin_token>`

**Response**:

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "event_id",
        "title": "Wildlife Safari Adventure",
        "status": "upcoming",
        "progress": 0,
        "currentParticipants": 5,
        "maxParticipants": 20,
        "date": "2024-02-15T08:00:00.000Z",
        "location": "Serengeti National Park",
        "category": "Wildlife Safari"
      }
    ],
    "stats": {
      "totalEvents": 15,
      "activeEvents": 12,
      "upcomingEvents": 8,
      "totalRegistrations": 45
    }
  }
}
```

### 2. Get Admin's Events

**GET** `/admin/events`

**Description**: Retrieves all events created by the admin with pagination and filters.

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**: Same as user events endpoint

### 3. Create New Event

**POST** `/admin/events`

**Description**: Creates a new eco-event.

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:

```json
{
  "title": "New Adventure Event",
  "description": "Description of the event",
  "category": "Adventure",
  "date": "2024-03-15T08:00:00.000Z",
  "location": "Event Location",
  "coordinates": { "latitude": -2.3333, "longitude": 34.8333 },
  "images": [
    { "url": "https://example.com/image1.jpg", "alt": "Image description" }
  ],
  "maxParticipants": 25,
  "price": 1200,
  "duration": 6,
  "difficulty": "Moderate",
  "requirements": ["Equipment 1", "Equipment 2"],
  "highlights": ["Highlight 1", "Highlight 2"],
  "organizer": {
    "name": "Organizer Name",
    "contact": "+123-456-7890",
    "email": "organizer@example.com"
  }
}
```

### 4. Update Event

**PUT** `/admin/events/:eventId`

**Description**: Updates an existing event.

**Headers**: `Authorization: Bearer <admin_token>`

**Body**: Any fields to update

### 5. Update Event Progress

**PATCH** `/admin/events/:eventId/progress`

**Description**: Updates the progress percentage of an event.

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:

```json
{
  "progress": 75
}
```

### 6. Update Event Status

**PATCH** `/admin/events/:eventId/status`

**Description**: Updates the status of an event.

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:

```json
{
  "status": "ongoing"
}
```

**Valid Statuses**: `upcoming`, `ongoing`, `completed`, `cancelled`

### 7. Delete Event

**DELETE** `/admin/events/:eventId`

**Description**: Deletes an event (only if no registrations exist).

**Headers**: `Authorization: Bearer <admin_token>`

### 8. Get Event Registrations

**GET** `/admin/events/:eventId/registrations`

**Description**: Retrieves all registrations for a specific event.

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:

- `status` (optional): Filter by registration status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Registrations per page (default: 20)

**Response**:

```json
{
  "success": true,
  "data": {
    "event": {
      "id": "event_id",
      "title": "Wildlife Safari Adventure",
      "currentParticipants": 5,
      "maxParticipants": 20
    },
    "registrations": [
      {
        "_id": "registration_id",
        "status": "confirmed",
        "paymentStatus": "paid",
        "registrationDate": "2024-01-20T10:30:00.000Z",
        "user": {
          "_id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+123-456-7890"
        }
      }
    ],
    "pagination": {...}
  }
}
```

### 9. Update Registration Status

**PATCH** `/admin/events/:eventId/registrations/:registrationId`

**Description**: Updates the status of a specific registration.

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:

```json
{
  "status": "confirmed",
  "notes": "Payment verified"
}
```

---

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

## Payment Statuses

- `pending` - Payment not yet processed
- `paid` - Payment completed
- `refunded` - Payment refunded
- `failed` - Payment failed

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

**Common HTTP Status Codes**:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Testing

Use the provided `test-events.js` script to test the eco-events functionality:

```bash
node test-events.js
```

## Notes

- All dates are in ISO 8601 format
- Images should be hosted URLs (consider implementing file upload in the future)
- Progress values range from 0 to 100
- Participant counts are automatically managed when registrations are created/cancelled
- Events cannot be deleted if they have existing registrations
