import React from 'react';
import { WorkRecord, SalarySettings } from '../types';
import { calculateOvertimePayDetails, formatCurrency } from '../utils/salaryCalculations';
import { isHoliday, getDayOfWeekJapanese } from '../utils/holidayUtils';

interface OvertimePayDisplayProps {
  record: WorkRecord;
  salarySettings: SalarySettings;
}

export const OvertimePayDisplay: React.FC<OvertimePayDisplayProps> = ({
  record,
  salarySettings
}) => {
  if (!record.startTime || !record.endTime) {
    return (
      <div className="overtime-pay-display">
        <h3>残業代情報</h3>
        <p>出勤・退勤時間を入力してください</p>
      </div>
    );
  }

  const payDetails = calculateOvertimePayDetails(record, salarySettings);
  const holidayInfo = isHoliday(record.date);
  const dayOfWeek = getDayOfWeekJapanese(record.date);

  return (
    <div className="overtime-pay-display">
      <h3>残業代情報</h3>
      
      <div className="work-date-info">
        <span className="work-date">
          {new Date(record.date).toLocaleDateString('ja-JP')} ({dayOfWeek})
        </span>
        {holidayInfo.isHoliday && (
          <span className={`holiday-badge ${holidayInfo.type}`}>
            {holidayInfo.name}
          </span>
        )}
      </div>

      <div className="pay-breakdown">
        {payDetails.regularOvertimePay > 0 && (
          <div className="pay-item regular-overtime">
            <div className="pay-label">
              <span>通常残業代</span>
              <span className="pay-detail">
                ({record.overtimeHours.toFixed(2)}h × {formatCurrency(salarySettings.baseSalary / salarySettings.workingDaysPerMonth / salarySettings.standardWorkHours)} × {salarySettings.overtimeRate})
              </span>
            </div>
            <div className="pay-amount">
              {formatCurrency(payDetails.regularOvertimePay)}
            </div>
          </div>
        )}

        {payDetails.holidayPay > 0 && (
          <div className="pay-item holiday-pay">
            <div className="pay-label">
              <span>休日労働手当</span>
              <span className="pay-detail">
                ({record.actualWorkHours.toFixed(2)}h × {formatCurrency(salarySettings.baseSalary / salarySettings.workingDaysPerMonth / salarySettings.standardWorkHours)} × {salarySettings.holidayRate})
              </span>
            </div>
            <div className="pay-amount">
              {formatCurrency(payDetails.holidayPay)}
            </div>
          </div>
        )}

        {payDetails.lateNightPay > 0 && (
          <div className="pay-item late-night-pay">
            <div className="pay-label">
              <span>深夜労働手当</span>
              <span className="pay-detail">
                ({salarySettings.lateNightStartTime}-{salarySettings.lateNightEndTime} × {formatCurrency(salarySettings.baseSalary / salarySettings.workingDaysPerMonth / salarySettings.standardWorkHours)} × {salarySettings.lateNightRate})
              </span>
            </div>
            <div className="pay-amount">
              {formatCurrency(payDetails.lateNightPay)}
            </div>
          </div>
        )}

        {payDetails.totalPay === 0 && (
          <div className="pay-item no-overtime">
            <div className="pay-label">
              <span>残業代なし</span>
              <span className="pay-detail">
                {holidayInfo.isHoliday ? '休日ですが労働時間なし' : '残業時間なし'}
              </span>
            </div>
            <div className="pay-amount">
              {formatCurrency(0)}
            </div>
          </div>
        )}
      </div>

      {payDetails.totalPay > 0 && (
        <div className="total-pay">
          <div className="total-label">合計残業代</div>
          <div className="total-amount">
            {formatCurrency(payDetails.totalPay)}
          </div>
        </div>
      )}

      <div className="pay-notes">
        <h4>計算根拠</h4>
        <ul>
          <li>基本給: {formatCurrency(salarySettings.baseSalary)}/月</li>
          <li>所定労働日数: {salarySettings.workingDaysPerMonth}日/月</li>
          <li>所定労働時間: {salarySettings.standardWorkHours}時間/日</li>
          <li>時給換算: {formatCurrency(salarySettings.baseSalary / salarySettings.workingDaysPerMonth / salarySettings.standardWorkHours)}</li>
        </ul>
      </div>
    </div>
  );
};