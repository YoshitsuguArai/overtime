export interface WorkRecord {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  breakTime: number; // 休憩時間（分）
  overtimeHours: number; // 残業時間（時間）- 不足分を差し引き後
  shortageHours: number; // 不足時間（時間）- 所定時間に満たない場合
  actualWorkHours: number; // 実際の労働時間（時間）
  standardWorkHours: number; // 標準労働時間（時間）
  isHoliday?: boolean; // 祝日・休日フラグ
  overtimePay?: number; // 残業代（円）
  holidayPay?: number; // 休日労働手当（円）
}

export interface TimeInput {
  hours: number;
  minutes: number;
}

export interface OvertimeSettings {
  standardWorkHours: number; // 1日の標準労働時間
  breakTime: number; // 標準休憩時間（分）
}

export interface SalarySettings {
  baseSalary: number; // 基本給（月額・円）
  workingDaysPerMonth: number; // 月の所定労働日数
  standardWorkHours: number; // 1日の所定労働時間
  overtimeRate: number; // 残業割増率（1.25 = 25%増し）
  holidayRate: number; // 休日労働割増率（1.35 = 35%増し）
  lateNightRate: number; // 深夜労働割増率（1.25 = 25%増し）
  lateNightStartTime: string; // 深夜労働開始時刻（22:00）
  lateNightEndTime: string; // 深夜労働終了時刻（05:00）
}

export interface AppState {
  currentRecord: Partial<WorkRecord> | null;
  records: WorkRecord[];
  settings: OvertimeSettings;
  isTracking: boolean;
}