// 模型导入和导出
import User from './User';
import ClassInfo from './ClassInfo';
import Student from './Student';
import SportData from './SportData';
import Standard from './Standard';
import StandardRule from './StandardRule';
import EvaluationStandard from './EvaluationStandard';
import SystemConfig from './SystemConfig';

// 导出所有模型
export {
  User,
  ClassInfo,
  Student,
  SportData,
  Standard,
  StandardRule,
  EvaluationStandard,
  SystemConfig
};

// 初始化所有模型关联关系的函数
export const initializeAssociations = () => {
  // 关联关系已在各模型文件中定义
  
  // ClassInfo 和 Student 的关联
  // Student.belongsTo(ClassInfo, { foreignKey: 'classID', targetKey: 'classID' });
  // ClassInfo.hasMany(Student, { foreignKey: 'classID', sourceKey: 'classID' });
  
  // Student 和 SportData 的关联
  // SportData.belongsTo(Student, { foreignKey: 'studentID' });
  // Student.hasMany(SportData, { foreignKey: 'studentID' });
  
  // ClassInfo 和 SportData 的关联
  // SportData.belongsTo(ClassInfo, { foreignKey: 'classID', targetKey: 'classID' });
  // ClassInfo.hasMany(SportData, { foreignKey: 'classID', sourceKey: 'classID' });
  
  // Standard 和 StandardRule 的关联
  // StandardRule.belongsTo(Standard, { foreignKey: 'standard_id' });
  // Standard.hasMany(StandardRule, { foreignKey: 'standard_id' });
  
  console.log('Model associations initialized');
};

// 默认导出所有模型
export default {
  User,
  ClassInfo,
  Student,
  SportData,
  Standard,
  StandardRule,
  EvaluationStandard,
  SystemConfig,
  initializeAssociations
};