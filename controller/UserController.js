const User = require('../models/UserModel');

class UserController {
    getAllUsers = async () => {
        return await User.findAll(); // 添加 await
    }

    getUserById = async (id) => {
        return await User.findByPk(id); // 添加 await
    }

    getUserByUsername = async (username) => {
        return await User.findOne({ where: { username: username }}); // 添加 await
    }

    createUser = async (data) => {
        return await User.create(data); // 添加 await
    }

    updateUser = async (id, data) => {
        if (await User.update(data, { where: { id } })) {
            return await User.findByPk(id); // 添加 await
        }
        return null;
    }

    deleteUser = async (id) => {
        if (await User.destroy({ where: { id } })) {
            return true;
        }
        return false;
    }
}

module.exports = new UserController;