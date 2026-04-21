import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userService from './userService.js';

const router = Router();

// A simple middleware to protect routes
const protect = async (req, res, next) => {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized, no token provided' });
    }

    try {
        const token = bearer.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'a_secure_secret_key');
        req.user = await userService.findUserById(decoded.id); // Must be awaited
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized, user not found' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized, token is invalid' });
    }
};

// POST /api/users/register
router.post('/register', async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await userService.findUserByEmail(email); // Must be awaited
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'a_secure_secret_key', {
        expiresIn: '1d',
    });

    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
});

// GET /api/users/me (Protected Route)
router.get('/me', protect, async (req, res) => {
    // req.user is attached by the 'protect' middleware
    const { password, ...userWithoutPassword } = req.user.toObject();
    res.json(userWithoutPassword);
});

export default router;