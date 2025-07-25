// 日本の祝日判定ユーティリティ

interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD format
}

// 固定祝日（年ごとに更新が必要）
const FIXED_HOLIDAYS_2025: Holiday[] = [
  { name: '元日', date: '2025-01-01' },
  { name: '成人の日', date: '2025-01-13' },
  { name: '建国記念の日', date: '2025-02-11' },
  { name: '天皇誕生日', date: '2025-02-23' },
  { name: '春分の日', date: '2025-03-20' },
  { name: '昭和の日', date: '2025-04-29' },
  { name: '憲法記念日', date: '2025-05-03' },
  { name: 'みどりの日', date: '2025-05-04' },
  { name: 'こどもの日', date: '2025-05-05' },
  { name: '海の日', date: '2025-07-21' },
  { name: '山の日', date: '2025-08-11' },
  { name: '敬老の日', date: '2025-09-15' },
  { name: '秋分の日', date: '2025-09-23' },
  { name: 'スポーツの日', date: '2025-10-13' },
  { name: '文化の日', date: '2025-11-03' },
  { name: '勤労感謝の日', date: '2025-11-23' },
];

const FIXED_HOLIDAYS_2024: Holiday[] = [
  { name: '元日', date: '2024-01-01' },
  { name: '成人の日', date: '2024-01-08' },
  { name: '建国記念の日', date: '2024-02-11' },
  { name: '天皇誕生日', date: '2024-02-23' },
  { name: '春分の日', date: '2024-03-20' },
  { name: '昭和の日', date: '2024-04-29' },
  { name: '憲法記念日', date: '2024-05-03' },
  { name: 'みどりの日', date: '2024-05-04' },
  { name: 'こどもの日', date: '2024-05-05' },
  { name: '海の日', date: '2024-07-15' },
  { name: '山の日', date: '2024-08-11' },
  { name: '敬老の日', date: '2024-09-16' },
  { name: '秋分の日', date: '2024-09-22' },
  { name: 'スポーツの日', date: '2024-10-14' },
  { name: '文化の日', date: '2024-11-03' },
  { name: '勤労感謝の日', date: '2024-11-23' },
];

// 年末年始休暇の判定
const isYearEndHoliday = (date: Date): boolean => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 12/29-31, 1/2-3を年末年始休暇とする
  return (month === 12 && day >= 29) || (month === 1 && day >= 2 && day <= 3);
};

// 指定した日付が祝日かどうかを判定
export const isNationalHoliday = (dateString: string): { isHoliday: boolean; name?: string } => {
  const year = new Date(dateString).getFullYear();
  let holidays: Holiday[] = [];
  
  switch (year) {
    case 2024:
      holidays = FIXED_HOLIDAYS_2024;
      break;
    case 2025:
      holidays = FIXED_HOLIDAYS_2025;
      break;
    default:
      // 年が登録されていない場合は2025年のデータを使用
      holidays = FIXED_HOLIDAYS_2025;
  }
  
  const holiday = holidays.find(h => h.date === dateString);
  if (holiday) {
    return { isHoliday: true, name: holiday.name };
  }
  
  return { isHoliday: false };
};

// 指定した日付が週末（土日）かどうかを判定
export const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0=日曜, 6=土曜
};

// 指定した日付が年末年始休暇かどうかを判定
export const isYearEndNewYearHoliday = (dateString: string): boolean => {
  const date = new Date(dateString);
  return isYearEndHoliday(date);
};

// 指定した日付が休日（祝日、週末、年末年始）かどうかを総合判定
export const isHoliday = (dateString: string): { 
  isHoliday: boolean; 
  type?: 'national' | 'weekend' | 'yearEnd';
  name?: string;
} => {
  // 祝日判定
  const nationalHoliday = isNationalHoliday(dateString);
  if (nationalHoliday.isHoliday) {
    return { isHoliday: true, type: 'national', name: nationalHoliday.name };
  }
  
  // 週末判定
  if (isWeekend(dateString)) {
    const date = new Date(dateString);
    const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    return { isHoliday: true, type: 'weekend', name: dayNames[date.getDay()] };
  }
  
  // 年末年始判定
  if (isYearEndNewYearHoliday(dateString)) {
    return { isHoliday: true, type: 'yearEnd', name: '年末年始休暇' };
  }
  
  return { isHoliday: false };
};

// 祝日名を取得（日本語）
export const getHolidayName = (dateString: string): string | null => {
  const holidayInfo = isHoliday(dateString);
  return holidayInfo.name || null;
};

// 曜日を取得（日本語）
export const getDayOfWeekJapanese = (dateString: string): string => {
  const date = new Date(dateString);
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  return dayNames[date.getDay()];
};