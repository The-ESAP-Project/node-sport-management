import StudentInfoModel, { StudentInfo } from '../models/StudentInfoModel';

class StudentInfoController {
  async getAllStudentInfo(): Promise<StudentInfo[]> {
    return await StudentInfoModel.findAll();
  }

  async getStudentInfoById(id: number): Promise<StudentInfo | null> {
    return await StudentInfoModel.findByPk(id);
  }

  async createStudentInfo(data: Omit<StudentInfo, 'id'>): Promise<StudentInfo> {
    return await StudentInfoModel.create(data);
  }

  async updateStudentInfo(id: number, data: Partial<Omit<StudentInfo, 'id'>>): Promise<StudentInfo | null> {
    const [affectedRows] = await StudentInfoModel.update(data, { where: { id } });
    if (affectedRows > 0) {
      return await StudentInfoModel.findByPk(id);
    }
    return null;
  }

  async deleteStudentInfo(id: number): Promise<boolean> {
    const affectedRows = await StudentInfoModel.destroy({ where: { id } });
    return affectedRows > 0;
  }
}

export default new StudentInfoController();