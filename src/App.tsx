import React, { useState } from 'react';
import { WorkTimeForm } from './components/WorkTimeForm';
import { WorkHistory } from './components/WorkHistory';
import { MonthlySummary } from './components/MonthlySummary';
import { Settings } from './components/Settings';
import { SalarySettings } from './components/SalarySettings';
import { useOvertimeTracker } from './hooks/useOvertimeTracker';
import { WorkRecord } from './types';
import './index.css';

type TabType = 'input' | 'history' | 'monthly' | 'settings' | 'salary';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('input');
  const {
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
    editRecord,
    cancelEdit
  } = useOvertimeTracker();

  const totalOvertimeHours = getTotalOvertimeHours();

  const handleClearAllRecords = () => {
    if (window.confirm('全ての記録を削除しますか？この操作は取り消せません。')) {
      clearAllRecords();
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('この記録を削除しますか？')) {
      deleteRecord(recordId);
    }
  };

  const handleEditRecord = (record: WorkRecord) => {
    editRecord(record);
    setActiveTab('input');
  };

  const handleSaveRecord = (record: WorkRecord) => {
    saveRecord(record);
    // saveRecord内でsetCurrentRecord(null)が呼ばれるため、
    // ここでcancelEditを呼ぶ必要はない
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>残業時間計測アプリ</h1>
        <p>フレックス勤務対応 - 出勤・退勤時間から暫定残業時間を計算</p>
        {totalOvertimeHours > 0 && (
          <p>
            総残業時間: <strong>{totalOvertimeHours.toFixed(2)}時間</strong>
          </p>
        )}
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          時間入力
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          履歴 ({records.length})
        </button>
        <button
          className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          月別サマリー
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          勤務設定
        </button>
        <button
          className={`tab ${activeTab === 'salary' ? 'active' : ''}`}
          onClick={() => setActiveTab('salary')}
        >
          給与設定
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === 'input' && (
          <WorkTimeForm
            settings={settings}
            salarySettings={salarySettings}
            onSave={handleSaveRecord}
            onCancel={cancelEdit}
            currentRecord={currentRecord}
          />
        )}

        {activeTab === 'history' && (
          <WorkHistory
            records={records}
            salarySettings={salarySettings}
            onDeleteRecord={handleDeleteRecord}
            onEditRecord={handleEditRecord}
            onClearAll={handleClearAllRecords}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlySummary 
            records={records}
            salarySettings={salarySettings}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}

        {activeTab === 'salary' && (
          <SalarySettings
            settings={salarySettings}
            onUpdateSettings={updateSalarySettings}
          />
        )}
      </main>
    </div>
  );
};

export default App;