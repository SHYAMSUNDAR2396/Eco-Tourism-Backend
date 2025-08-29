# Eco-Tourism Backend

A comprehensive backend system for eco-tourism management with role-based authentication and user management.

## Features

- **User Authentication**: Signup, login, and role-based access control
- **Role Management**: Admin and User roles with different permissions
- **Admin Dashboard**: User management, statistics, and system overview
- **User Dashboard**: Personal profile management and basic statistics
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Integration**: Scalable database with Mongoose ODM
- **Password Security**: Bcrypt hashing for secure password storage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Eco-Tourism-Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/eco-tourism
   JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
   ```

4. **Start the server**

   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### User Signup

- **POST** `/api/auth/signup`
- **Body**: `{ "name", "email", "password", "phone", "address" }`
- **Response**: User data + JWT token

#### User Login

- **POST** `/api/auth/login`
- **Body**: `{ "email", "password" }`
- **Response**: User data + JWT token + redirect path

#### Admin Signup (Protected)

- **POST** `/api/auth/admin/signup`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "name", "email", "password", "phone", "address" }`
- **Response**: Admin user data

#### Get Profile

- **GET** `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Current user profile

#### Update Profile

- **PUT** `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "name", "phone", "address" }`
- **Response**: Updated user profile

#### Change Password

- **PUT** `/api/auth/change-password`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "currentPassword", "newPassword" }`
- **Response**: Success message

### Admin Routes (`/api/admin`)

#### Admin Dashboard

- **GET** `/api/admin/dashboard`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: System statistics and recent users

#### Get All Users

- **GET** `/api/admin/users?page=1&limit=10&search=&role=&status=`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Paginated user list with filters

#### Update User Status

- **PATCH** `/api/admin/users/:userId/status`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "isActive": boolean }`
- **Response**: Updated user data

#### Delete User

- **DELETE** `/api/admin/users/:userId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

#### Get User Details

- **GET** `/api/admin/users/:userId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User details

### User Routes (`/api/user`)

#### User Dashboard

- **GET** `/api/user/dashboard`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile and basic stats

#### Get Profile

- **GET** `/api/user/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile

#### Update Profile

- **PUT** `/api/user/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "name", "phone", "address" }`
- **Response**: Updated user profile

#### Change Password

- **PUT** `/api/user/change-password`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "currentPassword", "newPassword" }`
- **Response**: Success message

#### Deactivate Account

- **PATCH** `/api/user/deactivate`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

## Role-Based Access Control

### Admin Role

- Access to admin dashboard
- User management (view, activate/deactivate, delete)
- System statistics
- Create new admin accounts

### User Role

- Access to user dashboard
- Profile management
- Basic statistics
- Account deactivation

## Authentication Flow

1. **Signup/Login**: User provides credentials
2. **Token Generation**: JWT token is generated and returned
3. **Role Check**: System determines user role (admin/user)
4. **Redirect**: Frontend redirects based on role:
   - Admin → `/admin/dashboard`
   - User → `/user/dashboard`

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure authentication with expiration
- **Role Validation**: Middleware-based access control
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error responses

## Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: 'user', 'admin'),
  phone: String,
  address: String,
  isActive: Boolean,
  timestamps: true
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## Development

### Running Tests

```bash
npm test
```

### Code Structure

```
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Authentication and validation
├── db/             # Database connection
├── server.js       # Main application file
└── package.json    # Dependencies and scripts
```

## Production Considerations

1. **Environment Variables**: Use strong JWT secrets
2. **Database**: Use MongoDB Atlas or production MongoDB instance
3. **CORS**: Configure allowed origins
4. **Rate Limiting**: Implement API rate limiting
5. **Logging**: Add comprehensive logging
6. **Monitoring**: Implement health checks and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
