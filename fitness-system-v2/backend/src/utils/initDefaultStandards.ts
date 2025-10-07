import EvaluationStandardService from '../services/evaluationStandardService';
import logger from '../utils/logger';

/**
 * 初始化默认评分标准
 */
export async function initializeDefaultStandards(): Promise<void> {
  try {
    logger.info('开始初始化默认评分标准...');
    
    // 2024年评分标准 - 小学1-6年级
    const primaryStandards = [
      // 身高体重 - 男
      {
        name: '2024年小学生身高标准(男)',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '1' as '1',
        sport_item: 'Height',
        excellent_min: 130,
        good_min: 125,
        pass_min: 120,
        is_time_based: false,
        unit: 'cm',
        is_active: true
      },
      // 身高体重 - 女
      {
        name: '2024年小学生身高标准(女)',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '0' as '0',
        sport_item: 'Height',
        excellent_min: 128,
        good_min: 123,
        pass_min: 118,
        is_time_based: false,
        unit: 'cm',
        is_active: true
      },
      // 体重 - 男
      {
        name: '2024年小学生体重标准(男)',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '1' as '1',
        sport_item: 'Weight',
        excellent_min: 35,
        good_min: 30,
        pass_min: 25,
        is_time_based: false,
        unit: 'kg',
        is_active: true
      },
      // 体重 - 女
      {
        name: '2024年小学生体重标准(女)',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '0' as '0',
        sport_item: 'Weight',
        excellent_min: 32,
        good_min: 28,
        pass_min: 24,
        is_time_based: false,
        unit: 'kg',
        is_active: true
      },
      // 肺活量 - 男
      {
        name: '2024年小学生肺活量标准(男)',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '1' as '1',
        sport_item: 'VitalCapacity',
        excellent_min: 2000,
        good_min: 1800,
        pass_min: 1500,
        is_time_based: false,
        unit: 'ml',
        is_active: true
      },
      // 肺活量 - 女
      {
        name: '2024年小学生肺活量标准(女)',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '0' as '0',
        sport_item: 'VitalCapacity',
        excellent_min: 1800,
        good_min: 1600,
        pass_min: 1400,
        is_time_based: false,
        unit: 'ml',
        is_active: true
      },
      // 50米跑 - 男（时间类型，越小越好）
      {
        name: '2024年小学生50米跑标准(男)',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '1' as '1',
        sport_item: 'FiftyMeterRun',
        excellent_min: 8.5,
        good_min: 9.0,
        pass_min: 9.5,
        is_time_based: true,
        unit: '秒',
        is_active: true
      },
      // 50米跑 - 女（时间类型，越小越好）
      {
        name: '2024年小学生50米跑标准(女)',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '0' as '0',
        sport_item: 'FiftyMeterRun',
        excellent_min: 9.0,
        good_min: 9.5,
        pass_min: 10.0,
        is_time_based: true,
        unit: '秒',
        is_active: true
      },
      // 坐位体前屈 - 男
      {
        name: '2024年小学生坐位体前屈标准(男)',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '1' as '1',
        sport_item: 'Flexibility',
        excellent_min: 15,
        good_min: 12,
        pass_min: 8,
        is_time_based: false,
        unit: 'cm',
        is_active: true
      },
      // 坐位体前屈 - 女
      {
        name: '2024年小学生坐位体前屈标准(女)',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '0' as '0',
        sport_item: 'Flexibility',
        excellent_min: 18,
        good_min: 15,
        pass_min: 12,
        is_time_based: false,
        unit: 'cm',
        is_active: true
      },
      // 左眼视力
      {
        name: '2024年小学生左眼视力标准',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '0' as '0',
        sport_item: 'Eyesight_L',
        excellent_min: 5.0,
        good_min: 4.8,
        pass_min: 4.6,
        is_time_based: false,
        unit: '',        is_active: true
      },
      {
        name: '2024年小学生左眼视力标准',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '1' as '1',
        sport_item: 'Eyesight_L',
        excellent_min: 5.0,
        good_min: 4.8,
        pass_min: 4.6,
        is_time_based: false,
        unit: '',        is_active: true
      },
      // 右眼视力
      {
        name: '2024年小学生右眼视力标准',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '0' as '0',
        sport_item: 'Eyesight_R',
        excellent_min: 5.0,
        good_min: 4.8,
        pass_min: 4.6,
        is_time_based: false,
        unit: '',        is_active: true
      },
      {
        name: '2024年小学生右眼视力标准',
        year: 2024,
        grade_min: 1,
        grade_max: 6,
        gender: '1' as '1',
        sport_item: 'Eyesight_R',
        excellent_min: 5.0,
        good_min: 4.8,
        pass_min: 4.6,
        is_time_based: false,
        unit: '',        is_active: true
      }
    ];

    // 2024年评分标准 - 初中7-9年级
    const middleStandards = [
      // 800米跑 - 女（时间类型，越小越好）
      {
        name: '2024年初中生800米跑标准(女)',
        year: 2024,
        grade_min: 7,
        grade_max: 9,
        gender: '0' as '0',
        sport_item: 'EightHundredRun',
        excellent_min: 240, // 4:00
        good_min: 270,     // 4:30
        pass_min: 300,     // 5:00
        is_time_based: true,
        unit: '秒',
        is_active: true
      },
      // 1000米跑 - 男（使用800米跑字段）
      {
        name: '2024年初中生1000米跑标准(男)',
        year: 2024,
        grade_min: 7,
        grade_max: 9,
        gender: '1' as '1',
        sport_item: 'EightHundredRun',
        excellent_min: 210, // 3:30
        good_min: 240,     // 4:00
        pass_min: 270,     // 4:30
        is_time_based: true,
        unit: '秒',
        is_active: true
      },
      // 50米跑 - 男
      {
        name: '2024年初中生50米跑标准(男)',
        year: 2024,
        grade_min: 7,
        grade_max: 9,
        gender: '1' as '1',
        sport_item: 'FiftyMeterRun',
        excellent_min: 7.5,
        good_min: 8.0,
        pass_min: 8.5,
        is_time_based: true,
        unit: '秒',
        is_active: true
      },
      // 50米跑 - 女
      {
        name: '2024年初中生50米跑标准(女)',
        year: 2024,
        grade_min: 7,
        grade_max: 9,
        gender: '0' as '0',
        sport_item: 'FiftyMeterRun',
        excellent_min: 8.0,
        good_min: 8.5,
        pass_min: 9.0,
        is_time_based: true,
        unit: '秒',
        is_active: true
      },
      // 肺活量 - 男
      {
        name: '2024年初中生肺活量标准(男)',
        year: 2024,
        grade_min: 7,
        grade_max: 9,
        gender: '1' as '1',
        sport_item: 'VitalCapacity',
        excellent_min: 3500,
        good_min: 3200,
        pass_min: 2800,
        is_time_based: false,
        unit: 'ml',
        is_active: true
      },
      // 肺活量 - 女
      {
        name: '2024年初中生肺活量标准(女)',
        year: 2024,
        grade_min: 7,
        grade_max: 9,
        gender: '0' as '0',
        sport_item: 'VitalCapacity',
        excellent_min: 2800,
        good_min: 2500,
        pass_min: 2200,
        is_time_based: false,
        unit: 'ml',
        is_active: true
      },
      // 坐位体前屈 - 男
      {
        name: '2024年初中生坐位体前屈标准(男)',
        year: 2024,
        grade_min: 7,
        grade_max: 9,
        gender: '1' as '1',
        sport_item: 'Flexibility',
        excellent_min: 18,
        good_min: 15,
        pass_min: 12,
        is_time_based: false,
        unit: 'cm',
        is_active: true
      },
      // 坐位体前屈 - 女
      {
        name: '2024年初中生坐位体前屈标准(女)',
        year: 2024,
        grade_min: 7,
        grade_max: 9,
        gender: '0' as '0',
        sport_item: 'Flexibility',
        excellent_min: 20,
        good_min: 17,
        pass_min: 14,
        is_time_based: false,
        unit: 'cm',
        is_active: true
      }
    ];

    // 合并所有标准
    const allStandards = [...primaryStandards, ...middleStandards];

    // 批量创建评分标准
    await EvaluationStandardService.batchCreateStandards(allStandards);
    
    logger.info(`成功初始化 ${allStandards.length} 个默认评分标准`);
    
  } catch (error) {
    logger.error('初始化默认评分标准失败:', error);
    // 不抛出错误，只记录日志，避免影响应用启动
  }
}