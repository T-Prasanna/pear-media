import React, { useState } from 'react';
import Navbar from './components/Navbar';
import WorkflowText from './components/WorkflowText';
import WorkflowImage from './components/WorkflowImage';
import Settings from './components/Settings';
import Spinner from './components/Spinner';
import { TABS } from './utils/constants';

export default function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [spinner, setSpinner]     = useState('');

  return (
    <>
      <Navbar />
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <main className="tab-content">
        {activeTab === 'text'     && <WorkflowText  setSpinner={setSpinner} switchToSettings={() => setActiveTab('settings')} />}
        {activeTab === 'image'    && <WorkflowImage setSpinner={setSpinner} switchToSettings={() => setActiveTab('settings')} />}
        {activeTab === 'settings' && <Settings />}
      </main>
      {spinner && <Spinner message={spinner} />}
    </>
  );
}
