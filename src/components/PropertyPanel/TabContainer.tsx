import React, { useState, ReactNode } from 'react';
import './TabContainer.css';

export interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
  badge?: string | number;
}

export interface TabContainerProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const TabContainer: React.FC<TabContainerProps> = ({
  tabs,
  defaultActiveTab,
  onTabChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`tab-container ${className}`}>
      {/* Tab Headers */}
      <div className="tab-header-row">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-header ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.badge && (
              <span className="tab-badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content" role="tabpanel">
        {activeTabContent}
      </div>
    </div>
  );
};

export default TabContainer;