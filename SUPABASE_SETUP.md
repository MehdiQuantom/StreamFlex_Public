
# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: Your app name
   - Database Password: Choose a strong password
   - Region: Choose closest to your users
4. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to Settings > API
2. Copy your:
   - Project URL (looks like: https://xxxxx.supabase.co)
   - Anon/Public Key (starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

## Step 3: Update Your App Configuration

Open `config/supabaseConfig.ts` and replace:

```typescript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual credentials:

```typescript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Step 4: Create Database Tables

In your Supabase project dashboard, go to SQL Editor and run these queries:

### Create Favorites Table

```sql
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id, media_type)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
```

### Create Watch History Table

```sql
CREATE TABLE watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  season INTEGER,
  episode INTEGER,
  progress REAL DEFAULT 0,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id, media_type)
);

-- Enable Row Level Security
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own watch history"
  ON watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history"
  ON watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history"
  ON watch_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch history"
  ON watch_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_last_watched ON watch_history(last_watched DESC);
```

## Step 5: Configure Email Authentication

1. In your Supabase project dashboard, go to Authentication > Providers
2. Make sure "Email" is enabled
3. Configure email templates (optional):
   - Go to Authentication > Email Templates
   - Customize the confirmation email template

## Step 6: Test Your Setup

1. Run your app
2. Try signing up with a new account
3. Check your email for the confirmation link
4. Sign in and test the favorites and watch history features

## Troubleshooting

### Email Confirmation Not Working

- Check your spam folder
- In Supabase dashboard, go to Authentication > Settings
- You can disable email confirmation for testing by turning off "Enable email confirmations"

### Database Errors

- Make sure you ran all the SQL queries
- Check that Row Level Security policies are created
- Verify your Supabase credentials are correct in the app

### Authentication Issues

- Clear your app data and try again
- Check the console logs for error messages
- Verify your Supabase URL and Anon Key are correct

## Security Notes

- Never commit your Supabase credentials to version control
- Use environment variables for production apps
- Keep your database password secure
- Row Level Security (RLS) is enabled to protect user data
