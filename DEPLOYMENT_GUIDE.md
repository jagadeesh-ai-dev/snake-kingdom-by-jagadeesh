
# Hungry Snake Deployment Guide

This guide will help you deploy the Hungry Snake application to make it available to players online and ensure they can track their stats seamlessly.

## Prerequisites

Before you begin, make sure you have the following:

1. A GitHub account
2. Basic familiarity with command line operations
3. A hosting service account (we'll provide options below)

## Step 1: Set Up Backend Database

For this application to work correctly in production, you need to set up a proper database. Here are the best options:

### Option A: Use Supabase (Recommended)

Supabase is an open-source Firebase alternative that provides authentication, database and storage capabilities.

1. Go to [Supabase.com](https://supabase.com/) and create a free account
2. Create a new project and note your API URLs and keys
3. Set up the following tables:
   - Users
   - GameHistory
   - Tournaments
   - FriendRequests
   - Messages
4. Create authentication providers (email/password at minimum)
5. Set up storage buckets for profile images

### Option B: Firebase

Firebase is another excellent option for real-time database capabilities:

1. Go to [Firebase.com](https://firebase.google.com/) and create an account
2. Create a new project
3. Enable Authentication, Firestore Database, and Storage features
4. Note your Firebase configuration details

## Step 2: Update Environment Variables

Create a `.env` file in your project root with the appropriate variables:

```
# For Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OR for Firebase
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 3: Build Your Application

Run the following commands to create an optimized production build:

```bash
# Install dependencies if you haven't already
npm install

# Create a production build
npm run build
```

This will create a `dist` folder with your compiled application.

## Step 4: Choose a Hosting Provider

Here are several great options for hosting your application:

### Option A: Vercel (Recommended for Frontend)

1. Create an account on [Vercel](https://vercel.com/)
2. Install Vercel CLI: `npm i -g vercel`
3. In your project directory, run: `vercel`
4. Follow the prompts to deploy your application
5. Set up your environment variables in the Vercel dashboard

### Option B: Netlify

1. Create an account on [Netlify](https://www.netlify.com/)
2. Drag and drop your `dist` folder to the Netlify dashboard, or
3. Connect your GitHub repository for continuous deployment
4. Configure environment variables in the Netlify dashboard

### Option C: GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to your package.json:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run: `npm run deploy`

## Step 5: Set Up Custom Domain (Optional)

For a professional look, consider purchasing and connecting a custom domain:

1. Purchase a domain from providers like Namecheap, GoDaddy, or Google Domains
2. Follow your hosting provider's instructions to connect your domain
3. Set up SSL certification (usually automatic with Vercel and Netlify)

## Step 6: Implement Analytics

To track user engagement and game statistics:

1. Set up Google Analytics or a similar service
2. Add the tracking code to your application
3. Create custom events for tracking game completions, high scores, etc.

## Step 7: Continuous Integration/Deployment

For seamless updates:

1. Connect your GitHub repository to your hosting provider
2. Set up automatic deployments when you push to the main branch
3. Configure build settings as needed

## Troubleshooting Common Issues

- **Database Connection Issues**: Verify your environment variables are correctly set
- **Authentication Problems**: Check CORS settings and authentication rules
- **Missing Assets**: Ensure all assets are correctly referenced in your build
- **Performance Issues**: Consider implementing lazy loading and code splitting

## Regular Maintenance

For ongoing success:

1. Monitor error tracking through services like Sentry
2. Regularly backup your database
3. Keep dependencies up to date with `npm audit` and `npm update`
4. Test performance across different devices and browsers

By following these steps, your Hungry Snake game will be securely deployed and accessible to users worldwide with persistent state tracking across sessions.
