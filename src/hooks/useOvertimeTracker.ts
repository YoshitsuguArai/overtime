import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { WorkRecord, OvertimeSettings, SalarySettings } from '../types';
import { calculateWorkTimeDetails, getCurrentMonthWorkingDays, getWorkingDaysInMonth } from '../utils/timeCalculations';

const DEFAULT_SETTINGS: OvertimeSettings = {
  standardWorkHours: 8,
  breakTime: 60 // 60分
};

const DEFAULT_SALARY_SETTINGS: SalarySettings = {
  baseSalary: 250000,
  workingDaysPerMonth: getCurrentMonthWorkingDays(),
  overtimeRate: 1.25,
  holidayRate: 1.35,
  lateNightRate: 1.25,
  lateNightStartTime: '22:00',
  lateNightEndTime: '05:00',
  standardWorkHours: 8
};

export const useOvertimeTracker = () => {
  const [records, setRecords] = useLocalStorage<WorkRecord[]>('overtime-records', []);
  const [settings, setSettings] = useLocalStorage<OvertimeSettings>('overtime-settings', DEFAULT_SETTINGS);
  const [salarySettings, setSalarySettings] = useLocalStorage<SalarySettings>('salary-settings', DEFAULT_SALARY_SETTINGS);
  const [currentRecord, setCurrentRecord] = useState<Partial<WorkRecord> | null>(null);

  // 既存データを新しい形式に変換
  useEffect(() => {
    const migrateRecords = records.map(record => {
      // 新しいフィールドが存在しない古いデータの場合
      if (record.actualWorkHours === undefined || record.shortageHours === undefined) {
        if (record.startTime && record.endTime) {
          const workDetails = calculateWorkTimeDetails(
            record.startTime,
            record.endTime,
            { standardWorkHours: record.standardWorkHours, breakTime: record.breakTime }
          );
          
          return {
            ...record,
            actualWorkHours: workDetails.actualWorkHours,
            shortageHours: workDetails.shortageHours,
            // 古いデータの残業時間計算方法を新しい方法で補正
            overtimeHours: workDetails.overtimeHours
          };
        }
      }
      return record;
    });

    // データに変更があった場合のみ更新
    const needsMigration = migrateRecords.some((record, index) => 
      record.actualWorkHours !== records[index]?.actualWorkHours ||
      record.shortageHours !== records[index]?.shortageHours
    );

    if (needsMigration) {
      setRecords(migrateRecords);
    }
  }, [records, setRecords]);

  const saveRecord = useCallback((record: WorkRecord) => {
    // 所定労働時間を設定から取得して追加
    const recordWithSettings = {
      ...record,
      standardWorkHours: settings.standardWorkHours
    };

    setRecords(prevRecords => {
      const existingIndex = prevRecords.findIndex(r => r.id === recordWithSettings.id);
      if (existingIndex >= 0) {
        // 既存レコードを更新
        const updatedRecords = [...prevRecords];
        updatedRecords[existingIndex] = recordWithSettings;
        return updatedRecords;
      } else {
        // 新しいレコードを追加する前に、同日の記録がないかチェック
        const sameDate = prevRecords.find(r => r.date === recordWithSettings.date);
        if (sameDate) {
          // 同日の記録が既に存在する場合は確認
          if (window.confirm(`${recordWithSettings.date}の記録が既に存在します。上書きしますか？`)) {
            // 既存の同日記録を更新
            const sameDateIndex = prevRecords.findIndex(r => r.date === recordWithSettings.date);
            const updatedRecords = [...prevRecords];
            updatedRecords[sameDateIndex] = { ...recordWithSettings, id: sameDate.id };
            return updatedRecords;
          } else {
            // キャンセルされた場合は変更しない
            return prevRecords;
          }
        }
        // 同日の記録がない場合は新規追加
        return [...prevRecords, recordWithSettings];
      }
    });
    setCurrentRecord(null);
  }, [setRecords, settings.standardWorkHours]);

  const deleteRecord = useCallback((recordId: string) => {
    setRecords(prevRecords => prevRecords.filter(r => r.id !== recordId));
  }, [setRecords]);

  const clearAllRecords = useCallback(() => {
    setRecords([]);
  }, [setRecords]);

  const updateSettings = useCallback((newSettings: Partial<OvertimeSettings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  }, [setSettings]);

  const updateSalarySettings = useCallback((newSalarySettings: Partial<SalarySettings>) => {
    setSalarySettings(prevSettings => ({ ...prevSettings, ...newSalarySettings }));
  }, [setSalarySettings]);

  const getTotalOvertimeHours = useCallback(() => {
    return records.reduce((total, record) => total + record.overtimeHours, 0);
  }, [records]);

  const getMonthlyOvertimeHours = useCallback((year: number, month: number) => {
    return records
      .filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === year && recordDate.getMonth() === month - 1;
      })
      .reduce((total, record) => total + record.overtimeHours, 0);
  }, [records]);

  const getWorkingDaysForMonth = useCallback((year: number, month: number) => {
    return getWorkingDaysInMonth(year, month);
  }, []);

  const editRecord = useCallback((record: WorkRecord) => {
    setCurrentRecord(record);
  }, []);

  const cancelEdit = useCallback(() => {
    setCurrentRecord(null);
  }, []);

  return {
    records,
    settings,
    salarySettings,
    currentRecord,
    saveRecord,
    deleteRecord,
    clearAllRecords,
    updateSettings,
    updateSalarySettings,
    getTotalOvertimeHours,
    getMonthlyOvertimeHours,
    getWorkingDaysForMonth,
    setCurrentRecord,
    editRecord,
    cancelEdit
  };
};