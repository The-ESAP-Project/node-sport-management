import ClassInfoModel, { ClassInfo } from '../models/ClassInfoModel';

class ClassInfoController {
  async getAllClasses(): Promise<ClassInfo[]> {
    return await ClassInfoModel.findAll({
      where: { isDeleted: false }
    });
  }

  async getClassById(id: number): Promise<ClassInfo | null> {
    return await ClassInfoModel.findOne({
      where: { id, isDeleted: false }
    });
  }

  async getClassesByAcademicYear(academicYear: number): Promise<ClassInfo[]> {
    return await ClassInfoModel.findAll({
      where: { academicYear, isDeleted: false }
    });
  }

  async getClassByClassIdAndYear(classID: number, academicYear: number): Promise<ClassInfo | null> {
    return await ClassInfoModel.findOne({
      where: { classID, academicYear, isDeleted: false }
    });
  }

  async createClass(data: Omit<ClassInfo, 'id' | 'isDeleted' | 'deletedAt'>): Promise<ClassInfo> {
    return await ClassInfoModel.create({
      ...data,
      isDeleted: false
    });
  }

  async updateClass(id: number, data: Partial<Omit<ClassInfo, 'id' | 'isDeleted' | 'deletedAt'>>): Promise<ClassInfo | null> {
    const [affectedRows] = await ClassInfoModel.update(data, {
      where: { id, isDeleted: false }
    });
    if (affectedRows > 0) {
      return await ClassInfoModel.findByPk(id);
    }
    return null;
  }

  async deleteClass(id: number): Promise<boolean> {
    const [affectedRows] = await ClassInfoModel.update(
      { isDeleted: true, deletedAt: new Date() },
      { where: { id, isDeleted: false } }
    );
    return affectedRows > 0;
  }
}

export default new ClassInfoController();
