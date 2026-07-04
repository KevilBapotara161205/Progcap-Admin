/**
 * AIInsightCard — Admin Panel
 * Reusable card for AI-generated insights.
 * Always shows "✨ AI Generated Insight" badge.
 */
import { useState } from 'react';
import { Skeleton, Button, Tag, Divider, Alert, Tooltip } from 'antd';
import { ReloadOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';

const AILoadingState = () => (
  <div style={{ border: '1px solid #e0d7ff', borderRadius: 10, padding: '14px 16px', background: '#fafaff' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>✨ Generating AI insight...</span>
    </div>
    <Skeleton active paragraph={{ rows: 4 }} title={false} />
  </div>
);

const AIInsightCard = ({
  title = 'AI Generated Insight',
  data = null,
  isLoading = false,
  isOffline = false,
  onRefresh,
  sections = [],
  compact = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (isOffline) {
    return (
      <div style={{ border: '1px dashed #d0d0d0', borderRadius: 10, padding: 14, background: '#fafafa', display: 'flex', alignItems: 'center', gap: 10, color: '#888', fontSize: 13 }}>
        <DisconnectOutlined />
        AI insights unavailable offline. Connect to internet to use AI features.
      </div>
    );
  }

  if (isLoading) return <AILoadingState />;

  if (!data) {
    return (
      <Alert
        message="AI insight could not be generated"
        description="The AI service is temporarily unavailable. All existing features remain functional."
        type="warning"
        showIcon
        style={{ borderRadius: 10 }}
        action={onRefresh && (
          <Button size="small" type="text" icon={<ReloadOutlined />} onClick={onRefresh}>Retry</Button>
        )}
      />
    );
  }

  if (typeof data === 'string') {
    return (
      <div style={{ border: '1px solid #e0d7ff', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
        <div style={{ background: 'linear-gradient(135deg, #f3f0ff, #ede9fe)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>✨ AI Generated Insight</Tag>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95' }}>{title}</span>
          </div>
          {onRefresh && <Button size="small" type="text" icon={<ReloadOutlined />} onClick={onRefresh} />}
        </div>
        <div style={{ padding: '12px 16px', fontSize: 13, lineHeight: 1.7, color: '#333' }}>{data}</div>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #e0d7ff', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      <div style={{ background: 'linear-gradient(135deg, #f3f0ff, #ede9fe)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>✨ AI Generated Insight</Tag>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {onRefresh && <Tooltip title="Regenerate"><Button size="small" type="text" icon={<ReloadOutlined />} onClick={onRefresh} /></Tooltip>}
          <Button size="small" type="text" onClick={() => setCollapsed(!collapsed)}>{collapsed ? '▼' : '▲'}</Button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: compact ? '10px 14px' : '14px 16px' }}>
          {sections.map((section, idx) => {
            const value = data[section.key];
            if (!value) return null;
            return (
              <div key={section.key}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: section.color || '#555' }}>
                    {section.label}
                  </span>
                  <div style={{ fontSize: 12, color: '#333', marginTop: 3, lineHeight: 1.65 }}>
                    {Array.isArray(value) ? (
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {value.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    ) : (
                      <span>{value}</span>
                    )}
                  </div>
                </div>
                {idx < sections.length - 1 && <Divider style={{ margin: '8px 0' }} />}
              </div>
            );
          })}
          <div style={{ marginTop: 10, fontSize: 10, color: '#aaa', textAlign: 'right' }}>
            AI-generated · Not official data · Based on system records only
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightCard;
