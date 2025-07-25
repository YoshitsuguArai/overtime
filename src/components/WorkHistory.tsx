import React, { useState } from 'react';
import { WorkRecord, SalarySettings } from '../types';
import { formatOvertimeDisplay, formatShortageDisplay, minutesToTimeString } from '../utils/timeCalculations';
import { calculateOvertimePayDetails, formatCurrency } from '../utils/salaryCalculations';

interface WorkHistoryProps {
  records: WorkRecord[];
  salarySettings: SalarySettings;
  onDeleteRecord: (recordId: string) => void;
  onEditRecord: (record: WorkRecord) => void;
  onClearAll: () => void;
}

export const WorkHistory: React.FC<WorkHistoryProps> = ({
  records,
  salarySettings,
  onDeleteRecord,
  onEditRecord,
  onClearAll
}) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterMonth, setFilterMonth] = useState<string>('');

  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const filteredRecords = filterMonth
    ? sortedRecords.filter(record => record.date.startsWith(filterMonth))
    : sortedRecords;

  const totalOvertimeHours = filteredRecords.reduce(
    (total, record) => total + record.overtimeHours,
    0
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  if (records.length === 0) {
    return (
      <div className="work-history">
        <h2>勤務履歴</h2>
        <p className="no-records">まだ記録がありません</p>
      </div>
    );
  }

  return (
    <div className="work-history">
      <div className="history-header">
        <h2>勤務履歴</h2>
        
        <div className="history-controls">
          <div className="filter-controls">
            <label htmlFor="month-filter">月でフィルター:</label>
            <input
              id="month-filter"
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>
          
          <div className="sort-controls">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="btn btn-sort"
            >
              日付順: {sortOrder === 'desc' ? '新しい順' : '古い順'}
            </button>
          </div>
        </div>
      </div>

      <div className="summary">
        <p>
          表示期間の総残業時間: 
          <span className="total-overtime">{formatOvertimeDisplay(totalOvertimeHours)}</span>
        </p>
        <p>記録件数: {filteredRecords.length}件</p>
      </div>

      <div className="records-list">
        {filteredRecords.map((record) => {
          const payDetails = calculateOvertimePayDetails(record, salarySettings);
          
          return (
            <div key={record.id} className="record-item">
              <div className="record-date">
                {formatDate(record.date)}
              </div>
              
              <div className="record-times">
                <span className="work-time">
                  {record.startTime} - {record.endTime}
                </span>
                <span className="break-time">
                  休憩: {minutesToTimeString(record.breakTime)}
                </span>
              </div>
              
              <div className="record-time-status">
                {record.overtimeHours > 0 && (
                  <div className="record-overtime has-overtime">
                    +{formatOvertimeDisplay(record.overtimeHours)}
                  </div>
                )}
                {(record.shortageHours || 0) > 0 && (
                  <div className="record-shortage has-shortage">
                    -{formatShortageDisplay(record.shortageHours || 0)}
                  </div>
                )}
                {record.overtimeHours === 0 && (record.shortageHours || 0) === 0 && (
                  <div className="record-standard">
                    標準時間
                  </div>
                )}
              </div>

              <div className="record-pay">
                <div className="pay-amount">
                  {formatCurrency(payDetails.totalPay)}
                </div>
                {payDetails.totalPay > 0 && (
                  <div className="pay-breakdown-mini">
                    {payDetails.regularOvertimePay > 0 && <span>残業</span>}
                    {payDetails.holidayPay > 0 && <span>休日</span>}
                    {payDetails.lateNightPay > 0 && <span>深夜</span>}
                  </div>
                )}
              </div>
              
              <div className="record-actions">
                <button
                  onClick={() => onEditRecord(record)}
                  className="btn btn-edit"
                  title="この記録を編集"
                >
                  編集
                </button>
                <button
                  onClick={() => onDeleteRecord(record.id)}
                  className="btn btn-delete"
                  title="この記録を削除"
                >
                  削除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="history-actions">
        <button
          onClick={onClearAll}
          className="btn btn-danger"
          disabled={records.length === 0}
        >
          全履歴をクリア
        </button>
      </div>
    </div>
  );
};