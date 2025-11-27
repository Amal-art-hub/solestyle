// server.js

// 1. MODULE IMPORTS (MODIFICATION)
import express from 'express';
import path from 'path';
// Import dotenv to load environment variables (.env file)
import 'dotenv/config'; 
// Import mongoose to connect to MongoDB Atlas
import mongoose from 'mongoose'; 
// test


const app = express();
// Load port from .env or default to 5000
const PORT = process.env.PORT || 5000; 

// Resolve the current directory path
const __dirname = path.resolve();

// --- EJS SETUP ---
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));
// -----------------

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve static files (like CSS, images) ---
app.use(express.static(path.join(__dirname, 'public')));
// ---------------------------------------------


// 2. MONGODB ATLAS CONNECTION FUNCTION (MODIFICATION)
const connectDB = async () => {
    try {
        // MONGO_URI is loaded from the .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Exit process with failure if connection fails
        process.exit(1); 
    }
};


// Add a test route to render the sign-up page (KEEP THIS)
app.get('/signup', (req, res) => {
    // This will look for views/signup.ejs
    res.render('signup', { 
        title: 'Create Your Account',
        error: null 
    });
});

// ... [rest of your server code, including routes] ...


// 3. START SERVER LOGIC (MODIFICATION)
const startServer = async () => {
    // Attempt to connect to the database first
    await connectDB();
    
    // Only start listening for requests if the DB connection was successful
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();