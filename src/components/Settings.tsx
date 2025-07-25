import React, { useState } from 'react';
import { OvertimeSettings } from '../types';

interface SettingsProps {
  settings: OvertimeSettings;
  onUpdateSettings: (settings: Partial<OvertimeSettings>) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [standardWorkHours, setStandardWorkHours] = useState(settings.standardWorkHours);
  const [breakTime, setBreakTime] = useState(settings.breakTime);

  const handleSave = () => {
    onUpdateSettings({
      standardWorkHours,
      breakTime
    });
    alert('設定を保存しました');
  };

  const handleReset = () => {
    setStandardWorkHours(8);
    setBreakTime(60);
  };

  return (
    <div className="settings">
      <h2>設定</h2>
      
      <div className="setting-item">
        <label htmlFor="standard-work-hours">
          標準労働時間（時間）:
        </label>
        <input
          id="standard-work-hours"
          type="number"
          value={standardWorkHours}
          onChange={(e) => setStandardWorkHours(Number(e.target.value))}
          min="1"
          max="12"
          step="0.5"
        />
        <span className="setting-help">
          この時間を超えた分が残業時間として計算されます
        </span>
      </div>

      <div className="setting-item">
        <label htmlFor="break-time">
          標準休憩時間（分）:
        </label>
        <input
          id="break-time"
          type="number"
          value={breakTime}
          onChange={(e) => setBreakTime(Number(e.target.value))}
          min="0"
          max="120"
          step="15"
        />
        <span className="setting-help">
          新しい記録作成時のデフォルト休憩時間
        </span>
      </div>

      <div className="setting-actions">
        <button 
          onClick={handleSave}
          className="btn btn-save"
        >
          設定を保存
        </button>
        
        <button 
          onClick={handleReset}
          className="btn btn-reset"
        >
          デフォルトに戻す
        </button>
      </div>
    </div>
  );
};