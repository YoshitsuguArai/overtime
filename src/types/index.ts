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
}

export interface TimeInput {
  hours: number;
  minutes: number;
}

export interface OvertimeSettings {
  standardWorkHours: number; // 1日の標準労働時間
  breakTime: number; // 標準休憩時間（分）
}

export interface AppState {
  currentRecord: Partial<WorkRecord> | null;
  records: WorkRecord[];
  settings: OvertimeSettings;
  isTracking: boolean;
}