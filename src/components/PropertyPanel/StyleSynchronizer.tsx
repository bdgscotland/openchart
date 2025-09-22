// StyleSynchronizer - Keeps element styles in sync and manages style inheritance
// Provides smart grouping and style coordination features

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Link,
  Unlink,
  Layers,
  Copy,
  Palette,
  Target,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  GroupIcon as Group,
} from 'lucide-react';
import type { DiagramElement, ElementStyle } from '../../types/diagram';
import type { BulkStyleUpdate } from '../../core/commands/BulkStyleCommand';
import './StyleSynchronizer.css';

export interface StyleGroup {
  id: string;
  name: string;
  elementIds: string[];
  masterElementId?: string; // Element that controls the group's style
  synchronizedProperties: (keyof ElementStyle)[];
  autoSync: boolean;
}

export interface StyleSynchronizerProps {
  selectedElements: DiagramElement[];
  allElements: DiagramElement[];
  onBulkStyleUpdate: (update: BulkStyleUpdate) => void;
  onCreateGroup?: (group: Omit<StyleGroup, 'id'>) => void;
  onUpdateGroup?: (groupId: string, updates: Partial<StyleGroup>) => void;
  onDeleteGroup?: (groupId: string) => void;
  existingGroups?: StyleGroup[];
  className?: string;
}

interface StyleTemplate {
  id: string;
  name: string;
  style: Partial<ElementStyle>;
  description?: string;
}

const StyleSynchronizer: React.FC<StyleSynchronizerProps> = ({
  selectedElements,
  allElements,
  onBulkStyleUpdate,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  existingGroups = [],
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = useState({
    grouping: true,
    sync: false,
    templates: false,
    inheritance: false,
  });

  const [newGroupName, setNewGroupName] = useState('');
  const [selectedSyncProperties, setSelectedSyncProperties] = useState<Set<keyof ElementStyle>>(new Set());
  const [masterElement, setMasterElement] = useState<string>('');
  const [styleTemplates, setStyleTemplates] = useState<StyleTemplate[]>([
    {
      id: 'primary-button',
      name: 'Primary Button',
      style: { fill: '#007bff', stroke: '#0056b3', strokeWidth: 2, cornerRadius: 8 },
      description: 'Standard primary button style'
    },
    {
      id: 'secondary-button',
      name: 'Secondary Button',
      style: { fill: '#6c757d', stroke: '#5a6268', strokeWidth: 2, cornerRadius: 8 },
      description: 'Standard secondary button style'
    },
    {
      id: 'heading-text',
      name: 'Heading Text',
      style: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
      description: 'Standard heading text style'
    }
  ]);

  const isMultiSelect = selectedElements.length > 1;

  // Analyze selected elements for smart grouping suggestions
  const groupingSuggestions = useMemo(() => {
    if (selectedElements.length < 2) return [];

    const suggestions: Array<{ reason: string; elements: DiagramElement[]; confidence: number }> = [];

    // Group by element type
    const byType = selectedElements.reduce((acc, el) => {
      if (!acc[el.type]) acc[el.type] = [];
      acc[el.type].push(el);
      return acc;
    }, {} as Record<string, DiagramElement[]>);

    Object.entries(byType).forEach(([type, elements]) => {
      if (elements.length > 1) {
        suggestions.push({
          reason: `Similar element type: ${type}`,
          elements,
          confidence: 0.8
        });
      }
    });

    // Group by similar colors
    const colorGroups = selectedElements.reduce((acc, el) => {
      const colorKey = `${el.style.fill || ''}-${el.style.stroke || ''}`;
      if (!acc[colorKey]) acc[colorKey] = [];
      acc[colorKey].push(el);
      return acc;
    }, {} as Record<string, DiagramElement[]>);

    Object.entries(colorGroups).forEach(([colorKey, elements]) => {
      if (elements.length > 1) {
        suggestions.push({
          reason: 'Similar colors',
          elements,
          confidence: 0.6
        });
      }
    });

    // Group by similar sizes
    const sizeGroups = selectedElements.reduce((acc, el) => {
      const sizeKey = `${Math.round(el.size.width / 10) * 10}-${Math.round(el.size.height / 10) * 10}`;
      if (!acc[sizeKey]) acc[sizeKey] = [];
      acc[sizeKey].push(el);
      return acc;
    }, {} as Record<string, DiagramElement[]>);

    Object.entries(sizeGroups).forEach(([sizeKey, elements]) => {
      if (elements.length > 1) {
        suggestions.push({
          reason: 'Similar sizes',
          elements,
          confidence: 0.5
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }, [selectedElements]);

  // Find which groups the selected elements belong to
  const relevantGroups = useMemo(() => {
    return existingGroups.filter(group =>
      selectedElements.some(el => group.elementIds.includes(el.id))
    );
  }, [existingGroups, selectedElements]);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const toggleSyncProperty = useCallback((property: keyof ElementStyle) => {
    setSelectedSyncProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(property)) {
        newSet.delete(property);
      } else {
        newSet.add(property);
      }
      return newSet;
    });
  }, []);

  const handleCreateGroup = useCallback(() => {
    if (!newGroupName.trim() || selectedElements.length < 2 || !onCreateGroup) return;

    const group: Omit<StyleGroup, 'id'> = {
      name: newGroupName,
      elementIds: selectedElements.map(el => el.id),
      masterElementId: masterElement || selectedElements[0].id,
      synchronizedProperties: Array.from(selectedSyncProperties),
      autoSync: true,
    };

    onCreateGroup(group);
    setNewGroupName('');
    setSelectedSyncProperties(new Set());
    setMasterElement('');
  }, [newGroupName, selectedElements, masterElement, selectedSyncProperties, onCreateGroup]);

  const handleSyncToMaster = useCallback((group: StyleGroup) => {
    const master = allElements.find(el => el.id === group.masterElementId);
    if (!master) return;

    const syncStyle: Partial<ElementStyle> = {};
    group.synchronizedProperties.forEach(prop => {
      if (prop in master.style) {
        syncStyle[prop] = master.style[prop];
      }
    });

    onBulkStyleUpdate({
      elementIds: group.elementIds.filter(id => id !== group.masterElementId),
      styleUpdates: syncStyle,
      selectedProperties: group.synchronizedProperties,
      mode: 'replace',
    });
  }, [allElements, onBulkStyleUpdate]);

  const handleApplyTemplate = useCallback((template: StyleTemplate) => {
    onBulkStyleUpdate({
      elementIds: selectedElements.map(el => el.id),
      styleUpdates: template.style,
      mode: 'replace',
    });
  }, [selectedElements, onBulkStyleUpdate]);

  const handleCopyStyleFromElement = useCallback((sourceElementId: string) => {
    const sourceElement = allElements.find(el => el.id === sourceElementId);
    if (!sourceElement) return;

    onBulkStyleUpdate({
      elementIds: selectedElements.map(el => el.id),
      styleUpdates: sourceElement.style,
      mode: 'replace',
    });
  }, [allElements, selectedElements, onBulkStyleUpdate]);

  const createTemplateFromSelection = useCallback(() => {
    if (selectedElements.length === 0) return;

    const commonStyle: Partial<ElementStyle> = {};
    const firstStyle = selectedElements[0].style;

    // Find common properties across all selected elements
    Object.keys(firstStyle).forEach(key => {
      const styleKey = key as keyof ElementStyle;
      const firstValue = firstStyle[styleKey];

      const allSame = selectedElements.every(el =>
        el.style[styleKey] === firstValue
      );

      if (allSame) {
        commonStyle[styleKey] = firstValue;
      }
    });

    const templateName = prompt('Enter template name:');
    if (templateName?.trim()) {
      const newTemplate: StyleTemplate = {
        id: `custom-${Date.now()}`,
        name: templateName,
        style: commonStyle,
        description: `Created from ${selectedElements.length} selected element(s)`
      };

      setStyleTemplates(prev => [...prev, newTemplate]);
    }
  }, [selectedElements]);

  if (!isMultiSelect) {
    return (
      <div className={`style-synchronizer ${className}`}>
        <div className="sync-message">
          <p>Select multiple elements to use style synchronization</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`style-synchronizer ${className}`}>
      <div className="sync-header">
        <Link size={16} />
        <span>Style Synchronizer</span>
      </div>

      {/* Smart Grouping */}
      <div className="sync-section">
        <button
          className="sync-section-header"
          onClick={() => toggleSection('grouping')}
          aria-expanded={expandedSections.grouping}
        >
          <span className="sync-section-title">
            <Group size={16} />
            Smart Grouping
          </span>
          {expandedSections.grouping ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {expandedSections.grouping && (
          <div className="sync-section-content">
            {groupingSuggestions.length > 0 && (
              <div className="grouping-suggestions">
                <h4>Grouping Suggestions</h4>
                {groupingSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <div className="suggestion-info">
                      <span className="suggestion-reason">{suggestion.reason}</span>
                      <span className="suggestion-count">({suggestion.elements.length} elements)</span>
                    </div>
                    <div className="suggestion-confidence">
                      <div
                        className="confidence-bar"
                        style={{ width: `${suggestion.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="create-group-form">
              <h4>Create Style Group</h4>
              <div className="form-row">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name..."
                  className="group-name-input"
                />
              </div>

              <div className="form-row">
                <label>Master Element:</label>
                <select
                  value={masterElement}
                  onChange={(e) => setMasterElement(e.target.value)}
                  className="master-select"
                >
                  <option value="">Select master element</option>
                  {selectedElements.map(el => (
                    <option key={el.id} value={el.id}>
                      {el.type} - {el.text || el.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sync-properties">
                <label>Synchronized Properties:</label>
                <div className="property-checkboxes">
                  {['fill', 'stroke', 'strokeWidth', 'opacity', 'fontSize', 'fontWeight'].map(prop => (
                    <label key={prop} className="property-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedSyncProperties.has(prop as keyof ElementStyle)}
                        onChange={() => toggleSyncProperty(prop as keyof ElementStyle)}
                      />
                      <span>{prop}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || selectedSyncProperties.size === 0}
                className="create-group-btn"
              >
                Create Group
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Groups */}
      {relevantGroups.length > 0 && (
        <div className="sync-section">
          <button
            className="sync-section-header"
            onClick={() => toggleSection('sync')}
            aria-expanded={expandedSections.sync}
          >
            <span className="sync-section-title">
              <RefreshCw size={16} />
              Active Groups
            </span>
            {expandedSections.sync ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {expandedSections.sync && (
            <div className="sync-section-content">
              {relevantGroups.map(group => (
                <div key={group.id} className="group-item">
                  <div className="group-header">
                    <span className="group-name">{group.name}</span>
                    <span className="group-count">({group.elementIds.length} elements)</span>
                  </div>
                  <div className="group-properties">
                    <span>Synced: {group.synchronizedProperties.join(', ')}</span>
                  </div>
                  <div className="group-actions">
                    <button
                      onClick={() => handleSyncToMaster(group)}
                      className="sync-btn"
                      title="Sync all elements to master"
                    >
                      <RefreshCw size={14} />
                      Sync to Master
                    </button>
                    {onDeleteGroup && (
                      <button
                        onClick={() => onDeleteGroup(group.id)}
                        className="delete-group-btn"
                        title="Delete group"
                      >
                        <Unlink size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Style Templates */}
      <div className="sync-section">
        <button
          className="sync-section-header"
          onClick={() => toggleSection('templates')}
          aria-expanded={expandedSections.templates}
        >
          <span className="sync-section-title">
            <Palette size={16} />
            Style Templates
          </span>
          {expandedSections.templates ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {expandedSections.templates && (
          <div className="sync-section-content">
            <div className="template-actions">
              <button
                onClick={createTemplateFromSelection}
                className="create-template-btn"
              >
                <Copy size={14} />
                Save as Template
              </button>
            </div>

            <div className="template-list">
              {styleTemplates.map(template => (
                <div key={template.id} className="template-item">
                  <div className="template-info">
                    <span className="template-name">{template.name}</span>
                    {template.description && (
                      <span className="template-description">{template.description}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleApplyTemplate(template)}
                    className="apply-template-btn"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Style Inheritance */}
      <div className="sync-section">
        <button
          className="sync-section-header"
          onClick={() => toggleSection('inheritance')}
          aria-expanded={expandedSections.inheritance}
        >
          <span className="sync-section-title">
            <Target size={16} />
            Copy Styles
          </span>
          {expandedSections.inheritance ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {expandedSections.inheritance && (
          <div className="sync-section-content">
            <div className="copy-style-controls">
              <label>Copy style from element:</label>
              <select
                onChange={(e) => e.target.value && handleCopyStyleFromElement(e.target.value)}
                className="source-element-select"
                defaultValue=""
              >
                <option value="">Select source element</option>
                {allElements
                  .filter(el => !selectedElements.some(sel => sel.id === el.id))
                  .map(el => (
                    <option key={el.id} value={el.id}>
                      {el.type} - {el.text || el.id.slice(0, 8)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="inheritance-info">
              <p>Select an element to copy its style to all selected elements.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleSynchronizer;