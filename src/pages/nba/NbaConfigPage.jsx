import React, { useState } from 'react';
import { Card, Slider, InputNumber, Row, Col, Typography, Button, Badge, Modal, Table, Input, Select } from 'antd';
import { WarningOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const NbaConfigPage = () => {
  const [weights, setWeights] = useState({
    dealValue: 15,
    expiry: 30,
    dpd: 20,
    geo: 10,
    stage: 25
  });

  const [previewVisible, setPreviewVisible] = useState(false);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isValid = totalWeight === 100;

  const handleChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const previewCols = [
    { title: 'Lead ID', dataIndex: 'id' },
    { title: 'Old Rank', dataIndex: 'oldRank' },
    { title: 'New Rank', dataIndex: 'newRank' },
    { title: 'Shift', render: (_, r) => {
      const diff = r.oldRank - r.newRank; // If old was 5, new is 2, diff = +3 (moved up)
      if (diff > 0) return <Text type="success"><ArrowUpOutlined /> {diff}</Text>;
      if (diff < 0) return <Text type="danger"><ArrowDownOutlined /> {Math.abs(diff)}</Text>;
      return <Text type="secondary">-</Text>;
    }}
  ];

  const previewData = [
    { id: 'L-101', oldRank: 5, newRank: 2 },
    { id: 'L-102', oldRank: 2, newRank: 5 },
    { id: 'L-103', oldRank: 3, newRank: 3 },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>NBA Rule Weights Config</Title>
        <Button type="primary" disabled={!isValid} onClick={() => setPreviewVisible(true)}>Preview & Save</Button>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="Rule Weights" extra={<Text type="secondary">Last updated: {dayjs().format('MMM D, YYYY')} by Admin</Text>}>
            {[
              { key: 'dealValue', label: 'Deal Value' },
              { key: 'expiry', label: 'Sanction Expiry Urgency' },
              { key: 'dpd', label: 'DPD Risk' },
              { key: 'geo', label: 'Geo Proximity' },
              { key: 'stage', label: 'Stage Progression' },
            ].map(item => (
              <Row key={item.key} align="middle" style={{ marginBottom: 24 }}>
                <Col span={8}><Text strong>{item.label}</Text></Col>
                <Col span={12}>
                  <Slider
                    min={0} max={100}
                    value={weights[item.key]}
                    onChange={val => handleChange(item.key, val)}
                    trackStyle={{ backgroundColor: '#1038CC' }}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={0} max={100}
                    value={weights[item.key]}
                    onChange={val => handleChange(item.key, val)}
                    addonAfter="%"
                    style={{ marginLeft: 16 }}
                  />
                </Col>
              </Row>
            ))}

            <div style={{ 
              marginTop: 32, padding: 16, borderRadius: 8, 
              backgroundColor: isValid ? '#F0F4FF' : '#FEF2F2',
              border: `1px solid ${isValid ? '#1038CC' : '#EF4444'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <Title level={4} style={{ margin: 0, color: isValid ? '#1038CC' : '#EF4444' }}>
                TOTAL WEIGHT: {totalWeight}%
              </Title>
              {!isValid && (
                <Text type="danger"><WarningOutlined /> Weights must sum to exactly 100%</Text>
              )}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Threshold Settings">
            <div style={{ marginBottom: 24 }}>
              <Text strong>Stuck Case Threshold (Days)</Text>
              <Input type="number" defaultValue={7} addonAfter="days" style={{ marginTop: 8 }} />
            </div>
            <div>
              <Text strong>Sanction Expiry Alert Thresholds</Text>
              <Select 
                mode="tags" 
                defaultValue={['3 days', '7 days']} 
                style={{ width: '100%', marginTop: 8 }} 
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Modal 
        title="Preview NBA Rank Changes" 
        open={previewVisible} 
        onCancel={() => setPreviewVisible(false)}
        okText="Confirm & Save Configuration"
        onOk={() => setPreviewVisible(false)}
        width={700}
      >
        <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
          This preview shows how the current top leads will be re-ranked based on your new weights.
        </Text>
        <Table columns={previewCols} dataSource={previewData} rowKey="id" pagination={false} size="small" />
      </Modal>
    </div>
  );
};
