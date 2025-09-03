import StudentInfoModel, { StudentInfo } from '../models/StudentInfoModel';
import { Op } from 'sequelize';

interface StudentQueryParams {
  classId?: number;
  grade?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class StudentInfoController {
  async getAllStudents(params: StudentQueryParams = {}): Promise<PaginatedResult<StudentInfo>> {
    const {
      classId,
      grade,
      keyword,
      page = 1,
      pageSize = 20
    } = params;

    const where: any = { isDeleted: false };

    if (classId) {
      where.classID = classId;
    }

    if (keyword) {
      where[Op.or] = [
        { StuRegisterNumber: { [Op.like]: `%${keyword}%` } },
        { StuName: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const offset = (page - 1) * pageSize;

    const { rows: items, count: total } = await StudentInfoModel.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['id', 'ASC']]
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async getStudentById(id: number): Promise<StudentInfo | null> {
    return await StudentInfoModel.findOne({
      where: { id, isDeleted: false }
    });
  }

  async getStudentByRegisterNumber(registerNumber: string): Promise<StudentInfo | null> {
    return await StudentInfoModel.findOne({
      where: { StuRegisterNumber: registerNumber, isDeleted: false }
    });
  }

  async createStudent(data: Omit<StudentInfo, 'id' | 'isDeleted' | 'deletedAt'>): Promise<StudentInfo> {
    return await StudentInfoModel.create({
      ...data,
      isDeleted: false
    });
  }

  async createStudentsBulk(data: Omit<StudentInfo, 'id' | 'isDeleted' | 'deletedAt'>[]): Promise<StudentInfo[]> {
    const students = data.map(student => ({
      ...student,
      isDeleted: false
    }));
    return await StudentInfoModel.bulkCreate(students);
  }

  async updateStudent(id: number, data: Partial<Omit<StudentInfo, 'id' | 'isDeleted' | 'deletedAt'>>): Promise<StudentInfo | null> {
    const [affectedRows] = await StudentInfoModel.update(data, {
      where: { id, isDeleted: false }
    });
    if (affectedRows > 0) {
      return await StudentInfoModel.findByPk(id);
    }
    return null;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const [affectedRows] = await StudentInfoModel.update(
      { isDeleted: true, deletedAt: new Date() },
      { where: { id, isDeleted: false } }
    );
    return affectedRows > 0;
  }
}

export default new StudentInfoController();