# Vercel Deployment Guide

This document provides instructions for deploying the application on Vercel with a fully functional Supabase PostgreSQL database.

## Pre-deployment Steps

1. **Set up Supabase Project**
   - Create a Supabase project if you haven't already
   - Note your Supabase URL and anon key
   - Ensure your database has the required tables by executing migrations

2. **Prepare Your Repository**
   - Ensure the repository has all the configuration files:
     - `vercel.json`
     - `vite.config.ts` (with optimizations)
     - `vercel-db-setup.js`

## Deployment Steps

### Option 1: Deploy using Vercel UI

1. **Connect to Vercel**
   - Sign in to [Vercel](https://vercel.com/)
   - Create a new project and import your repository
   
2. **Configure Environment Variables**
   - Add the following environment variables:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
   
3. **Configure Build Settings**
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   
4. **Deploy**
   - Click "Deploy" and wait for the build to complete

### Option 2: Deploy using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set up Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Post-deployment Steps

1. **Verify Database Connection**
   - Visit your deployed site
   - Log in to verify authentication works
   - Try downloading an APK to verify download tracking

2. **Troubleshooting Database Connection**
   If you encounter issues with the database connection:
   
   - Check Vercel logs to ensure the database setup script ran successfully
   - Verify that your environment variables are set correctly
   - Ensure Supabase project permissions are configured correctly
   - Check if row-level security (RLS) is configured correctly in Supabase

## Security Considerations

1. **Environment Variables**
   - Never commit .env files to your repository
   - Use Vercel's environment variables feature for sensitive information

2. **Supabase Security**
   - Ensure your Supabase project has appropriate Row Level Security (RLS) policies
   - Consider setting up service roles for elevated privileges instead of using anon key

3. **API Rate Limiting**
   - Consider implementing rate limiting to prevent abuse

## Performance Optimization

The project is already configured for optimal performance on Vercel with:

- Code splitting using manualChunks in vite.config.ts
- Appropriate caching strategies
- Optimized build process
- Client-side offline support with syncing 