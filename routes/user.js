const express = require('express');
const router = express.Router();
const UserController = require('../controller/UserController');

router.get('/', async (req, res) => {
    try {
        const users = await UserController.getAllUsers();

        users.forEach(user => { 
            delete user.dataValues.password; 
        });

        res.status(200).json({ code: 0, message: 'Success', data: users });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message, data: null });
    }
});

router.post('/', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        
        if (!username || !password || !role) {
            return res.status(422).json({ code: -1, message: 'Missing required fields', data: null });
        }

        if (role !== 'superadmin' && role !== 'admin' && role !== 'user') {
            return res.status(422).json({ code: -1, message: 'Invalid role', data: null });
        }

        const existingUser = await UserController.getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ code: -1, message: 'User already exists', data: null });
        }

        const user = await UserController.createUser({ username, password, role });
        delete user.dataValues.password;

        res.status(201).json({ code: 0, message: 'User created successfully', data: user });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message, data: null });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await UserController.getUserById(id);
        if (!user) {
            return res.status(404).json({ code: -1, message: 'User not found', data: null });
        }

        delete user.dataValues.password;
        res.status(200).json({ code: 0, message: 'Success', data: user });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message, data: null });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;
    try {

        if (!username && !password && !role) {
            return res.status(422).json({ code: -1, message: 'No fields to update', data: null });
        }

        if (role && role !== 'superadmin' && role !== 'admin' && role !== 'user') {
            return res.status(422).json({ code: -1, message: 'Invalid role', data: null });
        }

        const existingUser = await UserController.getUserById(id);
        if (!existingUser) {
            return res.status(404).json({ code: -1, message: 'User not found', data: null });
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (password) updateData.password = password;
        if (role) updateData.role = role;

        const updatedUser = await UserController.updateUser(id, updateData);
        if (!updatedUser) {
            return res.status(500).json({ code: -1, message: 'Failed to update user', data: null });
        }

        delete updatedUser.dataValues.password;
        res.status(200).json({ code: 0, message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message, data: null });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        
        const existingUser = await UserController.getUserById(id);
        if (!existingUser) {
            return res.status(404).json({ code: -1, message: 'User not found', data: null });
        }

        if (await UserController.deleteUser(id)) {
            return res.status(200).json({ code: 0, message: 'User deleted successfully', data: null });
        }

        res.status(500).json({ code: -1, message: 'Failed to delete user', data: null });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message, data: null });
    }
});

module.exports = router;