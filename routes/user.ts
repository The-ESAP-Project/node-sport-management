import express, { Request, Response } from 'express';
import UserController from '../controller/UserController';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user';

const router = express.Router();

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 获取所有用户
router.get('/', async (req: Request, res: Response<ApiResponse<User[]>>) => {
  try {
    const users = await UserController.getAllUsers();
    res.status(200).json({ code: 0, message: 'Success', data: users });
  } catch (error: any) {
    res.status(500).json({ code: -1, message: error.message, data: null });
  }
});

// 创建用户
router.post('/', async (req: Request<{}, ApiResponse<User>, CreateUserRequest>, res: Response<ApiResponse<User>>) => {
  const { username, password, name, role } = req.body;
  try {
    if (!username || !password || !role) {
      return res.status(422).json({ code: -1, message: 'Missing required fields', data: null });
    }

    if (!['superadmin', 'admin', 'reporter'].includes(role)) {
      return res.status(422).json({ code: -1, message: 'Invalid role', data: null });
    }

    const existingUser = await UserController.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ code: -1, message: 'User already exists', data: null });
    }

    const user = await UserController.createUser({ username, password, name, role });
    res.status(201).json({ code: 0, message: 'User created successfully', data: user });
  } catch (error: any) {
    res.status(500).json({ code: -1, message: error.message, data: null });
  }
});

// 根据ID获取用户
router.get('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<User>>) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ code: -1, message: 'Invalid user ID', data: null });
    }

    const user = await UserController.getUserById(userId);
    if (!user) {
      return res.status(404).json({ code: -1, message: 'User not found', data: null });
    }

    res.status(200).json({ code: 0, message: 'Success', data: user });
  } catch (error: any) {
    res.status(500).json({ code: -1, message: error.message, data: null });
  }
});

// 更新用户
router.put('/:id', async (req: Request<{ id: string }, ApiResponse<User>, UpdateUserRequest>, res: Response<ApiResponse<User>>) => {
  const { id } = req.params;
  const { password, name, role, status } = req.body;
  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ code: -1, message: 'Invalid user ID', data: null });
    }

    if (!password && !name && !role && !status) {
      return res.status(422).json({ code: -1, message: 'No fields to update', data: null });
    }

    if (role && !['superadmin', 'admin', 'reporter'].includes(role)) {
      return res.status(422).json({ code: -1, message: 'Invalid role', data: null });
    }

    if (status && !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(422).json({ code: -1, message: 'Invalid status', data: null });
    }

    const existingUser = await UserController.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ code: -1, message: 'User not found', data: null });
    }

    const updateData: UpdateUserRequest = {};
    if (password) updateData.password = password;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updatedUser = await UserController.updateUser(userId, updateData);
    if (!updatedUser) {
      return res.status(500).json({ code: -1, message: 'Failed to update user', data: null });
    }

    res.status(200).json({ code: 0, message: 'User updated successfully', data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ code: -1, message: error.message, data: null });
  }
});

// 删除用户
router.delete('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ code: -1, message: 'Invalid user ID', data: null });
    }

    const existingUser = await UserController.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ code: -1, message: 'User not found', data: null });
    }

    const deleted = await UserController.deleteUser(userId);
    if (!deleted) {
      return res.status(500).json({ code: -1, message: 'Failed to delete user', data: null });
    }

    res.status(200).json({ code: 0, message: 'User deleted successfully', data: null });
  } catch (error: any) {
    res.status(500).json({ code: -1, message: error.message, data: null });
  }
});

export default router;