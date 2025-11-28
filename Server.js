// server.js

// 1. MODULE IMPORTS (UPDATED: errorMiddleware ചേർക്കുന്നു)
import express from 'express';
import path from 'path';
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/user.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js'; // <-- NEW IMPORT
// test

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// --- EJS SETUP ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// -----------------

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- Serve static files (like CSS, images) ---
app.use(express.static(path.join(__dirname, 'public')));
// ---------------------------------------------


// 2. MONGODB ATLAS CONNECTION FUNCTION (മാറ്റമില്ല)
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};


// ------------------------------------------------
// --- EJS RENDERING ROUTES (പേജുകൾ കാണിക്കാനുള്ള റൂട്ടുകൾ) ---
// ------------------------------------------------

// Renders the home page
app.get('/', (req, res) => {
    res.render('home', {
        title: 'SoleStyle — Home'
    });
});

// Renders the sign-up page
app.get('/signup', (req, res) => {
    res.render('signup', { 
        title: 'Create Your Account',
        error: req.query.error || null
    });
});

// Renders the About page
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us - SoleStyle'
    });
});


// Renders the OTP verification page
app.get('/verify', (req, res) => {
    const email = req.query.email || '';

    res.render('verify-otp', {
        title: 'Verify Your Account',
        email: email,
        error: req.query.error || null
    });
});

// Renders the Login page
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'User Login',
        error: req.query.error || null,
        success: req.query.success || null
    });
});

// ------------------------------------------------
// --- API ROUTING INTEGRATION ---
// ------------------------------------------------
app.use('/api/auth', authRoutes);


// ------------------------------------------------
// --- ERROR MIDDLEWARE (MUST BE LAST) ---
// ------------------------------------------------
// 404 Not Found കൈകാര്യം ചെയ്യുന്നു
app.use(notFound);

// പൊതുവായ പിശകുകൾ കൈകാര്യം ചെയ്യുന്നു (asyncHandler-ൽ നിന്നുള്ളവ ഉൾപ്പെടെ)
app.use(errorHandler);


// 3. START SERVER LOGIC (മാറ്റമില്ല)
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();