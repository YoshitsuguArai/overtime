import React, { useState, useMemo } from 'react';
import { WorkRecord, SalarySettings } from '../types';
import { formatOvertimeDisplay, formatShortageDisplay } from '../utils/timeCalculations';
import { 
  getAvailableMonths, 
  getMonthName, 
  getCurrentMonthKey, 
  isDateInMonth 
} from '../utils/dateUtils';
import { calculateOvertimePayDetails, formatCurrency } from '../utils/salaryCalculations';

interface MonthlySummaryProps {
  records: WorkRecord[];
  salarySettings: SalarySettings;
}

interface MonthlyStats {
  totalOvertimeHours: number;
  totalShortageHours: number;
  netOvertimeHours: number;
  workingDays: number;
  averageOvertimePerDay: number;
  maxOvertimeDay: { date: string; hours: number };
  totalWorkingHours: number;
  estimatedOvertimePay: number;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ records, salarySettings }) => {
  const availableMonths = getAvailableMonths(records);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const monthlyStats = useMemo((): MonthlyStats => {
    const monthRecords = records.filter(record => 
      isDateInMonth(record.date, selectedMonth)
    );

    if (monthRecords.length === 0) {
      return {
        totalOvertimeHours: 0,
        totalShortageHours: 0,
        netOvertimeHours: 0,
        workingDays: 0,
        averageOvertimePerDay: 0,
        maxOvertimeDay: { date: '', hours: 0 },
        totalWorkingHours: 0,
        estimatedOvertimePay: 0
      };
    }

    const totalOvertimeHours = monthRecords.reduce(
      (sum, record) => sum + record.overtimeHours, 0
    );

    const totalShortageHours = monthRecords.reduce(
      (sum, record) => sum + (record.shortageHours || 0), 0
    );

    const netOvertimeHours = totalOvertimeHours - totalShortageHours;

    const totalWorkingHours = monthRecords.reduce((sum, record) => {
      // 既存データの互換性を保つため、actualWorkHours が undefined の場合は計算する
      if (record.actualWorkHours !== undefined) {
        return sum + record.actualWorkHours;
      } else {
        // 古いデータの場合は従来の計算方法を使用
        const startTime = record.startTime.split(':').map(Number);
        const endTime = record.endTime!.split(':').map(Number);
        const startMinutes = startTime[0] * 60 + startTime[1];
        const endMinutes = endTime[0] * 60 + endTime[1];
        const workMinutes = endMinutes - startMinutes - record.breakTime;
        return sum + (workMinutes / 60);
      }
    }, 0);

    const workingDays = monthRecords.length;
    const averageOvertimePerDay = totalOvertimeHours / workingDays;

    const maxOvertimeRecord = monthRecords.reduce((max, record) => 
      record.overtimeHours > max.overtimeHours ? record : max
    );

    return {
      totalOvertimeHours,
      totalShortageHours,
      netOvertimeHours,
      workingDays,
      averageOvertimePerDay,
      maxOvertimeDay: { 
        date: maxOvertimeRecord.date, 
        hours: maxOvertimeRecord.overtimeHours 
      },
      totalWorkingHours,
      estimatedOvertimePay: netOvertimeHours > 0 ? calculateOvertimePayDetails({
        id: 'monthly-summary',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '18:00',
        breakTime: 60,
        overtimeHours: netOvertimeHours,
        shortageHours: 0,
        actualWorkHours: 8,
        standardWorkHours: 8
      }, salarySettings).totalPay : 0
    };
  }, [records, selectedMonth, salarySettings]);

  const monthRecords = records.filter(record => 
    isDateInMonth(record.date, selectedMonth)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  return (
    <div className="monthly-summary">
      <h2>月別サマリー</h2>
      
      <div className="month-selector">
        <label htmlFor="month-select">表示月:</label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-select-field"
        >
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {getMonthName(month)}
            </option>
          ))}
        </select>
      </div>

      <div className="summary-cards">
        <div className="summary-card total-overtime">
          <h3>月間残業時間</h3>
          <div className="value">
            {formatOvertimeDisplay(monthlyStats.totalOvertimeHours)}
          </div>
        </div>

        <div className="summary-card total-shortage">
          <h3>月間不足時間</h3>
          <div className="value">
            {formatShortageDisplay(monthlyStats.totalShortageHours)}
          </div>
        </div>

        <div className="summary-card net-overtime">
          <h3>実質残業時間</h3>
          <div className="value">
            {monthlyStats.netOvertimeHours >= 0 
              ? `+${formatOvertimeDisplay(monthlyStats.netOvertimeHours)}`
              : `-${formatShortageDisplay(Math.abs(monthlyStats.netOvertimeHours))}`
            }
          </div>
        </div>

        <div className="summary-card working-days">
          <h3>出勤日数</h3>
          <div className="value">{monthlyStats.workingDays}日</div>
        </div>

        <div className="summary-card average-overtime">
          <h3>1日平均残業時間</h3>
          <div className="value">
            {monthlyStats.workingDays > 0 
              ? formatOvertimeDisplay(monthlyStats.averageOvertimePerDay)
              : '0時間00分'
            }
          </div>
        </div>

        <div className="summary-card total-working">
          <h3>月間労働時間</h3>
          <div className="value">
            {formatOvertimeDisplay(monthlyStats.totalWorkingHours)}
          </div>
        </div>
      </div>

      {monthlyStats.maxOvertimeDay.hours > 0 && (
        <div className="max-overtime-day">
          <h3>最長残業日</h3>
          <p>
            {formatDate(monthlyStats.maxOvertimeDay.date)}: {' '}
            <span className="overtime-hours">
              {formatOvertimeDisplay(monthlyStats.maxOvertimeDay.hours)}
            </span>
          </p>

          {monthlyStats.estimatedOvertimePay > 0 && (
            <>
              <h3>予想残業代</h3>
              <p className="overtime-pay">
                {formatCurrency(monthlyStats.estimatedOvertimePay)}
              </p>
            </>
          )}
        </div>
      )}

      <div className="monthly-records">
        <h3>{getMonthName(selectedMonth)}の勤務記録</h3>
        {monthRecords.length === 0 ? (
          <p className="no-records">この月の記録はありません</p>
        ) : (
          <div className="records-grid">
            {monthRecords
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(record => (
                <div key={record.id} className="record-card">
                  <div className="record-date">
                    {formatDate(record.date)}
                  </div>
                  <div className="record-time">
                    {record.startTime} - {record.endTime}
                  </div>
                  <div className="record-status">
                    {record.overtimeHours > 0 && (
                      <span className="overtime-badge">+{formatOvertimeDisplay(record.overtimeHours)}</span>
                    )}
                    {(record.shortageHours || 0) > 0 && (
                      <span className="shortage-badge">-{formatShortageDisplay(record.shortageHours || 0)}</span>
                    )}
                    {record.overtimeHours === 0 && (record.shortageHours || 0) === 0 && (
                      <span className="standard-badge">標準</span>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};