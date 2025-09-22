import React, { useState, useCallback } from 'react';
import {
  Heart,
  Star,
  Clock,
  User,
  Download,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Share2,
  Tag,
  TrendingUp,
  Check,
} from 'lucide-react';
import type { StylePreset } from '../../../types/stylePresets';
import './PresetCard.css';

export interface PresetCardProps {
  preset: StylePreset;
  viewMode?: 'grid' | 'list';
  isFavorite?: boolean;
  isRecent?: boolean;
  isSelected?: boolean;
  showSelection?: boolean;
  showActions?: boolean;
  onApply: () => void;
  onToggleFavorite?: () => void;
  onSelect?: (selected: boolean) => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  viewMode = 'grid',
  isFavorite = false,
  isRecent = false,
  isSelected = false,
  showSelection = false,
  showActions = true,
  onApply,
  onToggleFavorite,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onShare,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Handle card click (apply preset)
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't apply if clicking on action buttons
    if ((e.target as HTMLElement).closest('.preset-actions')) {
      return;
    }

    // Don't apply if clicking on selection checkbox
    if ((e.target as HTMLElement).closest('.preset-selection')) {
      return;
    }

    onApply();
  }, [onApply]);

  // Handle selection change
  const handleSelectionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(e.target.checked);
  }, [onSelect]);

  // Render style preview
  const renderStylePreview = () => {
    const { style } = preset;

    return (
      <div className="style-preview">
        {/* Rectangle preview */}
        <div
          className="preview-shape rectangle"
          style={{
            backgroundColor: style.fill || '#ffffff',
            borderColor: style.stroke || '#000000',
            borderWidth: `${style.strokeWidth || 2}px`,
            borderStyle: 'solid',
            borderRadius: `${style.cornerRadius || 0}px`,
            opacity: style.opacity || 1,
            color: style.color || '#000000',
            fontSize: `${Math.min(style.fontSize || 14, 12)}px`,
            fontWeight: style.fontWeight || 'normal',
            fontFamily: style.fontFamily || 'Arial, sans-serif',
            textAlign: style.textAlign || 'center',
          }}
        >
          <span className="preview-text">Aa</span>
        </div>

        {/* Additional shape indicators for variety */}
        <div className="preview-indicators">
          <div
            className="indicator-dot"
            style={{
              backgroundColor: style.fill || '#ffffff',
              borderColor: style.stroke || '#000000',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          />
          <div
            className="indicator-line"
            style={{
              backgroundColor: style.stroke || '#000000',
              height: `${Math.max(style.strokeWidth || 2, 2)}px`,
            }}
          />
        </div>
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const cardClasses = [
    'preset-card',
    viewMode,
    isSelected ? 'selected' : '',
    isFavorite ? 'favorite' : '',
    isRecent ? 'recent' : '',
    isHovered ? 'hovered' : '',
    className,
  ].filter(Boolean).join(' ');

  if (viewMode === 'list') {
    return (
      <div
        className={cardClasses}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Selection Checkbox */}
        {showSelection && (
          <div className="preset-selection">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectionChange}
              className="selection-checkbox"
            />
          </div>
        )}

        {/* Style Preview */}
        <div className="preset-preview">
          {renderStylePreview()}
        </div>

        {/* Preset Info */}
        <div className="preset-info">
          <div className="preset-header">
            <h4 className="preset-name">{preset.name}</h4>
            <div className="preset-badges">
              {isFavorite && (
                <span className="badge favorite" title="Favorite">
                  <Heart size={12} />
                </span>
              )}
              {isRecent && (
                <span className="badge recent" title="Recently Used">
                  <Clock size={12} />
                </span>
              )}
              {preset.isShared && (
                <span className="badge shared" title="Shared">
                  <Share2 size={12} />
                </span>
              )}
              {preset.rating && preset.rating > 4 && (
                <span className="badge rated" title={`${preset.rating} stars`}>
                  <Star size={12} />
                </span>
              )}
            </div>
          </div>

          {preset.description && (
            <p className="preset-description">{preset.description}</p>
          )}

          <div className="preset-meta">
            <span className="preset-category">{preset.category}</span>
            {preset.tags.length > 0 && (
              <div className="preset-tags">
                {preset.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="preset-tag">
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
                {preset.tags.length > 3 && (
                  <span className="preset-tag more">
                    +{preset.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="preset-details">
            <div className="preset-stats">
              {preset.usageCount && (
                <span className="stat">
                  <TrendingUp size={12} />
                  Used {preset.usageCount} times
                </span>
              )}
              <span className="stat">
                <Clock size={12} />
                {formatDate(preset.modified)}
              </span>
              {preset.author && (
                <span className="stat">
                  <User size={12} />
                  {preset.author}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="preset-actions">
            {onToggleFavorite && (
              <button
                className={`action-btn favorite ${isFavorite ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={14} />
              </button>
            )}

            <button
              className="action-btn apply primary"
              onClick={(e) => {
                e.stopPropagation();
                onApply();
              }}
              title="Apply Preset"
            >
              Apply
            </button>

            {onEdit && (
              <button
                className="action-btn edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Edit Preset"
              >
                <Edit3 size={14} />
              </button>
            )}

            {onDuplicate && (
              <button
                className="action-btn duplicate"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                title="Duplicate Preset"
              >
                <Copy size={14} />
              </button>
            )}

            {onShare && (
              <button
                className="action-btn share"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                title="Share Preset"
              >
                <Share2 size={14} />
              </button>
            )}

            {onDelete && (
              <button
                className="action-btn delete danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Delete Preset"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={cardClasses}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Checkbox */}
      {showSelection && (
        <div className="preset-selection">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionChange}
            className="selection-checkbox"
          />
        </div>
      )}

      {/* Status Indicators */}
      <div className="preset-indicators">
        {isFavorite && (
          <div className="indicator favorite" title="Favorite">
            <Heart size={12} />
          </div>
        )}
        {isRecent && (
          <div className="indicator recent" title="Recently Used">
            <Clock size={12} />
          </div>
        )}
        {preset.isShared && (
          <div className="indicator shared" title="Shared">
            <Share2 size={12} />
          </div>
        )}
        {preset.rating && preset.rating > 4 && (
          <div className="indicator rated" title={`${preset.rating} stars`}>
            <Star size={12} />
            <span>{preset.rating}</span>
          </div>
        )}
      </div>

      {/* Style Preview */}
      <div
        className="preset-preview"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        {renderStylePreview()}

        {/* Preview Overlay */}
        {showPreview && (
          <div className="preview-overlay">
            <button
              className="preview-btn"
              onClick={(e) => {
                e.stopPropagation();
                onApply();
              }}
            >
              <Eye size={16} />
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Preset Info */}
      <div className="preset-info">
        <h4 className="preset-name" title={preset.name}>
          {preset.name}
        </h4>

        {preset.description && (
          <p className="preset-description" title={preset.description}>
            {preset.description}
          </p>
        )}

        <div className="preset-category">
          {preset.category}
        </div>

        {preset.tags.length > 0 && (
          <div className="preset-tags">
            {preset.tags.slice(0, 2).map(tag => (
              <span key={tag} className="preset-tag" title={tag}>
                {tag}
              </span>
            ))}
            {preset.tags.length > 2 && (
              <span className="preset-tag more" title={preset.tags.slice(2).join(', ')}>
                +{preset.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {showActions && (
        <div className="preset-quick-actions">
          {onToggleFavorite && (
            <button
              className={`quick-action favorite ${isFavorite ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={12} />
            </button>
          )}

          <button
            className="quick-action apply"
            onClick={(e) => {
              e.stopPropagation();
              onApply();
            }}
            title="Apply Preset"
          >
            <Check size={12} />
          </button>
        </div>
      )}

      {/* Extended Actions (on hover) */}
      {showActions && isHovered && (
        <div className="preset-extended-actions">
          {onEdit && (
            <button
              className="extended-action"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Edit"
            >
              <Edit3 size={12} />
            </button>
          )}

          {onDuplicate && (
            <button
              className="extended-action"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              title="Duplicate"
            >
              <Copy size={12} />
            </button>
          )}

          {onShare && (
            <button
              className="extended-action"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              title="Share"
            >
              <Share2 size={12} />
            </button>
          )}

          {onDelete && (
            <button
              className="extended-action danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}

      {/* Usage Stats */}
      {preset.usageCount && (
        <div className="preset-stats">
          <span className="usage-count">
            <TrendingUp size={10} />
            {preset.usageCount}
          </span>
        </div>
      )}
    </div>
  );
};

export default PresetCard;