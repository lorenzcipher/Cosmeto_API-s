# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign In" if you already have an account
3. Create a new account or sign in with existing credentials

## Step 2: Create a New Cluster

1. After logging in, click "Create" or "Build a Database"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Give your cluster a name (e.g., "nextjs-api-cluster")
5. Click "Create Cluster" (this may take 1-3 minutes)

## Step 3: Create Database User

1. In the Atlas dashboard, go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Create a username and strong password
5. Under "Database User Privileges", select "Read and write to any database"
6. Click "Add User"

**Important**: Save these credentials - you'll need them for the connection string!

## Step 4: Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For production, restrict to specific IP addresses
4. Click "Confirm"

## Step 5: Get Connection String

1. Go back to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as the driver and version "4.1 or later"
5. Copy the connection string - it will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env.local File

Replace the placeholders in your connection string:

```env
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/nextjs-api?retryWrites=true&w=majority

# Generate secure JWT secrets (see below for generation methods)
JWT_SECRET=your-generated-jwt-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-jwt-secret-here

# Keep this as is for local development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Example with actual values:
```env
MONGODB_URI=mongodb+srv://johnsmith:MySecurePass123@cluster0.ab1cd.mongodb.net/nextjs-api?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8t7
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## How to Generate JWT Secrets

### Method 1: Using Node.js (Recommended)
Open your terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run this command twice to get two different secrets.

### Method 2: Using OpenSSL
```bash
openssl rand -hex 64
```

### Method 3: Online Generator
Visit [Generate Random](https://generate-random.org/encryption-key-generator) and generate two 64-character hex keys.

### Method 4: Manual Generation
Use any combination of letters (a-z, A-Z) and numbers (0-9) to create strings that are at least 32 characters long. Make them different from each other.

## Important Security Notes

1. **Never commit .env.local to version control**
2. **Use different secrets for development and production**
3. **Keep your database credentials secure**
4. **For production, restrict network access to specific IP addresses**
5. **Use strong passwords for database users**

## Testing Your Connection

After updating your `.env.local` file:

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Test the connection by making a signup request to:
   ```
   POST http://localhost:3000/api/auth/signup
   ```

3. If successful, you should see a user created in your MongoDB Atlas database under the "nextjs-api" database.

## Troubleshooting

### Common Issues:

1. **"MongoNetworkError"**: Check your network access settings in Atlas
2. **"Authentication failed"**: Verify your username and password in the connection string
3. **"Database not found"**: The database will be created automatically when you first insert data

### Connection String Format:
```
mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

- `<username>`: Your database user's username
- `<password>`: Your database user's password (URL encode special characters)
- `<cluster-url>`: Your cluster's URL (e.g., cluster0.ab1cd.mongodb.net)
- `<database-name>`: Your database name (e.g., nextjs-api)

## Next Steps

Once your environment is configured:

1. Start the development server: `npm run dev`
2. Follow the Postman testing guide in the main README
3. Create your first user account via the signup endpoint
4. Test all the API endpoints as described in the documentation

Your MongoDB Atlas database will automatically create collections (users, events, files) when you first use the API endpoints.