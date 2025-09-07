   npm install# Campus Event Management System - Complete Setup Guide

## 🎯 Project Overview

This is a comprehensive campus event management system with:
- **Admin Portal (Web)**: For college staff to create and manage events
- **Student App (Mobile PWA)**: For students to browse, register, and check-in to events
- **Backend API**: Express.js server with Supabase integration

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Supabase account

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd campus-event-management

# Run setup script
# On Linux/Mac:
chmod +x setup.sh
./setup.sh

# On Windows:
setup.bat
```

### 2. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready (2-3 minutes)

#### Configure Database
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL commands

#### Get API Credentials
1. Go to "Settings" → "API"
2. Copy your "Project URL" and "anon public" key
3. Update the `.env` file with these credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-jwt-secret-key
PORT=5000
```

### 3. Start the Application

```bash
# Start the backend server (this will serve both frontend apps)
npm run dev

# The applications will be available at:
# - Admin Portal: http://localhost:5000/admin
# - Student App: http://localhost:5000/student
# - Backend API: http://localhost:5000/api
```

**Note**: The Express server now serves both the admin portal and student app, so you only need to run `npm run dev` to start everything.

## 📱 Application Features

### Admin Portal Features
- **Event Management**: Create, edit, delete events
- **Registration Management**: View all student registrations
- **Analytics Dashboard**: Track event attendance and statistics
- **Check-in System**: Check-in students for events
- **Real-time Updates**: Live data updates

### Student App Features
- **Event Browsing**: View upcoming events with filtering
- **Event Registration**: Register for events with contact details
- **My Events**: View personal registrations and status
- **Check-in**: Quick check-in using email
- **PWA Support**: Install as mobile app
- **Offline Support**: Basic offline functionality

## 🗄️ Database Schema

### Events Table
- `id`: Unique identifier
- `title`: Event title
- `description`: Event description
- `date`: Event date
- `time`: Event time
- `location`: Event location
- `type`: Event type (hackathon, workshop, tech_talk, fest)
- `max_participants`: Maximum participants allowed
- `image_url`: Event image URL
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Registrations Table
- `id`: Unique identifier
- `event_id`: Foreign key to events table
- `student_name`: Student's full name
- `student_email`: Student's email
- `student_phone`: Student's phone number
- `status`: Registration status (registered, checked_in, cancelled)
- `check_in_time`: Check-in timestamp
- `created_at`: Registration timestamp
- `updated_at`: Last update timestamp

### Admin Users Table
- `id`: Unique identifier
- `email`: Admin email
- `password_hash`: Hashed password
- `name`: Admin name
- `role`: User role
- `created_at`: Account creation timestamp

## 🔧 API Endpoints

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Registrations
- `POST /api/registrations` - Register for event
- `GET /api/registrations/:event_id` - Get event registrations

### Check-in
- `POST /api/checkin` - Check-in student

### Analytics
- `GET /api/analytics` - Get event analytics

## 📱 PWA Features

The student app is a Progressive Web App with:
- **Installable**: Can be installed on mobile devices
- **Offline Support**: Basic offline functionality
- **Responsive Design**: Works on all screen sizes
- **Fast Loading**: Cached resources for quick access

### Installing the Student App
1. Open the student app in a mobile browser
2. Look for "Add to Home Screen" option
3. Tap to install the app
4. The app will appear on your home screen

## 🎨 Customization

### Styling
- Admin portal: `admin-portal/styles.css`
- Student app: `student-app/styles.css`
- Both use CSS custom properties for easy theming

### Configuration
- Backend settings: `.env` file
- Database schema: `supabase/schema.sql`
- PWA settings: `student-app/manifest.json`

## 🚀 Deployment

### Backend Deployment
1. Deploy to platforms like Heroku, Railway, or DigitalOcean
2. Set environment variables in your hosting platform
3. Update API URLs in frontend applications

### Frontend Deployment
1. Deploy admin portal to Netlify, Vercel, or similar
2. Deploy student app to the same or different platform
3. Update API endpoints to point to your deployed backend

### Database
- Supabase handles database hosting automatically
- No additional database setup required

## 🔒 Security Considerations

- All API endpoints are public (for demo purposes)
- In production, implement proper authentication
- Add rate limiting to prevent abuse
- Validate all user inputs
- Use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend is running on correct port
   - Check API URLs in frontend applications

2. **Database Connection Issues**
   - Verify Supabase credentials in `.env`
   - Check if database schema is properly set up

3. **PWA Not Installing**
   - Ensure HTTPS in production
   - Check manifest.json configuration
   - Verify service worker is registered

4. **Events Not Loading**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check Supabase RLS policies

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check browser console for errors
4. Verify all setup steps are completed

## 🎉 Success!

Once everything is set up, you should have:
- ✅ Admin portal running on http://localhost:3000
- ✅ Student app running on http://localhost:3001
- ✅ Backend API running on http://localhost:5000
- ✅ Database configured with sample data
- ✅ PWA functionality working

Enjoy your campus event management system! 🎊
