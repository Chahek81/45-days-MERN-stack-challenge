# TaskFlow - Full-Stack Installation Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   node setup.js
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   Open your browser and go to: `http://localhost:3000`

### Default Login Credentials
- **Email**: john@taskflow.com
- **Password**: password123

## 🔧 Development Mode

For development with auto-restart:
```bash
npm run dev
```

## 📊 Database

The application uses SQLite for simplicity. The database file will be created automatically at `./database/taskflow.db`.

### Sample Data
The application comes with pre-loaded sample data including:
- 5 sample users
- 3 sample teams
- 5 sample tasks
- Activity logs

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add member to team
- `DELETE /api/teams/:id/members/:userId` - Remove member from team

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/tasks/trends` - Get task completion trends
- `GET /api/analytics/teams/performance` - Get team performance
- `GET /api/analytics/users/productivity` - Get user productivity

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🌐 WebSocket Events

Real-time updates are handled via Socket.IO:

### Client Events
- `join-teams` - Join team rooms for real-time updates
- `task-updated` - Notify when a task is updated
- `team-updated` - Notify when a team is updated

### Server Events
- `task-changed` - Task was modified
- `team-changed` - Team was modified

## 📁 Project Structure

```
taskflow/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
├── database/              # Database files
│   └── taskflow.db        # SQLite database (created automatically)
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── tasks.js          # Task management routes
│   ├── teams.js          # Team management routes
│   ├── users.js          # User management routes
│   └── analytics.js      # Analytics routes
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
├── setup.js              # Setup script
└── README.md             # Project documentation
```

## 🚀 Production Deployment

### Environment Variables
Create a `.env` file with production values:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret
DB_PATH=./database/taskflow.db
```

### Database
For production, consider using PostgreSQL or MySQL instead of SQLite:

1. Install the appropriate database driver
2. Update the database connection in `database/database.js`
3. Update the environment variables

### Security
- Change the JWT secret to a secure random string
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Use environment variables for sensitive data

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the PORT in `.env` file
   - Or kill the process using the port

2. **Database connection issues**
   - Ensure the database directory exists
   - Check file permissions

3. **Authentication issues**
   - Clear browser localStorage
   - Check JWT secret configuration

4. **WebSocket connection issues**
   - Ensure Socket.IO is properly installed
   - Check CORS settings

### Debug Mode
Set `NODE_ENV=development` in `.env` for detailed error messages.

## 📝 API Documentation

### Request/Response Format

All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔄 Real-time Features

The application includes real-time updates for:
- Task status changes
- Team member updates
- Activity feed updates
- Dashboard statistics

These updates are automatically synchronized across all connected clients.

## 📊 Monitoring

### Logs
The application logs important events to the console:
- Database operations
- Authentication events
- WebSocket connections
- API requests

### Performance
- SQLite database for fast local operations
- Indexed database queries for better performance
- Efficient WebSocket connections
- Optimized frontend rendering

## 🎯 Next Steps

After installation:
1. Create your first team
2. Add team members
3. Create tasks and assign them
4. Use the Kanban board to manage workflow
5. Monitor progress with analytics

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the browser console for errors
4. Verify all dependencies are installed correctly

---

**TaskFlow** - Your complete task management solution! 🚀

