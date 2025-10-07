import Joi from 'joi';

// 通用验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// 评分标准验证
export const evaluationStandardSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'any.required': '标准名称不能为空',
    'string.max': '标准名称长度不能超过100个字符'
  }),
  
  description: Joi.string().max(500).optional().messages({
    'string.max': '标准描述长度不能超过500个字符'
  }),
  
  year: Joi.number().integer().min(2020).max(2030).required().messages({
    'any.required': '年份不能为空',
    'number.min': '年份不能小于2020',
    'number.max': '年份不能大于2030'
  }),
  
  grade_min: Joi.number().integer().min(1).max(12).required().messages({
    'any.required': '最小年级不能为空',
    'number.min': '最小年级不能小于1',
    'number.max': '最小年级不能大于12'
  }),
  
  grade_max: Joi.number().integer().min(1).max(12).required().messages({
    'any.required': '最大年级不能为空',
    'number.min': '最大年级不能小于1',
    'number.max': '最大年级不能大于12'
  }),
  
  gender: Joi.string().valid('0', '1').required().messages({
    'any.required': '性别不能为空',
    'any.only': '性别只能是0（女）或1（男）'
  }),
  
  sport_item: Joi.string().min(1).max(50).required().messages({
    'any.required': '体测项目不能为空',
    'string.max': '体测项目长度不能超过50个字符'
  }),
  
  excellent_min: Joi.number().precision(2).optional(),
  good_min: Joi.number().precision(2).optional(),
  pass_min: Joi.number().precision(2).optional(),
  fail_max: Joi.number().precision(2).optional(),
  
  is_time_based: Joi.boolean().required().messages({
    'any.required': '是否为时间类型不能为空'
  }),
  
  unit: Joi.string().min(1).max(20).required().messages({
    'any.required': '单位不能为空',
    'string.max': '单位长度不能超过20个字符'
  }),
  
  is_active: Joi.boolean().optional()
}).custom((value, helpers) => {
  // 验证年级范围
  if (value.grade_min > value.grade_max) {
    return helpers.error('any.custom', { 
      message: '最小年级不能大于最大年级' 
    });
  }
  
  // 验证评分标准的逻辑性
  const { excellent_min, good_min, pass_min, fail_max, is_time_based } = value;
  
  if (is_time_based) {
    // 时间类型：值越小越好
    if (excellent_min !== undefined && good_min !== undefined && excellent_min >= good_min) {
      return helpers.error('any.custom', { 
        message: '时间类型项目：优秀标准应小于良好标准' 
      });
    }
    if (good_min !== undefined && pass_min !== undefined && good_min >= pass_min) {
      return helpers.error('any.custom', { 
        message: '时间类型项目：良好标准应小于及格标准' 
      });
    }
  } else {
    // 非时间类型：值越大越好
    if (excellent_min !== undefined && good_min !== undefined && excellent_min <= good_min) {
      return helpers.error('any.custom', { 
        message: '非时间类型项目：优秀标准应大于良好标准' 
      });
    }
    if (good_min !== undefined && pass_min !== undefined && good_min <= pass_min) {
      return helpers.error('any.custom', { 
        message: '非时间类型项目：良好标准应大于及格标准' 
      });
    }
  }
  
  return value;
});

/**
 * 验证评分标准数据
 */
export function validateEvaluationStandardData(data: any, isUpdate = false): ValidationResult {
  const schema = isUpdate ? evaluationStandardSchema.fork(
    ['name', 'year', 'grade_min', 'grade_max', 'gender', 'sport_item', 'is_time_based', 'unit'],
    (field) => field.optional()
  ) : evaluationStandardSchema;
  
  const { error } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
}

// 学生数据验证
export const studentSchema = Joi.object({
  StuRegisterNumber: Joi.string().min(1).max(50).required().messages({
    'any.required': '学籍号不能为空',
    'string.max': '学籍号长度不能超过50个字符'
  }),
  
  StuName: Joi.string().min(1).max(50).required().messages({
    'any.required': '学生姓名不能为空',
    'string.max': '学生姓名长度不能超过50个字符'
  }),
  
  StuGender: Joi.string().valid('0', '1').required().messages({
    'any.required': '性别不能为空',
    'any.only': '性别只能是0（女）或1（男）'
  }),
  
  StuNation: Joi.string().max(20).optional().messages({
    'string.max': '民族长度不能超过20个字符'
  }),
  
  StuBirth: Joi.date().required().messages({
    'any.required': '出生日期不能为空'
  }),
  
  ClassID: Joi.number().integer().min(1).required().messages({
    'any.required': '班级ID不能为空'
  })
});

/**
 * 验证学生数据
 */
export function validateStudentData(data: any, isUpdate = false): ValidationResult {
  const schema = isUpdate ? studentSchema.fork(
    ['StuRegisterNumber', 'StuName', 'StuGender', 'StuBirth', 'ClassID'],
    (field) => field.optional()
  ) : studentSchema;
  
  const { error } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
}

// 体测数据验证
export const sportDataSchema = Joi.object({
  StudentID: Joi.number().integer().min(1).required(),
  
  Year: Joi.number().integer().min(2020).max(2030).required(),
  
  Height: Joi.number().precision(1).min(50).max(250).optional(),
  Weight: Joi.number().precision(1).min(20).max(200).optional(),
  BMI: Joi.number().precision(2).min(10).max(50).optional(),
  Eyesight_L: Joi.number().precision(1).min(0).max(10).optional(),
  Eyesight_R: Joi.number().precision(1).min(0).max(10).optional(),
  VitalCapacity: Joi.number().integer().min(500).max(8000).optional(),
  Flexibility: Joi.number().precision(1).min(-50).max(50).optional(),
  FiftyMeterRun: Joi.number().precision(2).min(5).max(15).optional(),
  EightHundredRun: Joi.string().pattern(/^\d{1,2}:\d{2}$/).optional(),
  
  TotalScore: Joi.number().precision(1).min(0).max(100).optional(),
  ClassRank: Joi.number().integer().min(1).optional(),
  GradeRank: Joi.number().integer().min(1).optional()
});

/**
 * 验证体测数据
 */
export function validateSportData(data: any): ValidationResult {
  const { error } = sportDataSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
}

// 班级数据验证
export const classSchema = Joi.object({
  ClassName: Joi.string().min(1).max(50).required().messages({
    'any.required': '班级名称不能为空',
    'string.max': '班级名称长度不能超过50个字符'
  }),
  
  Grade: Joi.number().integer().min(1).max(12).required().messages({
    'any.required': '年级不能为空',
    'number.min': '年级不能小于1',
    'number.max': '年级不能大于12'
  }),
  
  AcademicYear: Joi.string().pattern(/^\d{4}-\d{4}$/).required().messages({
    'any.required': '学年不能为空',
    'string.pattern.base': '学年格式应为YYYY-YYYY'
  }),
  
  TeacherName: Joi.string().max(50).optional().messages({
    'string.max': '教师姓名长度不能超过50个字符'
  }),
  
  Description: Joi.string().max(200).optional().messages({
    'string.max': '班级描述长度不能超过200个字符'
  })
});

/**
 * 验证班级数据
 */
export function validateClassData(data: any, isUpdate = false): ValidationResult {
  const schema = isUpdate ? classSchema.fork(
    ['ClassName', 'Grade', 'AcademicYear'],
    (field) => field.optional()
  ) : classSchema;
  
  const { error } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
}