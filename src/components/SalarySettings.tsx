import React, { useState } from 'react';
import { SalarySettings as SalarySettingsType } from '../types';
import { formatCurrency, calculateHourlyWage } from '../utils/salaryCalculations';

interface SalarySettingsProps {
  settings: SalarySettingsType;
  onUpdateSettings: (settings: Partial<SalarySettingsType>) => void;
}

export const SalarySettings: React.FC<SalarySettingsProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [baseSalary, setBaseSalary] = useState(settings.baseSalary);
  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState(settings.workingDaysPerMonth);
  const [standardWorkHours, setStandardWorkHours] = useState(settings.standardWorkHours);
  const [overtimeRate, setOvertimeRate] = useState(settings.overtimeRate);
  const [holidayRate, setHolidayRate] = useState(settings.holidayRate);
  const [lateNightRate, setLateNightRate] = useState(settings.lateNightRate);
  const [lateNightStartTime, setLateNightStartTime] = useState(settings.lateNightStartTime);
  const [lateNightEndTime, setLateNightEndTime] = useState(settings.lateNightEndTime);

  const currentSettings = {
    baseSalary,
    workingDaysPerMonth,
    standardWorkHours,
    overtimeRate,
    holidayRate,
    lateNightRate,
    lateNightStartTime,
    lateNightEndTime
  };

  const hourlyWage = calculateHourlyWage(currentSettings);

  const handleSave = () => {
    onUpdateSettings({
      baseSalary,
      workingDaysPerMonth,
      standardWorkHours,
      overtimeRate,
      holidayRate,
      lateNightRate,
      lateNightStartTime,
      lateNightEndTime
    });
    alert('給与設定を保存しました');
  };

  const handleReset = () => {
    setBaseSalary(250000);
    setWorkingDaysPerMonth(22);
    setStandardWorkHours(8);
    setOvertimeRate(1.25);
    setHolidayRate(1.35);
    setLateNightRate(1.25);
    setLateNightStartTime('22:00');
    setLateNightEndTime('05:00');
  };

  return (
    <div className="salary-settings">
      <h2>給与設定</h2>
      
      <div className="settings-grid">
        <div className="setting-section">
          <h3>基本給与</h3>
          
          <div className="setting-item">
            <label htmlFor="base-salary">
              基本給（月額）:
            </label>
            <input
              id="base-salary"
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              min="100000"
              max="2000000"
              step="1000"
            />
            <span className="setting-unit">円</span>
          </div>

          <div className="setting-item">
            <label htmlFor="working-days">
              月の所定労働日数:
            </label>
            <input
              id="working-days"
              type="number"
              value={workingDaysPerMonth}
              onChange={(e) => setWorkingDaysPerMonth(Number(e.target.value))}
              min="15"
              max="31"
              step="1"
            />
            <span className="setting-unit">日</span>
          </div>

          <div className="setting-item">
            <label htmlFor="standard-work-hours">
              1日の所定労働時間:
            </label>
            <input
              id="standard-work-hours"
              type="number"
              value={standardWorkHours}
              onChange={(e) => setStandardWorkHours(Number(e.target.value))}
              min="4"
              max="12"
              step="0.5"
            />
            <span className="setting-unit">時間</span>
          </div>

          <div className="calculated-wage">
            <strong>計算上の時給: {formatCurrency(hourlyWage)}</strong>
          </div>
        </div>

        <div className="setting-section">
          <h3>割増率設定</h3>
          
          <div className="setting-item">
            <label htmlFor="overtime-rate">
              残業割増率:
            </label>
            <input
              id="overtime-rate"
              type="number"
              value={overtimeRate}
              onChange={(e) => setOvertimeRate(Number(e.target.value))}
              min="1.0"
              max="2.0"
              step="0.01"
            />
            <span className="setting-help">
              (法定: 1.25 = 25%増し)
            </span>
          </div>

          <div className="setting-item">
            <label htmlFor="holiday-rate">
              休日労働割増率:
            </label>
            <input
              id="holiday-rate"
              type="number"
              value={holidayRate}
              onChange={(e) => setHolidayRate(Number(e.target.value))}
              min="1.0"
              max="2.0"
              step="0.01"
            />
            <span className="setting-help">
              (法定: 1.35 = 35%増し)
            </span>
          </div>

          <div className="setting-item">
            <label htmlFor="late-night-rate">
              深夜労働割増率:
            </label>
            <input
              id="late-night-rate"
              type="number"
              value={lateNightRate}
              onChange={(e) => setLateNightRate(Number(e.target.value))}
              min="1.0"
              max="2.0"
              step="0.01"
            />
            <span className="setting-help">
              (法定: 1.25 = 25%増し)
            </span>
          </div>
        </div>

        <div className="setting-section">
          <h3>深夜労働時間帯</h3>
          
          <div className="setting-item">
            <label htmlFor="late-night-start">
              深夜労働開始時刻:
            </label>
            <input
              id="late-night-start"
              type="time"
              value={lateNightStartTime}
              onChange={(e) => setLateNightStartTime(e.target.value)}
            />
            <span className="setting-help">
              (法定: 22:00)
            </span>
          </div>

          <div className="setting-item">
            <label htmlFor="late-night-end">
              深夜労働終了時刻:
            </label>
            <input
              id="late-night-end"
              type="time"
              value={lateNightEndTime}
              onChange={(e) => setLateNightEndTime(e.target.value)}
            />
            <span className="setting-help">
              (法定: 05:00)
            </span>
          </div>
        </div>
      </div>

      <div className="example-calculations">
        <h3>計算例</h3>
        <div className="example-grid">
          <div className="example-item">
            <span>通常残業1時間:</span>
            <span>{formatCurrency(hourlyWage * overtimeRate)}</span>
          </div>
          <div className="example-item">
            <span>休日労働1時間:</span>
            <span>{formatCurrency(hourlyWage * holidayRate)}</span>
          </div>
          <div className="example-item">
            <span>深夜労働1時間:</span>
            <span>{formatCurrency(hourlyWage * lateNightRate)}</span>
          </div>
        </div>
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