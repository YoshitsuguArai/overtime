import React from 'react';
import { OvertimeSettings } from '../types';
import { 
  calculateWorkTime, 
  formatOvertimeDisplay,
  formatShortageDisplay,
  minutesToTimeString 
} from '../utils/timeCalculations';

interface OvertimeDisplayProps {
  startTime: string;
  endTime: string;
  breakTime: number;
  settings: OvertimeSettings;
  workDetails: {
    actualWorkHours: number;
    overtimeHours: number;
    shortageHours: number;
  };
}

export const OvertimeDisplay: React.FC<OvertimeDisplayProps> = ({
  startTime,
  endTime,
  breakTime,
  settings,
  workDetails
}) => {
  if (!startTime || !endTime) {
    return (
      <div className="overtime-display">
        <h3>勤務時間情報</h3>
        <p>出勤・退勤時間を入力してください</p>
      </div>
    );
  }

  const workMinutes = calculateWorkTime(startTime, endTime, breakTime);
  const standardMinutes = settings.standardWorkHours * 60;

  return (
    <div className="overtime-display">
      <h3>勤務時間情報</h3>
      
      <div className="time-summary">
        <div className="time-item">
          <span className="label">実労働時間:</span>
          <span className="value">{minutesToTimeString(workMinutes)}</span>
        </div>
        
        <div className="time-item">
          <span className="label">標準労働時間:</span>
          <span className="value">{minutesToTimeString(standardMinutes)}</span>
        </div>
        
        <div className="time-item">
          <span className="label">休憩時間:</span>
          <span className="value">{minutesToTimeString(breakTime)}</span>
        </div>
        
        {workDetails.overtimeHours > 0 && (
          <div className="time-item overtime has-overtime">
            <span className="label">残業時間:</span>
            <span className="value overtime-value">
              {formatOvertimeDisplay(workDetails.overtimeHours)}
            </span>
          </div>
        )}
        
        {(workDetails.shortageHours || 0) > 0 && (
          <div className="time-item shortage has-shortage">
            <span className="label">不足時間:</span>
            <span className="value shortage-value">
              {formatShortageDisplay(workDetails.shortageHours || 0)}
            </span>
          </div>
        )}
      </div>

      {workDetails.overtimeHours > 0 && (
        <div className="overtime-alert">
          ⚠️ 残業が発生しています
        </div>
      )}
      
      {(workDetails.shortageHours || 0) > 0 && (
        <div className="shortage-alert">
          ⚠️ 労働時間が不足しています
        </div>
      )}

      {workDetails.overtimeHours === 0 && (workDetails.shortageHours || 0) === 0 && (
        <div className="standard-alert">
          ✅ 標準労働時間通りです
        </div>
      )}
    </div>
  );
};