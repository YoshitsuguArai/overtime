import { SalarySettings, WorkRecord } from '../types';
import { isHoliday } from './holidayUtils';
import { timeStringToMinutes } from './timeCalculations';

interface OvertimePayDetails {
  regularOvertimePay: number; // 通常残業代
  holidayPay: number; // 休日労働手当
  lateNightPay: number; // 深夜労働手当
  totalPay: number; // 総残業代
}

// 時給を計算（基本給から）
export const calculateHourlyWage = (salarySettings: SalarySettings): number => {
  const dailyWage = salarySettings.baseSalary / salarySettings.workingDaysPerMonth;
  const hourlyWage = dailyWage / salarySettings.standardWorkHours;
  return hourlyWage;
};

// 深夜労働時間を計算
const calculateLateNightHours = (
  startTime: string,
  endTime: string,
  lateNightStart: string,
  lateNightEnd: string
): number => {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  const lateNightStartMinutes = timeStringToMinutes(lateNightStart);
  const lateNightEndMinutes = timeStringToMinutes(lateNightEnd);

  let lateNightMinutes = 0;

  // 22:00-05:00の深夜時間帯と重複する時間を計算
  if (endMinutes <= startMinutes) {
    // 日をまたぐ勤務の場合
    // 開始日の22:00以降
    if (startMinutes < lateNightStartMinutes) {
      // 22:00前に開始した場合、22:00からカウント
      lateNightMinutes += (24 * 60) - lateNightStartMinutes;
    } else {
      // 22:00以降に開始した場合
      lateNightMinutes += (24 * 60) - startMinutes;
    }
    
    // 翌日の05:00まで
    if (endMinutes > lateNightEndMinutes) {
      lateNightMinutes += lateNightEndMinutes;
    } else {
      lateNightMinutes += endMinutes;
    }
  } else {
    // 同日内の勤務の場合
    const workStart = Math.max(startMinutes, lateNightStartMinutes);
    const workEnd = Math.min(endMinutes, 24 * 60); // 24:00まで
    
    if (workStart < workEnd) {
      lateNightMinutes += workEnd - workStart;
    }
  }

  return lateNightMinutes / 60; // 時間に変換
};

// 残業代を詳細計算
export const calculateOvertimePayDetails = (
  record: WorkRecord,
  salarySettings: SalarySettings
): OvertimePayDetails => {
  const hourlyWage = calculateHourlyWage(salarySettings);
  const holidayInfo = isHoliday(record.date);
  
  let regularOvertimePay = 0;
  let holidayPay = 0;
  let lateNightPay = 0;

  // 深夜労働時間を計算
  const lateNightHours = record.startTime && record.endTime 
    ? calculateLateNightHours(
        record.startTime,
        record.endTime,
        salarySettings.lateNightStartTime,
        salarySettings.lateNightEndTime
      )
    : 0;

  if (holidayInfo.isHoliday) {
    // 休日労働の場合
    // 休日労働は全時間が割増対象（8時間制限なし）
    holidayPay = record.actualWorkHours * hourlyWage * salarySettings.holidayRate;
    
    // 深夜労働がある場合は追加割増
    if (lateNightHours > 0) {
      lateNightPay = lateNightHours * hourlyWage * salarySettings.lateNightRate;
    }
  } else {
    // 平日の場合
    // 通常の残業代（8時間超過分）
    if (record.overtimeHours > 0) {
      regularOvertimePay = record.overtimeHours * hourlyWage * salarySettings.overtimeRate;
    }
    
    // 深夜労働手当（深夜時間帯の労働に対する追加手当）
    if (lateNightHours > 0) {
      lateNightPay = lateNightHours * hourlyWage * salarySettings.lateNightRate;
    }
  }

  const totalPay = regularOvertimePay + holidayPay + lateNightPay;

  return {
    regularOvertimePay,
    holidayPay,
    lateNightPay,
    totalPay
  };
};

// 基本的な残業代計算（後方互換性のため）
export const calculateOvertimePay = (
  record: WorkRecord,
  salarySettings: SalarySettings
): number => {
  const details = calculateOvertimePayDetails(record, salarySettings);
  return details.totalPay;
};

// 月間給与サマリーを計算
export interface MonthlySalarySummary {
  baseSalary: number;
  totalOvertimePay: number;
  totalHolidayPay: number;
  totalLateNightPay: number;
  totalRegularOvertimePay: number;
  totalSalary: number;
  workingDays: number;
  holidayWorkDays: number;
  totalOvertimeHours: number;
  totalLateNightHours: number;
}

export const calculateMonthlySalarySummary = (
  records: WorkRecord[],
  salarySettings: SalarySettings
): MonthlySalarySummary => {
  let totalOvertimePay = 0;
  let totalHolidayPay = 0;
  let totalLateNightPay = 0;
  let totalRegularOvertimePay = 0;
  let holidayWorkDays = 0;
  let totalOvertimeHours = 0;
  let totalLateNightHours = 0;

  records.forEach(record => {
    const payDetails = calculateOvertimePayDetails(record, salarySettings);
    totalRegularOvertimePay += payDetails.regularOvertimePay;
    totalHolidayPay += payDetails.holidayPay;
    totalLateNightPay += payDetails.lateNightPay;
    totalOvertimePay += payDetails.totalPay;

    if (isHoliday(record.date).isHoliday && record.actualWorkHours > 0) {
      holidayWorkDays++;
    }

    totalOvertimeHours += record.overtimeHours;

    // 深夜労働時間の計算
    if (record.startTime && record.endTime) {
      totalLateNightHours += calculateLateNightHours(
        record.startTime,
        record.endTime,
        salarySettings.lateNightStartTime,
        salarySettings.lateNightEndTime
      );
    }
  });

  const totalSalary = salarySettings.baseSalary + totalOvertimePay;

  return {
    baseSalary: salarySettings.baseSalary,
    totalOvertimePay,
    totalHolidayPay,
    totalLateNightPay,
    totalRegularOvertimePay,
    totalSalary,
    workingDays: records.length,
    holidayWorkDays,
    totalOvertimeHours,
    totalLateNightHours
  };
};

// 金額をフォーマット
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0
  }).format(Math.round(amount));
};