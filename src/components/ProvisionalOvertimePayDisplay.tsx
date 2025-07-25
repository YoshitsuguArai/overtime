import React from 'react';
import { SalarySettings } from '../types';
import { calculateOvertimePayDetails, formatCurrency } from '../utils/salaryCalculations';
import { isHoliday, getDayOfWeekJapanese } from '../utils/holidayUtils';

interface ProvisionalOvertimePayDisplayProps {
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  actualWorkHours: number;
  overtimeHours: number;
  shortageHours: number;
  standardWorkHours: number;
  salarySettings: SalarySettings;
}

export const ProvisionalOvertimePayDisplay: React.FC<ProvisionalOvertimePayDisplayProps> = ({
  date,
  startTime,
  endTime,
  breakTime,
  actualWorkHours,
  overtimeHours,
  shortageHours,
  standardWorkHours,
  salarySettings
}) => {
  if (!startTime || !endTime) {
    return (
      <div className="provisional-pay-display">
        <h4>💰 暫定残業代</h4>
        <p className="no-calculation">時間を入力すると残業代を表示します</p>
      </div>
    );
  }

  const mockRecord = {
    id: 'temp',
    date,
    startTime,
    endTime,
    breakTime,
    actualWorkHours,
    overtimeHours,
    shortageHours,
    standardWorkHours
  };

  const payDetails = calculateOvertimePayDetails(mockRecord, salarySettings);
  const holidayInfo = isHoliday(date);
  const dayOfWeek = getDayOfWeekJapanese(date);

  return (
    <div className="provisional-pay-display">
      <h4>💰 暫定残業代</h4>
      
      <div className="provisional-date-info">
        <span className="date-text">
          {new Date(date).toLocaleDateString('ja-JP')} ({dayOfWeek})
        </span>
        {holidayInfo.isHoliday && (
          <span className={`holiday-mini-badge ${holidayInfo.type}`}>
            {holidayInfo.name}
          </span>
        )}
      </div>

      <div className="provisional-pay-summary">
        {payDetails.totalPay > 0 ? (
          <>
            <div className="provisional-total">
              <span className="provisional-label">合計残業代:</span>
              <span className="provisional-amount">
                {formatCurrency(payDetails.totalPay)}
              </span>
            </div>
            
            <div className="provisional-breakdown">
              {payDetails.regularOvertimePay > 0 && (
                <div className="provisional-item">
                  <span>通常残業</span>
                  <span>{formatCurrency(payDetails.regularOvertimePay)}</span>
                </div>
              )}
              {payDetails.holidayPay > 0 && (
                <div className="provisional-item">
                  <span>休日労働</span>
                  <span>{formatCurrency(payDetails.holidayPay)}</span>
                </div>
              )}
              {payDetails.lateNightPay > 0 && (
                <div className="provisional-item">
                  <span>深夜労働</span>
                  <span>{formatCurrency(payDetails.lateNightPay)}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-overtime-pay">
            <span className="provisional-label">残業代:</span>
            <span className="provisional-amount zero">
              {formatCurrency(0)}
            </span>
            <div className="no-overtime-reason">
              {holidayInfo.isHoliday 
                ? '休日ですが労働時間なし' 
                : shortageHours > 0 
                  ? `所定時間まで${shortageHours.toFixed(1)}時間不足`
                  : '残業時間なし'
              }
            </div>
          </div>
        )}
      </div>

      {payDetails.totalPay > 0 && (
        <div className="provisional-note">
          <small>
            ※ 暫定計算です。正確な金額は保存後に確定されます
          </small>
        </div>
      )}
    </div>
  );
};