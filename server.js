const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const app = express();

console.log('🟢 Starting server initialization...');

// Middleware
app.use(cors());
app.use(express.json());

// Global request logging
app.use((req, res, next) => {
    console.log(`📨 [${req.method}] ${req.path}`);
    next();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Connection Error:', err));

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// Registration Route
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword 
        });
        
        await newUser.save();
        console.log('✅ User registered:', email);

        res.status(201).json({ 
            success: true, 
            message: "Registered Successfully!",
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        console.log('✅ User logged in:', email);

        res.json({ 
            success: true, 
            message: "Login successful!",
            token, 
            user: { 
                id: user._id,
                name: user.name, 
                email: user.email,
                role: user.role
            } 
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Get All Users (for testing)
app.get('/api/users', requireAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Task routes
console.log('Registering task routes...');

app.get('/api/tasks', requireAuth, async (req, res) => {
    try {
        let tasks;
        if (req.user.role === 'Admin') {
            tasks = await Task.find().populate('assignedTo', 'name email').sort({ createdAt: -1 });
        } else {
            tasks = await Task.find({ assignedTo: req.user.id }).populate('assignedTo', 'name email').sort({ createdAt: -1 });
        }
        res.json({ success: true, data: tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post('/api/tasks', requireAuth, requireAdmin, async (req, res) => {
    console.log('POST /api/tasks called');
    try {
        const { title, description, dueDate, assignedTo } = req.body;

        if (!title || !dueDate || !assignedTo) {
            return res.status(400).json({ message: 'Title, dueDate, and assignedTo (user id) are required' });
        }

        const task = new Task({
            title: title.trim(),
            description: (description || '').trim(),
            dueDate: new Date(dueDate),
            status: 'Pending',
            assignedTo: assignedTo,
        });

        await task.save();
        res.status(201).json({ success: true, data: task, message: 'Task created' });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: "Server Error" });
    }
});

app.put('/api/tasks/:id', requireAuth, async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (req.user.role === 'Admin') {
            const { title, description, dueDate, status, assignedTo } = req.body;

            if (title !== undefined) task.title = title.trim();
            if (description !== undefined) task.description = description.trim();
            if (dueDate !== undefined) task.dueDate = new Date(dueDate);
            if (status !== undefined) task.status = status;
            if (assignedTo !== undefined) task.assignedTo = assignedTo || null;

            await task.save();
            return res.json({ success: true, data: task, message: 'Task updated' });
        }

        // non-admin (user) can only complete own tasks
        if (!task.assignedTo || task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        if (req.body.completed || req.body.status === 'Completed') {
            task.status = 'Completed';
            await task.save();
            return res.json({ success: true, data: task, message: 'Task completed' });
        }

        return res.status(400).json({ message: 'No valid completion data' });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: "Server Error" });
    }
});

app.delete('/api/tasks/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        console.log('✅ DELETE handler executing for task:', req.params.id);
        const taskId = req.params.id;
        
        // Validate ObjectId format
        if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid task ID format' });
        }
        
        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ success: true, message: 'Task deleted successfully', data: task });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// 404 handler before error handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware - MUST be after all routes
app.use((err, req, res, next) => {
    console.error('🔴 Global error handler triggered');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    if (!res.headersSent) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});