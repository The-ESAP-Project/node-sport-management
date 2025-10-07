import { Router } from 'express';
import StudentController from '../controllers/studentController';
import { authenticate, requireAdmin, requireClass, checkClassAccess } from '../middleware/auth';
import { body, param, query, validationResult } from 'express-validator';
import { ResponseUtils } from '../utils/helpers';

const router: Router = Router();

// 验证中间件
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(ResponseUtils.error('VALIDATION_ERROR', '请求参数验证失败', errors.array()));
  }
  next();
};

/**
 * @route POST /api/students
 * @desc 创建学生
 * @access Private (Admin/Class)
 */
router.post('/', authenticate, requireClass, [
  body('StuRegisterNumber')
    .notEmpty()
    .withMessage('学籍号不能为空')
    .isLength({ min: 10, max: 20 })
    .withMessage('学籍号长度必须在10-20字符之间'),
  body('StuName')
    .notEmpty()
    .withMessage('姓名不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('姓名长度必须在1-50字符之间'),
  body('StuGender')
    .isIn(['0', '1'])
    .withMessage('性别必须是0（女）或1（男）'),
  body('StuNation')
    .optional()
    .isInt({ min: 1 })
    .withMessage('民族代码必须是正整数'),
  body('StuBirth')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('生日格式不正确，应为YYYY-MM-DD'),
  body('classID')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数')
], validateRequest, StudentController.createStudent);

/**
 * @route GET /api/students/class/:classID
 * @desc 根据班级获取学生列表
 * @access Private (Admin/Class)
 */
router.get('/class/:classID', authenticate, requireClass, [
  param('classID')
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),
  query('search')
    .optional()
    .isLength({ max: 50 })
    .withMessage('搜索关键字长度不能超过50字符')
], validateRequest, StudentController.getStudentsByClass);

/**
 * @route GET /api/students/register/:registerNumber
 * @desc 根据学籍号获取学生信息
 * @access Private (Admin/Class)
 */
router.get('/register/:registerNumber', authenticate, requireClass, [
  param('registerNumber')
    .isLength({ min: 10, max: 20 })
    .withMessage('学籍号长度必须在10-20字符之间')
], validateRequest, StudentController.getStudentByRegisterNumber);

/**
 * @route GET /api/students/:id
 * @desc 获取学生详细信息（包含体测数据）
 * @access Private (Admin/Class)
 */
router.get('/:id', authenticate, requireClass, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('学生ID必须是正整数'),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('年份必须是2020-2030之间的整数')
], validateRequest, StudentController.getStudentDetail);

/**
 * @route PUT /api/students/:id
 * @desc 更新学生信息
 * @access Private (Admin/Class)
 */
router.put('/:id', authenticate, requireClass, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('学生ID必须是正整数'),
  body('StuName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('姓名长度必须在1-50字符之间'),
  body('StuGender')
    .optional()
    .isIn(['0', '1'])
    .withMessage('性别必须是0（女）或1（男）'),
  body('StuNation')
    .optional()
    .isInt({ min: 1 })
    .withMessage('民族代码必须是正整数'),
  body('StuBirth')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('生日格式不正确，应为YYYY-MM-DD'),
  body('classID')
    .optional()
    .isInt({ min: 1 })
    .withMessage('班级ID必须是正整数')
], validateRequest, StudentController.updateStudent);

/**
 * @route DELETE /api/students/:id
 * @desc 删除学生
 * @access Private (Admin/Class)
 */
router.delete('/:id', authenticate, requireClass, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('学生ID必须是正整数')
], validateRequest, StudentController.deleteStudent);

/**
 * @route POST /api/students/batch/import
 * @desc 批量导入学生
 * @access Private (Admin/Class)
 */
router.post('/batch/import', authenticate, requireClass, [
  body('students')
    .isArray({ min: 1 })
    .withMessage('学生数据必须是非空数组'),
  body('students.*.StuRegisterNumber')
    .notEmpty()
    .withMessage('学籍号不能为空')
    .isLength({ min: 10, max: 20 })
    .withMessage('学籍号长度必须在10-20字符之间'),
  body('students.*.StuName')
    .notEmpty()
    .withMessage('姓名不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('姓名长度必须在1-50字符之间'),
  body('students.*.StuGender')
    .isIn(['0', '1'])
    .withMessage('性别必须是0（女）或1（男）'),
  body('students.*.StuBirth')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('生日格式不正确，应为YYYY-MM-DD'),
  body('students.*.className')
    .notEmpty()
    .withMessage('班级名称不能为空')
], validateRequest, StudentController.batchImportStudents);

/**
 * @route POST /api/students/validate
 * @desc 验证学生数据
 * @access Private (Admin/Class)
 */
router.post('/validate', authenticate, requireClass, [
  body('students')
    .isArray()
    .withMessage('学生数据必须是数组')
], validateRequest, StudentController.validateStudentData);

/**
 * @route GET /api/students/stats/grade/:grade
 * @desc 按年级获取学生统计
 * @access Private (Admin)
 */
router.get('/stats/grade/:grade', authenticate, requireAdmin, [
  param('grade')
    .matches(/^\d{4}$/)
    .withMessage('年级格式不正确，应为4位数字')
], validateRequest, StudentController.getStudentStatsByGrade);

export default router;