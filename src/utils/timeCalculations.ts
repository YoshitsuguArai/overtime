import { OvertimeSettings } from '../types';

export const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const calculateWorkTime = (startTime: string, endTime: string, breakTime: number): number => {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  const workMinutes = endMinutes - startMinutes - breakTime;
  return workMinutes;
};

export const calculateWorkTimeDetails = (
  startTime: string,
  endTime: string,
  settings: OvertimeSettings
): {
  actualWorkHours: number;
  overtimeHours: number;
  shortageHours: number;
} => {
  const workMinutes = calculateWorkTime(startTime, endTime, settings.breakTime);
  const actualWorkHours = workMinutes / 60;
  const standardHours = settings.standardWorkHours;
  
  const difference = actualWorkHours - standardHours;
  
  if (difference >= 0) {
    // 所定時間以上働いた場合
    return {
      actualWorkHours,
      overtimeHours: difference,
      shortageHours: 0
    };
  } else {
    // 所定時間に満たない場合
    return {
      actualWorkHours,
      overtimeHours: 0,
      shortageHours: Math.abs(difference)
    };
  }
};

// 後方互換性のため残す
export const calculateOvertimeHours = (
  startTime: string,
  endTime: string,
  settings: OvertimeSettings
): number => {
  const details = calculateWorkTimeDetails(startTime, endTime, settings);
  return details.overtimeHours - details.shortageHours;
};

export const formatOvertimeDisplay = (overtimeHours: number): string => {
  const hours = Math.floor(Math.abs(overtimeHours));
  const minutes = Math.round((Math.abs(overtimeHours) - hours) * 60);
  return `${hours}時間${minutes.toString().padStart(2, '0')}分`;
};

export const formatShortageDisplay = (shortageHours: number): string => {
  const hours = Math.floor(shortageHours);
  const minutes = Math.round((shortageHours - hours) * 60);
  return `${hours}時間${minutes.toString().padStart(2, '0')}分`;
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * 日本の祝日を取得する
 * @param year 年
 * @returns 祝日の配列
 */
const getJapaneseHolidays = (year: number): Date[] => {
  const holidays: Date[] = [];

  // 固定祝日
  holidays.push(new Date(year, 0, 1));   // 元日
  holidays.push(new Date(year, 1, 11));  // 建国記念の日
  holidays.push(new Date(year, 3, 29));  // 昭和の日
  holidays.push(new Date(year, 4, 3));   // 憲法記念日
  holidays.push(new Date(year, 4, 4));   // みどりの日
  holidays.push(new Date(year, 4, 5));   // こどもの日
  holidays.push(new Date(year, 7, 11));  // 山の日
  holidays.push(new Date(year, 10, 3));  // 文化の日
  holidays.push(new Date(year, 10, 23)); // 勤労感謝の日

  // 成人の日（1月第2月曜日）
  const jan1 = new Date(year, 0, 1);
  const firstMonday = 1 + (8 - jan1.getDay()) % 7;
  holidays.push(new Date(year, 0, firstMonday + 7));

  // 海の日（7月第3月曜日）
  const jul1 = new Date(year, 6, 1);
  const julFirstMonday = 1 + (8 - jul1.getDay()) % 7;
  holidays.push(new Date(year, 6, julFirstMonday + 14));

  // 敬老の日（9月第3月曜日）
  const sep1 = new Date(year, 8, 1);
  const sepFirstMonday = 1 + (8 - sep1.getDay()) % 7;
  holidays.push(new Date(year, 8, sepFirstMonday + 14));

  // 体育の日・スポーツの日（10月第2月曜日）
  const oct1 = new Date(year, 9, 1);
  const octFirstMonday = 1 + (8 - oct1.getDay()) % 7;
  holidays.push(new Date(year, 9, octFirstMonday + 7));

  // 春分の日（おおよその計算）
  const springEquinox = Math.floor(20.8431 + 0.242194 * (year - 1851) - Math.floor((year - 1851) / 4));
  holidays.push(new Date(year, 2, springEquinox));

  // 秋分の日（おおよその計算）
  const autumnEquinox = Math.floor(23.2488 + 0.242194 * (year - 1851) - Math.floor((year - 1851) / 4));
  holidays.push(new Date(year, 8, autumnEquinox));

  return holidays;
};

/**
 * 指定した年月の営業日数を計算する（土日祝日を除く）
 * @param year 年
 * @param month 月（1-12）
 * @returns 営業日数
 */
export const getWorkingDaysInMonth = (year: number, month: number): number => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const holidays = getJapaneseHolidays(year);
  let workingDays = 0;

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay();
    
    // 土曜日（6）と日曜日（0）を除く
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // 祝日かどうかチェック
      const isHoliday = holidays.some(holiday => 
        holiday.getFullYear() === currentDate.getFullYear() &&
        holiday.getMonth() === currentDate.getMonth() &&
        holiday.getDate() === currentDate.getDate()
      );
      
      if (!isHoliday) {
        workingDays++;
      }
    }
  }

  return workingDays;
};

/**
 * 現在の月の営業日数を取得する
 * @returns 現在の月の営業日数
 */
export const getCurrentMonthWorkingDays = (): number => {
  const now = new Date();
  return getWorkingDaysInMonth(now.getFullYear(), now.getMonth() + 1);
};