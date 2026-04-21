import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

export const findUserById = async (id) => {
    return await User.findById(id).select('-password'); // Exclude password from result
};

export const createUser = async ({ name, email, password }) => {
    if (!name || !email || !password) {
        const error = new Error('Name, email, and password are required');
        error.statusCode = 400;
        throw error;
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        const error = new Error('User with this email already exists');
        error.statusCode = 409; // 409 Conflict
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Return user without the password
    const { password: _, ...userToReturn } = newUser.toObject();
    return userToReturn;
};