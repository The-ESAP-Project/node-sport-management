<template>
  <div class="w-full p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">成绩导入</h1>
          <p class="text-gray-600 mt-1">批量导入学生体测成绩数据</p>
        </div>
        <el-button @click="$router.back()">
          <el-icon class="mr-1"><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <!-- 导入步骤 -->
    <el-steps :active="currentStep" class="mb-8">
      <el-step title="下载模板" description="下载Excel导入模板" />
      <el-step title="上传文件" description="选择并上传Excel文件" />
      <el-step title="预览数据" description="检查导入数据" />
      <el-step title="确认导入" description="完成数据导入" />
    </el-steps>

    <!-- 步骤1: 下载模板 -->
    <el-card v-if="currentStep === 0" class="mb-6">
      <template #header>
        <span>第一步：下载导入模板</span>
      </template>
      
      <div class="space-y-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-blue-800 mb-2">
            <el-icon class="mr-2"><InfoFilled /></el-icon>
            导入说明
          </h3>
          <ul class="text-blue-700 space-y-1">
            <li>• 请使用Excel格式文件(.xlsx或.xls)进行导入</li>
            <li>• 模板包含所有必要的列，请不要删除或修改列标题</li>
            <li>• 必填字段：姓名、性别、班级、年级</li>
            <li>• 成绩字段为可选，可以只导入学生信息，后续单独录入成绩</li>
            <li>• 性别请填写"男"或"女"</li>
            <li>• 长跑成绩请填写秒数，如"3分25秒"填写为"205"</li>
          </ul>
        </div>

        <!-- 模板预览 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">模板格式预览</h3>
          <el-table :data="templateData" border size="small" class="mb-4">
            <el-table-column prop="name" label="姓名*" width="100" />
            <el-table-column prop="gender" label="性别*" width="80" />
            <el-table-column prop="className" label="班级*" width="120" />
            <el-table-column prop="grade" label="年级*" width="100" />
            <el-table-column prop="height" label="身高(cm)" width="100" />
            <el-table-column prop="weight" label="体重(kg)" width="100" />
            <el-table-column prop="vitalCapacity" label="肺活量(ml)" width="120" />
            <el-table-column prop="run50m" label="50米跑(秒)" width="120" />
            <el-table-column prop="longJump" label="立定跳远(cm)" width="140" />
            <el-table-column prop="sitAndReach" label="坐位体前屈(cm)" width="150" />
            <el-table-column prop="longRun" label="长跑(秒)" width="100" />
            <el-table-column prop="strengthTest" label="力量测试" width="120" />
          </el-table>
          <div class="text-sm text-gray-500">
            * 表示必填字段
          </div>
        </div>

        <!-- 下载按钮 -->
        <div class="text-center">
          <el-button type="primary" size="large" @click="downloadTemplate">
            <el-icon class="mr-2"><Download /></el-icon>
            下载导入模板
          </el-button>
          <div class="mt-2 text-sm text-gray-500">
            下载模板后请按照格式填写数据
          </div>
        </div>

        <!-- 下一步按钮 -->
        <div class="text-center pt-4 border-t">
          <el-button type="primary" @click="nextStep">
            下一步：上传文件
            <el-icon class="ml-2"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤2: 上传文件 -->
    <el-card v-if="currentStep === 1" class="mb-6">
      <template #header>
        <span>第二步：上传Excel文件</span>
      </template>
      
      <div class="space-y-6">
        <!-- 文件上传 -->
        <div class="text-center">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx,.xls"
            :on-change="handleFileChange"
            :limit="1"
          >
            <div class="py-12">
              <el-icon class="text-6xl text-gray-400 mb-4"><UploadFilled /></el-icon>
              <div class="text-lg text-gray-600 mb-2">将文件拖到此处，或点击上传</div>
              <div class="text-sm text-gray-400">
                只能上传Excel文件，且不超过5MB
              </div>
            </div>
          </el-upload>
        </div>

        <!-- 已选择的文件 -->
        <div v-if="selectedFile" class="bg-gray-50 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <el-icon class="text-green-600 mr-2"><Document /></el-icon>
              <span class="font-medium">{{ selectedFile.name }}</span>
              <span class="text-gray-500 ml-2">({{ formatFileSize(selectedFile.size) }})</span>
            </div>
            <el-button type="danger" size="small" @click="removeFile">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="flex justify-center gap-4 pt-4 border-t">
          <el-button @click="prevStep">
            <el-icon class="mr-1"><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <el-button 
            type="primary" 
            :disabled="!selectedFile" 
            @click="previewData_"
            :loading="previewing"
          >
            预览数据
            <el-icon class="ml-2"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤3: 预览数据 -->
    <el-card v-if="currentStep === 2" class="mb-6">
      <template #header>
        <span>第三步：预览导入数据</span>
      </template>
      
      <div class="space-y-6">
        <!-- 预览统计 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-blue-600 text-sm">总行数</div>
            <div class="text-2xl font-bold text-blue-800">{{ previewSummary.totalRows }}</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg text-center">
            <div class="text-green-600 text-sm">有效数据</div>
            <div class="text-2xl font-bold text-green-800">{{ previewSummary.validRows }}</div>
          </div>
          <div class="bg-red-50 p-4 rounded-lg text-center">
            <div class="text-red-600 text-sm">错误数据</div>
            <div class="text-2xl font-bold text-red-800">{{ previewSummary.errorRows }}</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg text-center">
            <div class="text-purple-600 text-sm">目标班级</div>
            <div class="text-lg font-bold text-purple-800">{{ previewSummary.className || '混合' }}</div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="previewData.errors.length > 0" class="bg-red-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-red-800 mb-2">
            <el-icon class="mr-2"><WarningFilled /></el-icon>
            数据错误 ({{ previewData.errors.length }}条)
          </h3>
          <div class="max-h-32 overflow-y-auto">
            <div v-for="error in previewData.errors" :key="error.row" class="text-red-700 text-sm mb-1">
              第{{ error.row }}行: {{ error.errors.join(', ') }}
            </div>
          </div>
        </div>

        <!-- 数据预览表格 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">数据预览 (前10条)</h3>
          <el-table 
            :data="previewData.preview.slice(0, 10)" 
            border 
            size="small"
            :row-class-name="getRowClassName"
          >
            <el-table-column prop="row" label="行号" width="80" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="gender" label="性别" width="80" />
            <el-table-column prop="className" label="班级" width="120" />
            <el-table-column prop="grade" label="年级" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.errors.length > 0 ? 'danger' : 'success'" size="small">
                  {{ row.errors.length > 0 ? '错误' : '正常' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="错误信息" min-width="200">
              <template #default="{ row }">
                <div v-if="row.errors.length > 0" class="text-red-600 text-sm">
                  {{ row.errors.join(', ') }}
                </div>
                <div v-else class="text-green-600 text-sm">无错误</div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 导航按钮 -->
        <div class="flex justify-center gap-4 pt-4 border-t">
          <el-button @click="prevStep">
            <el-icon class="mr-1"><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <el-button 
            type="primary" 
            :disabled="previewSummary.validRows === 0"
            @click="nextStep"
          >
            确认导入
            <el-icon class="ml-2"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤4: 确认导入 -->
    <el-card v-if="currentStep === 3" class="mb-6">
      <template #header>
        <span>第四步：确认导入</span>
      </template>
      
      <div class="space-y-6">
        <!-- 导入配置 -->
        <div class="bg-yellow-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-yellow-800 mb-2">
            <el-icon class="mr-2"><WarningFilled /></el-icon>
            导入确认
          </h3>
          <div class="text-yellow-700 space-y-2">
            <div>即将导入 <strong>{{ previewSummary.validRows }}</strong> 条有效数据</div>
            <div v-if="previewSummary.errorRows > 0">
              将跳过 <strong>{{ previewSummary.errorRows }}</strong> 条错误数据
            </div>
            <div class="text-sm mt-2">
              导入后可能需要重新计算成绩排名，建议在导入完成后执行重新计算操作。
            </div>
          </div>
        </div>

        <!-- 导入选项 -->
        <el-form :model="importOptions" label-width="120px">
          <el-form-item label="导入模式">
            <el-radio-group v-model="importOptions.mode">
              <el-radio value="insert">仅插入新数据</el-radio>
              <el-radio value="update">更新现有数据</el-radio>
              <el-radio value="replace">替换全部数据</el-radio>
            </el-radio-group>
            <div class="text-sm text-gray-500 mt-1">
              <div v-if="importOptions.mode === 'insert'">只添加新学生，不更新已存在的学生信息</div>
              <div v-if="importOptions.mode === 'update'">更新已存在学生的信息，不添加新学生</div>
              <div v-if="importOptions.mode === 'replace'">完全替换当前班级的所有学生数据</div>
            </div>
          </el-form-item>

          <el-form-item label="自动计算成绩">
            <el-checkbox v-model="importOptions.autoCalculate">
              导入完成后自动重新计算成绩
            </el-checkbox>
          </el-form-item>
        </el-form>

        <!-- 导入进度 -->
        <div v-if="importing" class="bg-blue-50 p-4 rounded-lg">
          <div class="flex items-center mb-2">
            <el-icon class="animate-spin mr-2"><Loading /></el-icon>
            <span class="font-medium">正在导入数据...</span>
          </div>
          <el-progress 
            :percentage="importProgress" 
            :show-text="false"
            class="mb-2"
          />
          <div class="text-sm text-gray-600">
            已处理 {{ importResult.processed }} / {{ previewSummary.validRows }} 条数据
          </div>
        </div>

        <!-- 导入结果 -->
        <div v-if="importResult.completed" class="bg-green-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-green-800 mb-2">
            <el-icon class="mr-2"><SuccessFilled /></el-icon>
            导入完成
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">成功导入：</span>
              <span class="font-bold text-green-700">{{ importResult.success }}</span> 条
            </div>
            <div>
              <span class="text-gray-600">导入失败：</span>
              <span class="font-bold text-red-700">{{ importResult.failed }}</span> 条
            </div>
            <div>
              <span class="text-gray-600">总耗时：</span>
              <span class="font-bold">{{ importResult.duration }}秒</span>
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="flex justify-center gap-4 pt-4 border-t">
          <el-button 
            @click="prevStep" 
            :disabled="importing || importResult.completed"
          >
            <el-icon class="mr-1"><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <el-button 
            v-if="!importResult.completed"
            type="primary" 
            @click="confirmImport"
            :loading="importing"
          >
            开始导入
          </el-button>
          <el-button 
            v-if="importResult.completed"
            type="success" 
            @click="goToScoreList"
          >
            查看成绩列表
            <el-icon class="ml-2"><View /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  Download,
  UploadFilled,
  Document,
  Delete,
  InfoFilled,
  WarningFilled,
  SuccessFilled,
  Loading,
  View
} from '@element-plus/icons-vue'
import { scoreApi } from '@/api/score'
import * as XLSX from 'xlsx'

const router = useRouter()

// 响应式数据
const currentStep = ref(0)
const selectedFile = ref<File | null>(null)
const previewing = ref(false)
const importing = ref(false)
const uploadRef = ref()

// 预览数据
const previewData = reactive({
  previewId: '',
  preview: [] as any[],
  errors: [] as Array<{ row: number; errors: string[] }>
})

const previewSummary = reactive({
  totalRows: 0,
  validRows: 0,
  errorRows: 0,
  className: ''
})

// 导入选项
const importOptions = reactive({
  mode: 'insert' as 'insert' | 'update' | 'replace',
  autoCalculate: true
})

// 导入结果
const importResult = reactive({
  completed: false,
  success: 0,
  failed: 0,
  processed: 0,
  duration: 0,
  startTime: 0
})

// 计算属性
const importProgress = computed(() => {
  if (previewSummary.validRows === 0) return 0
  return Math.round((importResult.processed / previewSummary.validRows) * 100)
})

// 模板数据
const templateData = [
  {
    name: '张三',
    gender: '男',
    className: '高一A班',
    grade: '高一',
    height: 175.5,
    weight: 65.2,
    vitalCapacity: 3200,
    run50m: 7.85,
    longJump: 245,
    sitAndReach: 12.5,
    longRun: 205,
    strengthTest: 8
  },
  {
    name: '李四',
    gender: '女',
    className: '高一A班',
    grade: '高一',
    height: 162.0,
    weight: 50.5,
    vitalCapacity: 2800,
    run50m: 8.92,
    longJump: 190,
    sitAndReach: 15.2,
    longRun: 245,
    strengthTest: 35
  }
]

// 步骤导航
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下载模板
const downloadTemplate = () => {
  const ws = XLSX.utils.json_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '成绩导入模板')
  
  // 设置列宽
  const colWidths = [
    { wch: 10 }, // 姓名
    { wch: 8 },  // 性别
    { wch: 15 }, // 班级
    { wch: 10 }, // 年级
    { wch: 12 }, // 身高
    { wch: 12 }, // 体重
    { wch: 15 }, // 肺活量
    { wch: 15 }, // 50米跑
    { wch: 18 }, // 立定跳远
    { wch: 18 }, // 坐位体前屈
    { wch: 12 }, // 长跑
    { wch: 15 }  // 力量测试
  ]
  ws['!cols'] = colWidths
  
  XLSX.writeFile(wb, `体测成绩导入模板_${new Date().toLocaleDateString()}.xlsx`)
  ElMessage.success('模板下载成功')
}

// 文件处理
const handleFileChange = (file: any) => {
  const rawFile = file.raw
  if (rawFile.size > 5 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过5MB')
    return false
  }
  selectedFile.value = rawFile
  return true
}

const removeFile = () => {
  selectedFile.value = null
  uploadRef.value?.clearFiles()
}

const formatFileSize = (size: number): string => {
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB'
  return (size / (1024 * 1024)).toFixed(1) + 'MB'
}

// 预览数据
const previewData_ = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请先选择文件')
    return
  }

  previewing.value = true
  try {
    // 读取Excel文件
    const data = await readExcelFile(selectedFile.value)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 生成预览数据
    generatePreviewData(data)
    
    nextStep()
  } catch (error) {
    console.error('预览失败:', error)
    ElMessage.error('预览失败，请检查文件格式')
  } finally {
    previewing.value = false
  }
}

// 读取Excel文件
const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        resolve(jsonData as any[])
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// 生成预览数据
const generatePreviewData = (rawData: any[]) => {
  const headers = rawData[0] || []
  const rows = rawData.slice(1)
  
  const preview: any[] = []
  const errors: Array<{ row: number; errors: string[] }> = []
  
  let validCount = 0
  let className = ''
  
  rows.forEach((row, index) => {
    const rowIndex = index + 2 // Excel行号从2开始（去掉标题行）
    const rowErrors: string[] = []
    
    const student = {
      row: rowIndex,
      name: row[0] || '',
      gender: row[1] || '',
      className: row[2] || '',
      grade: row[3] || '',
      height: row[4],
      weight: row[5],
      vitalCapacity: row[6],
      run50m: row[7],
      longJump: row[8],
      sitAndReach: row[9],
      longRun: row[10],
      strengthTest: row[11],
      errors: rowErrors
    }
    
    // 验证必填字段
    if (!student.name) rowErrors.push('姓名不能为空')
    if (!student.gender || !['男', '女'].includes(student.gender)) {
      rowErrors.push('性别必须为"男"或"女"')
    }
    if (!student.className) rowErrors.push('班级不能为空')
    if (!student.grade) rowErrors.push('年级不能为空')
    
    // 验证数据格式
    if (student.height && (student.height < 100 || student.height > 250)) {
      rowErrors.push('身高应在100-250cm之间')
    }
    if (student.weight && (student.weight < 20 || student.weight > 200)) {
      rowErrors.push('体重应在20-200kg之间')
    }
    
    preview.push(student)
    
    if (rowErrors.length === 0) {
      validCount++
      if (!className && student.className) {
        className = student.className
      }
    } else {
      errors.push({ row: rowIndex, errors: rowErrors })
    }
  })
  
  // 更新预览数据
  previewData.preview = preview
  previewData.errors = errors
  
  previewSummary.totalRows = rows.length
  previewSummary.validRows = validCount
  previewSummary.errorRows = errors.length
  previewSummary.className = className
}

const getRowClassName = ({ row }: { row: any }) => {
  return row.errors.length > 0 ? 'error-row' : ''
}

// 确认导入
const confirmImport = async () => {
  importing.value = true
  importResult.startTime = Date.now()
  importResult.completed = false
  importResult.success = 0
  importResult.failed = 0
  importResult.processed = 0
  
  try {
    // 模拟批量导入过程
    const validData = previewData.preview.filter(item => item.errors.length === 0)
    
    for (let i = 0; i < validData.length; i++) {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      
      try {
        // 这里应该调用实际的API
        // await scoreApi.importScores(...)
        importResult.success++
      } catch (error) {
        importResult.failed++
      }
      
      importResult.processed++
    }
    
    importResult.completed = true
    importResult.duration = Math.round((Date.now() - importResult.startTime) / 1000)
    
    ElMessage.success(`导入完成！成功 ${importResult.success} 条，失败 ${importResult.failed} 条`)
    
    // 如果启用自动计算，执行重新计算
    if (importOptions.autoCalculate && importResult.success > 0) {
      ElMessage.info('正在重新计算成绩...')
      try {
        await scoreApi.recalculateScores({ className: previewSummary.className })
        ElMessage.success('成绩重新计算完成')
      } catch (error) {
        ElMessage.warning('重新计算成绩失败，请手动执行')
      }
    }
    
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入过程中发生错误')
  } finally {
    importing.value = false
  }
}

// 跳转到成绩列表
const goToScoreList = () => {
  router.push('/scores/list')
}
</script>

<style scoped>
.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload) {
  width: 100%;
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.error-row) {
  background-color: #fef0f0;
}

:deep(.error-row td) {
  background-color: #fef0f0 !important;
}
</style>