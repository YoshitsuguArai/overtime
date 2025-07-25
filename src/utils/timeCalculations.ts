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