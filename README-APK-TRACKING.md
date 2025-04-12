# APK Download Tracking & User Authentication

This project includes a complete integration of user authentication and APK download tracking using Supabase as the backend.

## Features

- **User Authentication**: Complete signup and login functionality
- **APK Download Tracking**: Track all APK downloads with analytics
- **Offline Support**: Works offline with synchronization when back online
- **Admin Dashboard**: View download analytics and user statistics
- **Email Collection**: Option to collect emails from non-registered users

## Database Schema

The system uses the following database tables:

- **users**: Stores user account information
- **app_versions**: Stores information about different APK versions
- **downloads**: Tracks all APK downloads with user information when available

## Setup Instructions

### 1. Environment Setup

Make sure your `.env` file has the Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Database Setup

Run the migration script to set up the database schema:

```bash
npm install
node setup-database.js
```

### 3. Development Server

Start the development server:

```bash
npm run dev
```

## Using the Components

### APK Download Button

Use this component to track and initiate APK downloads:

```jsx
import { ApkDownloadButton } from "@/components/ui/apk-download-button";

// Example usage
<ApkDownloadButton 
  version={{
    id: "123",
    version_name: "1.0.0",
    version_code: 1,
    apk_url: "https://example.com/app.apk",
    release_date: "2023-10-15"
  }}
  collectEmail={true}
  showVersionName={true}
/>
```

### Download Analytics

Use this component to show download statistics:

```jsx
import { DownloadAnalytics } from "@/components/analytics/download-analytics";

// Example usage
<DownloadAnalytics />
```

## Admin Dashboard

Access the admin dashboard at `/admin` to:

- View download statistics
- Manage APK versions
- View user information
- Sync offline data

## API Methods

### Authentication

```js
import { signUp, signIn, signOut, getCurrentUser } from "@/lib/auth";

// Sign up a new user
const { success, user } = await signUp("email@example.com", "password");

// Sign in an existing user
const { success, user } = await signIn("email@example.com", "password");

// Sign out
await signOut();

// Get current user
const { user } = await getCurrentUser();
```

### Download Tracking

```js
import { recordDownload, getTotalDownloads, getDownloadStats } from "@/lib/download-tracker";

// Record a download
await recordDownload("version-id", { email: "user@example.com" });

// Get total downloads
const { count } = await getTotalDownloads();

// Get detailed download statistics
const stats = await getDownloadStats();
```

## Offline Support

The system automatically handles offline usage:

1. When offline, user actions are stored locally
2. Downloads are tracked locally
3. When back online, data is synced with the server
4. Local-only users can be migrated to real accounts

## Security Considerations

- The Supabase anon key is safe to expose in client-side code
- For production, set up Row Level Security (RLS) in Supabase
- Always validate user input server-side
- Consider implementing rate limiting for download tracking

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify Supabase connection is working
3. Ensure tables are created correctly
4. Check if RLS policies are blocking access 