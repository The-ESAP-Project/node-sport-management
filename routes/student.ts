import express, { Request, Response } from 'express';
import StudentInfoController from '../controller/StudentInfoController';
import { StudentInfo } from '../models/StudentInfoModel';

const router = express.Router();

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 获取所有学生信息
router.get('/', async (req: Request, res: Response<ApiResponse<StudentInfo[]>>) => {
  try {
    const students = await StudentInfoController.getAllStudentInfo();
    res.status(200).json({ code: 0, message: 'Success', data: students });
  } catch (error: any) {
    res.status(500).json({ code: -1, message: error.message, data: null });
  }
});

// 根据ID获取学生信息
router.get('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<StudentInfo>>) => {
  const { id } = req.params;
  try {
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ code: -1, message: 'Invalid student ID', data: null });
    }

    const student = await StudentInfoController.getStudentInfoById(studentId);
    if (!student) {
      return res.status(404).json({ code: -1, message: 'Student not found', data: null });
    }

    res.status(200).json({ code: 0, message: 'Success', data: student });
  } catch (error: any) {
    res.status(500).json({ code: -1, message: error.message, data: null });
  }
});

// 创建学生信息
router.post('/', async (req: Request<{}, ApiResponse<StudentInfo>, Omit<StudentInfo, 'id'>>, res: Response<ApiResponse<StudentInfo>>) => {
  try {
    const student = await StudentInfoController.createStudentInfo(req.body);
    res.status(201).json({ code: 0, message: 'Student created successfully', data: student });
  } catch (error: any) {
    res.status(500).json({ code: -1, message: error.message, data: null });
  }
});

// 更新学生信息
router.put('/:id', async (req: Request<{ id: string }, ApiResponse<StudentInfo>, Partial<Omit<StudentInfo, 'id'>>>, res: Response<ApiResponse<StudentInfo>>) => {
  const { id } = req.params;
  try {
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ code: -1, message: 'Invalid student ID', data: null });
    }

    const updatedStudent = await StudentInfoController.updateStudentInfo(studentId, req.body);
    if (!updatedStudent) {
      return res.status(404).json({ code: -1, message: 'Student not found', data: null });
    }

    res.status(200).json({ code: 0, message: 'Student updated successfully', data: updatedStudent });
  } catch (error: any) {
    res.status(500).json({ code: -1, message: error.message, data: null });
  }
});

// 删除学生信息
router.delete('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
  const { id } = req.params;
  try {
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ code: -1, message: 'Invalid student ID', data: null });
    }

    const deleted = await StudentInfoController.deleteStudentInfo(studentId);
    if (!deleted) {
      return res.status(404).json({ code: -1, message: 'Student not found', data: null });
    }

    res.status(200).json({ code: 0, message: 'Student deleted successfully', data: null });
  } catch (error: any) {
    res.status(500).json({ code: -1, message: error.message, data: null });
  }
});

export default router;