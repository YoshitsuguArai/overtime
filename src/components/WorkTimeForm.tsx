import React, { useState, useEffect } from 'react';
import { TimeInput } from './TimeInput';
import { OvertimeDisplay } from './OvertimeDisplay';
import { ProvisionalOvertimePayDisplay } from './ProvisionalOvertimePayDisplay';
import { WorkRecord, OvertimeSettings, SalarySettings } from '../types';
import { calculateWorkTimeDetails, getCurrentTimeString, getTodayDateString } from '../utils/timeCalculations';

interface WorkTimeFormProps {
  settings: OvertimeSettings;
  salarySettings: SalarySettings;
  onSave: (record: WorkRecord) => void;
  onCancel?: () => void;
  currentRecord?: Partial<WorkRecord> | null;
}

export const WorkTimeForm: React.FC<WorkTimeFormProps> = ({
  settings,
  salarySettings,
  onSave,
  onCancel,
  currentRecord
}) => {
  const [date, setDate] = useState(currentRecord?.date || getTodayDateString());
  const [startTime, setStartTime] = useState(currentRecord?.startTime || '');
  const [endTime, setEndTime] = useState(currentRecord?.endTime || '');
  const [breakTime, setBreakTime] = useState(currentRecord?.breakTime || settings.breakTime);
  const [isTracking, setIsTracking] = useState(false);

  // currentRecordが変更された時にフォームの状態を更新
  useEffect(() => {
    if (currentRecord) {
      setDate(currentRecord.date || getTodayDateString());
      setStartTime(currentRecord.startTime || '');
      setEndTime(currentRecord.endTime || '');
      setBreakTime(currentRecord.breakTime || settings.breakTime);
    } else {
      // 新規入力モードに戻る時
      setDate(getTodayDateString());
      setStartTime('');
      setEndTime('');
      setBreakTime(settings.breakTime);
    }
    setIsTracking(false);
  }, [currentRecord, settings.breakTime]);

  const workDetails = startTime && endTime ? 
    calculateWorkTimeDetails(startTime, endTime, { ...settings, breakTime }) : 
    { actualWorkHours: 0, overtimeHours: 0, shortageHours: 0 };

  const handleStartWork = () => {
    const currentTime = getCurrentTimeString();
    const today = getTodayDateString();
    setDate(today);
    setStartTime(currentTime);
    setIsTracking(true);
  };

  const handleEndWork = () => {
    const currentTime = getCurrentTimeString();
    setEndTime(currentTime);
    setIsTracking(false);
  };

  const handleSave = () => {
    if (!startTime || !endTime) return;

    const record: WorkRecord = {
      id: currentRecord?.id || Date.now().toString(),
      date,
      startTime,
      endTime,
      breakTime,
      actualWorkHours: workDetails.actualWorkHours,
      overtimeHours: workDetails.overtimeHours,
      shortageHours: workDetails.shortageHours,
      standardWorkHours: settings.standardWorkHours
    };

    onSave(record);
    
    // 編集モードでない場合のみフォームをリセット
    if (!currentRecord) {
      setDate(getTodayDateString());
      setStartTime('');
      setEndTime('');
      setBreakTime(settings.breakTime);
    }
    // 編集モードの場合は、親コンポーネントでcurrentRecordがnullになり、
    // useEffectでフォームがリセットされる
  };

  const handleReset = () => {
    setDate(getTodayDateString());
    setStartTime('');
    setEndTime('');
    setBreakTime(settings.breakTime);
    setIsTracking(false);
  };

  return (
    <div className="work-time-form">
      <h2>勤務時間入力</h2>
      
      <div className="time-inputs">
        <div className="date-input">
          <label htmlFor="work-date">勤務日:</label>
          <input
            id="work-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={getTodayDateString()}
            className="date-input-field"
          />
        </div>

        <TimeInput
          label="出勤時間"
          value={startTime}
          onChange={setStartTime}
          disabled={isTracking}
        />
        
        <TimeInput
          label="退勤時間"
          value={endTime}
          onChange={setEndTime}
        />
        
        <div className="break-time-input">
          <label htmlFor="break-time">休憩時間（分）:</label>
          <input
            id="break-time"
            type="number"
            value={breakTime}
            onChange={(e) => setBreakTime(Number(e.target.value))}
            min="0"
            step="15"
            className="break-input-field"
          />
        </div>
      </div>

      <div className="quick-actions">
        <button 
          onClick={handleStartWork}
          disabled={isTracking || !!startTime}
          className="btn btn-start"
        >
          出勤
        </button>
        
        <button 
          onClick={handleEndWork}
          disabled={!isTracking || !startTime}
          className="btn btn-end"
        >
          退勤
        </button>
      </div>

      {currentRecord && (
        <div className="edit-mode-notice">
          <p>📝 編集モード: {new Date(date).toLocaleDateString('ja-JP')}の記録を編集中</p>
        </div>
      )}

      <OvertimeDisplay 
        startTime={startTime}
        endTime={endTime}
        breakTime={breakTime}
        settings={settings}
        workDetails={workDetails}
      />

      <ProvisionalOvertimePayDisplay
        date={date}
        startTime={startTime}
        endTime={endTime}
        breakTime={breakTime}
        actualWorkHours={workDetails.actualWorkHours}
        overtimeHours={workDetails.overtimeHours}
        shortageHours={workDetails.shortageHours}
        standardWorkHours={settings.standardWorkHours}
        salarySettings={salarySettings}
      />

      <div className="form-actions">
        <button 
          onClick={handleSave}
          disabled={!startTime || !endTime}
          className="btn btn-save"
        >
          {currentRecord ? '記録を更新' : '記録を保存'}
        </button>
        
        {currentRecord && onCancel && (
          <button 
            onClick={onCancel}
            className="btn btn-secondary"
          >
            編集をキャンセル
          </button>
        )}
        
        <button 
          onClick={handleReset}
          className="btn btn-reset"
        >
          リセット
        </button>
      </div>
    </div>
  );
};