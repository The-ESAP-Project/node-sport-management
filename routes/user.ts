import express, { Request, Response } from 'express';
import UserController from '../controller/UserController';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user';
import { ErrorCode, ErrorMessages } from '../types/error';

const router = express.Router();

// 使用统一的 ApiResponse 类型
type ApiResponse<T = any> = {
  code: number;
  message: string;
  data: T | null;
  timestamp: string;
};

// 获取所有用户
router.get('/', async (req: Request, res: Response<ApiResponse<User[]>>) => {
  try {
    const users = await UserController.getAllUsers();
    res.status(200).json({
      code: ErrorCode.Success,
      message: ErrorMessages[ErrorCode.Success],
      data: users,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      code: ErrorCode.InternalServerError,
      message: ErrorMessages[ErrorCode.InternalServerError],
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// 创建用户
router.post('/', async (req: Request<{}, ApiResponse<User>, CreateUserRequest>, res: Response<ApiResponse<User>>) => {
  const { username, password, name, role } = req.body;
  try {
    if (!username || !password || !role) {
      return res.status(422).json({
        code: ErrorCode.BadRequest,
        message: 'Missing required fields',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (!['superadmin', 'admin', 'reporter'].includes(role)) {
      return res.status(422).json({
        code: ErrorCode.BadRequest,
        message: 'Invalid role',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const existingUser = await UserController.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        code: ErrorCode.Conflict,
        message: 'User already exists',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const user = await UserController.createUser({ username, password, name, role });
    res.status(201).json({
      code: ErrorCode.Success,
      message: 'User created successfully',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      code: ErrorCode.InternalServerError,
      message: ErrorMessages[ErrorCode.InternalServerError],
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// 根据ID获取用户
router.get('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<User>>) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        code: ErrorCode.BadRequest,
        message: 'Invalid user ID',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const user = await UserController.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        code: ErrorCode.NotFound,
        message: 'User not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      code: ErrorCode.Success,
      message: ErrorMessages[ErrorCode.Success],
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      code: ErrorCode.InternalServerError,
      message: ErrorMessages[ErrorCode.InternalServerError],
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// 更新用户
router.put('/:id', async (req: Request<{ id: string }, ApiResponse<User>, UpdateUserRequest>, res: Response<ApiResponse<User>>) => {
  const { id } = req.params;
  const { password, name, role, status } = req.body;
  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        code: ErrorCode.BadRequest,
        message: 'Invalid user ID',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (!password && !name && !role && !status) {
      return res.status(422).json({
        code: ErrorCode.BadRequest,
        message: 'No fields to update',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (role && !['superadmin', 'admin', 'reporter'].includes(role)) {
      return res.status(422).json({
        code: ErrorCode.BadRequest,
        message: 'Invalid role',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    if (status && !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(422).json({
        code: ErrorCode.BadRequest,
        message: 'Invalid status',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const existingUser = await UserController.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        code: ErrorCode.NotFound,
        message: 'User not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const updateData: UpdateUserRequest = {};
    if (password) updateData.password = password;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updatedUser = await UserController.updateUser(userId, updateData);
    if (!updatedUser) {
      return res.status(500).json({
        code: ErrorCode.InternalServerError,
        message: 'Failed to update user',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      code: ErrorCode.Success,
      message: 'User updated successfully',
      data: updatedUser,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      code: ErrorCode.InternalServerError,
      message: ErrorMessages[ErrorCode.InternalServerError],
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// 删除用户
router.delete('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        code: ErrorCode.BadRequest,
        message: 'Invalid user ID',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const existingUser = await UserController.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        code: ErrorCode.NotFound,
        message: 'User not found',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    const success = await UserController.deleteUser(userId);
    if (!success) {
      return res.status(500).json({
        code: ErrorCode.InternalServerError,
        message: 'Failed to delete user',
        data: null,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      code: ErrorCode.Success,
      message: 'User deleted successfully',
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      code: ErrorCode.InternalServerError,
      message: ErrorMessages[ErrorCode.InternalServerError],
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;