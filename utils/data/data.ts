// 主要导出文件，提供所有体测相关的类和函数

// 导出主要的数据处理类
export { StudentData, GradeData } from "./index";

// 导出所有计算函数
export { calculateEnduranceRunScore } from "./enduranceRun";
export { calculateRunning50mScore } from "./shortDistanceRunning";
export { calculateSitAndReachScore } from "./sitAndReach";
export { calculateStandingLongJumpScore } from "./standingLongJump";
export { calculateVitalCapacityScore } from "./vitalCapacity";
export { calculateSitUpAndPullUpScore } from "./sitUpAndPullUp";

// 导出所有类型定义
export * from "./types";

// 默认导出
export default {
  StudentData: require("./index").StudentData,
  GradeData: require("./index").GradeData,
  calculateEnduranceRunScore:
    require("./enduranceRun").calculateEnduranceRunScore,
  calculateRunning50mScore: require("./shortDistanceRunning")
    .calculateRunning50mScore,
  calculateSitAndReachScore: require("./sitAndReach").calculateSitAndReachScore,
  calculateStandingLongJumpScore:
    require("./standingLongJump").calculateStandingLongJumpScore,
  calculateVitalCapacityScore:
    require("./vitalCapacity").calculateVitalCapacityScore,
  calculateSitUpAndPullUpScore:
    require("./sitUpAndPullUp").calculateSitUpAndPullUpScore,
};
