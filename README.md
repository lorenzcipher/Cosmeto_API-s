# Next.js MongoDB API

A comprehensive REST API built with Next.js 13+ App Router and MongoDB, featuring JWT authentication, file uploads, and full CRUD operations for users, events, and files.

## Features

- **Authentication System**: JWT-based auth with refresh tokens
- **User Management**: CRUD operations with role-based access control
- **Event Management**: Complete event system with attendee management
- **File Management**: Upload, download, and manage files with access control
- **Input Validation**: Comprehensive validation using Joi
- **Database**: MongoDB with Mongoose ODM
- **Security**: Password hashing, JWT tokens, role-based permissions

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- Postman for API testing

## Installation

1. **Clone and setup the project**:
   ```bash
   # Dependencies should already be installed
   # If not, run: npm install
   ```

2. **Environment Setup**:
   Copy the `.env.local` file and update with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/nextjs-api
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Start MongoDB**:
   - Local: `mongod` or use MongoDB Compass
   - Cloud: Use MongoDB Atlas connection string

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

## Postman Testing Guide

### 1. Authentication Endpoints

#### Sign Up
- **POST** `/api/auth/signup`
- **Body** (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Expected Response**: User data with access and refresh tokens
- **Save the `accessToken` for authenticated requests**

#### Sign In  
- **POST** `/api/auth/signin`
- **Body** (JSON):
```json
{
  "email": "john@example.com", 
  "password": "password123"
}
```
- **Expected Response**: User data with tokens

#### Sign Out
- **POST** `/api/auth/signout`
- **Body**: Empty
- **Expected Response**: Success message

#### Refresh Token
- **POST** `/api/auth/refresh`
- **Body** (JSON):
```json
{
  "refreshToken": "your_refresh_token_here"
}
```

### 2. User Management

#### Get All Users (Admin Only)
- **GET** `/api/users`
- **Headers**: `Authorization: Bearer {your_access_token}`
- **Query Params**: `page=1&limit=10&search=john`

#### Get Single User
- **GET** `/api/users/{user_id}`
- **Headers**: `Authorization: Bearer {your_access_token}`

#### Update User
- **PUT** `/api/users/{user_id}`
- **Headers**: `Authorization: Bearer {your_access_token}`
- **Body** (JSON):
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Delete User (Admin Only)
- **DELETE** `/api/users/{user_id}`
- **Headers**: `Authorization: Bearer {your_access_token}`

### 3. Event Management

#### Get All Events
- **GET** `/api/events`
- **Query Params**: `page=1&limit=10&category=conference&search=tech`

#### Get Single Event
- **GET** `/api/events/{event_id}`

#### Create Event
- **POST** `/api/events`
- **Headers**: `Authorization: Bearer {your_access_token}`
- **Body** (JSON):
```json
{
  "title": "Tech Conference 2024",
  "description": "A comprehensive technology conference",
  "date": "2024-06-15T10:00:00.000Z",
  "location": "San Francisco, CA",
  "category": "conference",
  "maxAttendees": 100,
  "isPublic": true
}
```

#### Update Event
- **PUT** `/api/events/{event_id}`
- **Headers**: `Authorization: Bearer {your_access_token}`
- **Body** (JSON):
```json
{
  "title": "Updated Event Title",
  "maxAttendees": 150
}
```

#### Delete Event
- **DELETE** `/api/events/{event_id}`
- **Headers**: `Authorization: Bearer {your_access_token}`

#### Join Event
- **POST** `/api/events/{event_id}/attend`
- **Headers**: `Authorization: Bearer {your_access_token}`

#### Leave Event
- **DELETE** `/api/events/{event_id}/attend`
- **Headers**: `Authorization: Bearer {your_access_token}`

### 4. File Management

#### Get All Files
- **GET** `/api/files`
- **Headers**: `Authorization: Bearer {your_access_token}`
- **Query Params**: `page=1&limit=10&public=true`

#### Upload File
- **POST** `/api/files`
- **Headers**: `Authorization: Bearer {your_access_token}`
- **Body** (form-data):
  - `file`: Select a file (max 10MB)
  - `isPublic`: true/false
  - `tags`: comma,separated,tags

#### Get Single File
- **GET** `/api/files/{file_id}`
- **Headers**: `Authorization: Bearer {your_access_token}`

#### Update File
- **PUT** `/api/files/{file_id}`
- **Headers**: `Authorization: Bearer {your_access_token}`
- **Body** (JSON):
```json
{
  "isPublic": false,
  "tags": ["document", "important"]
}
```

#### Delete File
- **DELETE** `/api/files/{file_id}`
- **Headers**: `Authorization: Bearer {your_access_token}`

## Testing Workflow in Postman

### Step 1: Create a User Account
1. Send POST request to `/api/auth/signup`
2. Copy the `accessToken` from response
3. Create an environment variable in Postman called `accessToken`

### Step 2: Set Up Authorization
1. In Postman, go to the Authorization tab
2. Select "Bearer Token" type
3. Use `{{accessToken}}` as the token value

### Step 3: Test User Operations
1. Try GET `/api/users/{your_user_id}` to get your profile
2. Try PUT to update your profile
3. Create another user account to test admin features

### Step 4: Test Event Operations
1. Create several events with different categories
2. Test pagination with `page` and `limit` parameters  
3. Test joining/leaving events
4. Try updating and deleting events you created

### Step 5: Test File Operations
1. Upload different file types (images, documents, etc.)
2. Test public vs private file access
3. Try accessing files from different user accounts
4. Test file deletion

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Error Codes

- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `500`: Internal Server Error - Server error

## Database Models

### User
- `email`: Unique email address
- `password`: Hashed password
- `name`: User's full name
- `role`: 'user' or 'admin'
- `avatar`: Profile picture URL

### Event  
- `title`: Event title
- `description`: Event description
- `date`: Event date/time
- `location`: Event location
- `organizer`: User who created event
- `attendees`: Array of user IDs
- `maxAttendees`: Maximum number of attendees
- `isPublic`: Whether event is publicly visible
- `category`: Event category

### File
- `filename`: Generated unique filename
- `originalName`: Original filename
- `mimetype`: File MIME type
- `size`: File size in bytes  
- `path`: File path for access
- `uploadedBy`: User who uploaded file
- `isPublic`: Whether file is publicly accessible
- `tags`: Array of tags for organization

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Access tokens (15min) + Refresh tokens (7 days)
- **Role-Based Access**: Admin vs User permissions
- **Input Validation**: Joi schema validation
- **File Security**: Size limits, access control
- **MongoDB Injection Protection**: Mongoose sanitization

## Tips for Testing

1. **Save Environment Variables**: Create Postman environments for different stages
2. **Test Error Scenarios**: Try invalid data, missing tokens, unauthorized access
3. **File Upload**: Use various file types and sizes to test limits
4. **Pagination**: Test with different page sizes and search terms
5. **Concurrent Users**: Test with multiple user accounts for realistic scenarios

This API is production-ready and includes all necessary security measures, validation, and error handling for a robust web application backend.