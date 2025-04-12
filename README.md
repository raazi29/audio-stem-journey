# STEM Assistant Application

This project is an accessible learning platform designed for visually impaired students to enhance STEM education through audio processing and separation.

## Supabase Integration Guide

This application uses [Supabase](https://supabase.io/) for authentication, database, and storage functionality. Here's how to set up and use Supabase integration.

### Setting Up Supabase

1. **Create a Supabase Project**:
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Configure Environment Variables**:
   Create a `.env` file in the project root with:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Database Migrations**:
   - Install Supabase CLI
   - Run `supabase init` in your project
   - Create migrations in the `supabase/migrations` folder
   - Apply migrations with `supabase db push`

### Database Schema

The application uses the following tables:

#### profiles
Stores user profile information:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  preferences JSONB DEFAULT '{}'::JSONB
);
```

#### user_activities
Tracks user actions within the app:
```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_details JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT
);
```

#### downloads
Tracks app downloads:
```sql
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_version_id UUID REFERENCES app_versions(id),
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  download_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT
);
```

### Authentication Flow

The application implements a dual authentication system:

1. **Online Mode**: Uses Supabase Auth for secure authentication
2. **Offline Mode**: Falls back to localStorage when offline

Key features:
- User signup and login with email/password
- Session persistence
- Automatic sync when going from offline to online mode
- Activity tracking for analytics

### Working with User Data

#### User Profile Management

User profiles are managed through the `user-service.ts` module:

```typescript
// Create or update a user profile
const { success } = await upsertUserProfile({
  id: user.id,
  email: user.email,
  name: "John Doe"
});

// Get a user's profile
const { profile } = await getUserProfile(userId);
```

#### Activity Tracking

Track user actions for analytics:

```typescript
// Track a user activity
await trackUserActivity(
  userId,
  'download',
  { app_version_id: '123' },
  { device: 'mobile' }
);

// Get user's recent activities
const { activities } = await getUserActivities(userId, 10);
```

#### Download Tracking

Track app downloads:

```typescript
// Track a download
await trackDownload(appVersionId, userEmail);

// Get download statistics
const stats = await getDownloadStats();
console.log(`Total downloads: ${stats.total}`);
```

### Offline Support

The application provides offline support with:

- Local authentication
- Data caching in localStorage
- Automatic synchronization when connection is restored
- Graceful degradation of features

## GitHub Repository Integration

This project is available on GitHub at:
https://github.com/AshwinKumarBV-git/Hackathon2025

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Supabase (see above)
4. Start development server: `npm run dev`

## License

This project is licensed under the MIT License.
