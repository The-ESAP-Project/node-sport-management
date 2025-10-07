import ExcelJS from 'exceljs';
import { ValidationUtils, CommonUtils } from '../utils/helpers';
import { StudentUploadData, StudentPreviewResponse } from '../types';
import redisService from '../config/redis';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs/promises';

export class ExcelService {
  /**
   * 解析Excel文件中的学生数据
   */
  static async parseStudentExcel(filePath: string): Promise<{
    students: Array<StudentUploadData & { row: number; errors: string[] }>;
    summary: {
      totalRows: number;
      validRows: number;
      errorRows: number;
      className: string;
    };
  }> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('Excel文件中未找到工作表');
      }

      const students: Array<StudentUploadData & { row: number; errors: string[] }> = [];
      let className = '';
      let totalRows = 0;
      let validRows = 0;
      let errorRows = 0;

      // 跳过标题行，从第2行开始读取
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // 跳过标题行

        totalRows++;
        
        const rowData = {
          row: rowNumber,
          StuRegisterNumber: this.getCellValue(row.getCell(1)),
          StuName: this.getCellValue(row.getCell(2)),
          StuGender: this.getCellValue(row.getCell(3)) === '男' ? '1' : '0' as '0' | '1',
          StuNation: parseInt(this.getCellValue(row.getCell(4))) || 1,
          StuBirth: this.getCellValue(row.getCell(5)),
          className: this.getCellValue(row.getCell(6)),
          // 体测数据
          height: this.getNumericCellValue(row.getCell(7)),
          weight: this.getNumericCellValue(row.getCell(8)),
          vitalCapacity: this.getNumericCellValue(row.getCell(9)),
          fiftyRun: this.getNumericCellValue(row.getCell(10)),
          standingLongJump: this.getNumericCellValue(row.getCell(11)),
          sitAndReach: this.getNumericCellValue(row.getCell(12)),
          eightHundredRun: this.getNumericCellValue(row.getCell(13)),
          oneThousandRun: this.getNumericCellValue(row.getCell(14)),
          sitUp: this.getNumericCellValue(row.getCell(15)),
          pullUp: this.getNumericCellValue(row.getCell(16)),
          errors: [] as string[]
        };

        // 验证数据
        this.validateStudentRow(rowData);

        // 设置班级名称（使用第一个有效的班级名称）
        if (rowData.className && !className) {
          className = rowData.className;
        }

        if (rowData.errors.length === 0) {
          validRows++;
        } else {
          errorRows++;
        }

        students.push(rowData);
      });

      return {
        students,
        summary: {
          totalRows,
          validRows,
          errorRows,
          className
        }
      };
    } catch (error: any) {
      logger.error('Parse student excel error:', error);
      throw new Error(`解析Excel文件失败: ${error.message}`);
    }
  }

  /**
   * 预览Excel数据（存储到Redis）
   */
  static async previewExcelData(
    filePath: string,
    userId: number
  ): Promise<StudentPreviewResponse> {
    try {
      const parseResult = await this.parseStudentExcel(filePath);
      const previewId = CommonUtils.generateId();

      // 存储预览数据到Redis（有效期30分钟）
      const previewData = {
        previewId,
        userId,
        filePath,
        summary: parseResult.summary,
        students: parseResult.students,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30分钟后过期
      };

      await redisService.set(
        `excel_preview:${previewId}`,
        JSON.stringify(previewData),
        30 * 60 // 30分钟过期
      );

      // 只返回预览需要的数据（前20行）
      const preview = parseResult.students.slice(0, 20);
      const errors = parseResult.students
        .filter(student => student.errors.length > 0)
        .slice(0, 10) // 只返回前10个错误
        .map(student => ({
          row: student.row,
          errors: student.errors
        }));

      logger.business('Excel preview created', {
        previewId,
        userId,
        fileName: path.basename(filePath),
        totalRows: parseResult.summary.totalRows,
        validRows: parseResult.summary.validRows,
        errorRows: parseResult.summary.errorRows
      });

      return {
        previewId,
        summary: parseResult.summary,
        preview,
        errors
      };
    } catch (error: any) {
      logger.error('Preview excel data error:', error);
      throw new Error(`预览Excel数据失败: ${error.message}`);
    }
  }

  /**
   * 确认导入Excel数据
   */
  static async confirmImportExcelData(previewId: string, userId: number): Promise<{
    success: number;
    failed: Array<{ row: number, data: any, error: string }>;
  }> {
    try {
      const previewDataStr = await redisService.get(`excel_preview:${previewId}`);
      if (!previewDataStr) {
        throw new Error('预览数据已过期或不存在');
      }

      const previewData = JSON.parse(previewDataStr);
      
      // 验证用户权限
      if (previewData.userId !== userId) {
        throw new Error('无权访问此预览数据');
      }

      // 只导入有效数据
      const validStudents = previewData.students.filter((student: any) => student.errors.length === 0);
      
      const results = {
        success: 0,
        failed: [] as Array<{ row: number, data: any, error: string }>
      };

      // 这里应该调用StudentService.batchImportStudents
      // 暂时模拟导入结果
      for (const student of validStudents) {
        try {
          // TODO: 调用实际的导入逻辑
          results.success++;
        } catch (error: any) {
          results.failed.push({
            row: student.row,
            data: student,
            error: error.message
          });
        }
      }

      // 清理Redis中的预览数据
      await redisService.del(`excel_preview:${previewId}`);

      // 清理临时文件
      try {
        await fs.unlink(previewData.filePath);
      } catch (error) {
        logger.warn('Failed to delete temp file:', previewData.filePath);
      }

      logger.business('Excel import confirmed', {
        previewId,
        userId,
        successCount: results.success,
        failedCount: results.failed.length
      });

      return results;
    } catch (error: any) {
      logger.error('Confirm import excel data error:', error);
      throw new Error(`确认导入失败: ${error.message}`);
    }
  }

  /**
   * 导出班级学生数据到Excel
   */
  static async exportClassStudentsToExcel(
    classID: number,
    year: number,
    includeScores: boolean = true
  ): Promise<string> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('学生名单');

      // 设置列标题
      const headers = [
        '学籍号', '姓名', '性别', '民族', '出生日期', '班级'
      ];

      if (includeScores) {
        headers.push(
          '身高(cm)', '体重(kg)', '肺活量(mL)', '50米跑(秒)',
          '立定跳远(cm)', '坐位体前屈(cm)', '800米跑(秒)', '1000米跑(秒)',
          '仰卧起坐(个)', '引体向上(个)', '总分', '班级排名', '年级排名'
        );
      }

      worksheet.addRow(headers);

      // 设置标题行样式
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // TODO: 查询学生数据并添加到worksheet
      // 暂时添加示例数据
      worksheet.addRow([
        '20240001001', '张三', '男', '汉族', '2005-01-01', '高一(1)班',
        ...(includeScores ? [175, 65, 3500, 7.5, 220, 15, 0, 240, 0, 15, 85.5, 1, 5] : [])
      ]);

      // 自动调整列宽
      worksheet.columns.forEach(column => {
        column.width = 15;
      });

      // 生成文件路径
      const fileName = `班级学生名单_${classID}_${year}_${Date.now()}.xlsx`;
      const filePath = path.join(__dirname, '../../temp', fileName);

      // 确保目录存在
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // 保存文件
      await workbook.xlsx.writeFile(filePath);

      logger.business('Excel export completed', {
        classID,
        year,
        includeScores,
        fileName,
        filePath
      });

      return filePath;
    } catch (error: any) {
      logger.error('Export class students to excel error:', error);
      throw new Error(`导出Excel失败: ${error.message}`);
    }
  }

  /**
   * 获取Excel模板
   */
  static async getImportTemplate(): Promise<string> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('学生导入模板');

      // 设置列标题
      const headers = [
        '学籍号*', '姓名*', '性别*', '民族', '出生日期*', '班级名称*',
        '身高(cm)', '体重(kg)', '肺活量(mL)', '50米跑(秒)',
        '立定跳远(cm)', '坐位体前屈(cm)', '800米跑(秒)', '1000米跑(秒)',
        '仰卧起坐(个)', '引体向上(个)'
      ];

      worksheet.addRow(headers);

      // 添加数据验证和说明
      worksheet.addRow([
        '如：20240001001', '如：张三', '0或1（0-女，1-男）', '1（汉族）', 'YYYY-MM-DD', '如：高一(1)班',
        '120-220', '25-200', '500-8000', '5-20',
        '50-350', '-10-35', '120-800', '150-1000',
        '0-100', '0-50'
      ]);

      // 设置标题行样式
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4CAF50' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // 设置说明行样式
      const descRow = worksheet.getRow(2);
      descRow.eachCell((cell) => {
        cell.font = { italic: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF3F3F3' }
        };
      });

      // 自动调整列宽
      worksheet.columns.forEach(column => {
        column.width = 15;
      });

      // 生成文件路径
      const fileName = `学生导入模板_${Date.now()}.xlsx`;
      const filePath = path.join(__dirname, '../../temp', fileName);

      // 确保目录存在
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // 保存文件
      await workbook.xlsx.writeFile(filePath);

      return filePath;
    } catch (error: any) {
      logger.error('Get import template error:', error);
      throw new Error(`生成导入模板失败: ${error.message}`);
    }
  }

  /**
   * 获取单元格值
   */
  private static getCellValue(cell: ExcelJS.Cell): string {
    if (cell.value === null || cell.value === undefined) return '';
    return String(cell.value).trim();
  }

  /**
   * 获取数值类型单元格值
   */
  private static getNumericCellValue(cell: ExcelJS.Cell): number | undefined {
    if (cell.value === null || cell.value === undefined) return undefined;
    const value = Number(cell.value);
    return isNaN(value) ? undefined : value;
  }

  /**
   * 验证学生行数据
   */
  private static validateStudentRow(student: StudentUploadData & { row: number; errors: string[] }): void {
    // 验证必填字段
    if (!student.StuRegisterNumber) {
      student.errors.push('学籍号不能为空');
    } else if (!ValidationUtils.isValidStudentNumber(student.StuRegisterNumber)) {
      student.errors.push('学籍号格式不正确');
    }

    if (!student.StuName) {
      student.errors.push('姓名不能为空');
    }

    if (!student.StuGender) {
      student.errors.push('性别不能为空');
    } else if (!ValidationUtils.isValidGender(student.StuGender)) {
      student.errors.push('性别格式不正确（应为0或1）');
    }

    if (!student.StuBirth) {
      student.errors.push('出生日期不能为空');
    } else if (!ValidationUtils.isValidBirthDate(student.StuBirth)) {
      student.errors.push('出生日期格式不正确');
    }

    if (!student.className) {
      student.errors.push('班级名称不能为空');
    } else if (!ValidationUtils.isValidClassName(student.className)) {
      student.errors.push('班级名称格式不正确');
    }

    // 验证体测数据（如果有值的话）
    if (student.height !== undefined && (student.height < 120 || student.height > 220)) {
      student.errors.push('身高数据超出合理范围(120-220cm)');
    }

    if (student.weight !== undefined && (student.weight < 25 || student.weight > 200)) {
      student.errors.push('体重数据超出合理范围(25-200kg)');
    }

    if (student.vitalCapacity !== undefined && (student.vitalCapacity < 500 || student.vitalCapacity > 8000)) {
      student.errors.push('肺活量数据超出合理范围(500-8000mL)');
    }

    if (student.fiftyRun !== undefined && (student.fiftyRun < 5 || student.fiftyRun > 20)) {
      student.errors.push('50米跑数据超出合理范围(5-20秒)');
    }

    if (student.standingLongJump !== undefined && (student.standingLongJump < 50 || student.standingLongJump > 350)) {
      student.errors.push('立定跳远数据超出合理范围(50-350cm)');
    }

    if (student.sitAndReach !== undefined && (student.sitAndReach < -10 || student.sitAndReach > 35)) {
      student.errors.push('坐位体前屈数据超出合理范围(-10-35cm)');
    }

    if (student.eightHundredRun !== undefined && (student.eightHundredRun < 120 || student.eightHundredRun > 800)) {
      student.errors.push('800米跑数据超出合理范围(120-800秒)');
    }

    if (student.oneThousandRun !== undefined && (student.oneThousandRun < 150 || student.oneThousandRun > 1000)) {
      student.errors.push('1000米跑数据超出合理范围(150-1000秒)');
    }

    if (student.sitUp !== undefined && (student.sitUp < 0 || student.sitUp > 100)) {
      student.errors.push('仰卧起坐数据超出合理范围(0-100个)');
    }

    if (student.pullUp !== undefined && (student.pullUp < 0 || student.pullUp > 50)) {
      student.errors.push('引体向上数据超出合理范围(0-50个)');
    }
  }
}

export default ExcelService;