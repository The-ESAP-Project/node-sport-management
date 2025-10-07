// 服务层导入和导出
import UserService, { createDefaultAdmin } from './userService';
import StudentService from './studentService';
import SportDataService from './sportDataService';
import ClassService from './classService';

// 导出所有服务
export {
  UserService,
  StudentService,
  SportDataService,
  ClassService,
  createDefaultAdmin
};

// 默认导出所有服务
export default {
  UserService,
  StudentService,
  SportDataService,
  ClassService,
  createDefaultAdmin
};