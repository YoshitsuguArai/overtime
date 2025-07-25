export const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

export const getMonthName = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  return `${year}年${month}月`;
};

export const getCurrentMonthKey = (): string => {
  return getMonthKey(new Date());
};

export const getMonthRange = (monthKey: string): { start: Date; end: Date } => {
  const [year, month] = monthKey.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

export const isDateInMonth = (dateString: string, monthKey: string): boolean => {
  const date = new Date(dateString);
  const { start, end } = getMonthRange(monthKey);
  return date >= start && date <= end;
};

export const getAvailableMonths = (records: Array<{ date: string }>): string[] => {
  const months = new Set<string>();
  
  records.forEach(record => {
    const date = new Date(record.date);
    months.add(getMonthKey(date));
  });
  
  const currentMonth = getCurrentMonthKey();
  months.add(currentMonth);
  
  return Array.from(months).sort().reverse();
};