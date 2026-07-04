import React, { useState } from 'react';
import { Card, Typography, Row, Col, Input, Button, Table, DatePicker, Select } from 'antd';
import { EnvironmentOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const GeofencePage = () => {
  const [overrides] = useState([
    { id: 1, dealer: 'Ravi Electronics', anchor: 'Samsung', defaultRadius: 500, overrideRadius: 1000 },
    { id: 2, dealer: 'Sharma Stores', anchor: 'HUL', defaultRadius: 500, overrideRadius: 200 },
  ]);

  const [violations] = useState([
    { id: 1, datetime: '2026-07-02 10:30', rm: 'Amit Singh', dealer: 'Ravi Electronics', distance: 1200, allowed: 1000, variance: '+200m' },
    { id: 2, datetime: '2026-07-02 11:15', rm: 'Priya Sharma', dealer: 'Tata Motors', distance: 600, allowed: 500, variance: '+100m' },
  ]);

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>Geofence Configuration</Title>
      </div>

      <Row gutter={24}>
        <Col span={8}>
          <Card title="Global Default Radius">
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <EnvironmentOutlined style={{ fontSize: 64, color: '#1038CC', opacity: 0.2 }} />
            </div>
            <Input 
              type="number" 
              defaultValue={500} 
              size="large"
              addonBefore="Radius" 
              addonAfter="meters" 
            />
            <Button type="primary" block style={{ marginTop: 16 }}>Save Default</Button>
          </Card>
        </Col>

        <Col span={16}>
          <Card 
            title="Dealer Specific Overrides" 
            extra={<Button type="dashed" icon={<PlusOutlined />}>Add Override</Button>}
          >
            <Table 
              size="small"
              columns={[
                { title: 'Dealer Name', dataIndex: 'dealer' },
                { title: 'Anchor', dataIndex: 'anchor' },
                { title: 'Default Radius', dataIndex: 'defaultRadius', render: v => `${v}m` },
                { title: 'Override Radius', dataIndex: 'overrideRadius', render: v => <Input defaultValue={v} suffix="m" style={{ width: 100 }} /> },
                { title: 'Actions', render: () => <Button type="link" danger>Remove</Button> }
              ]} 
              dataSource={overrides} 
              rowKey="id" 
              pagination={false} 
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Geofence Violations" style={{ marginTop: 24 }} extra={
        <div style={{ display: 'flex', gap: 12 }}>
          <DatePicker.RangePicker />
          <Select placeholder="Select RM" style={{ width: 150 }} />
          <Button icon={<DownloadOutlined />}>Export CSV</Button>
        </div>
      }>
        <Table 
          columns={[
            { title: 'Date/Time', dataIndex: 'datetime' },
            { title: 'RM Name', dataIndex: 'rm' },
            { title: 'Dealer', dataIndex: 'dealer' },
            { title: 'Distance from Location', dataIndex: 'distance', render: v => `${v}m` },
            { title: 'Allowed Radius', dataIndex: 'allowed', render: v => `${v}m` },
            { title: 'Variance', dataIndex: 'variance', render: v => <Text type="danger" strong>{v}</Text> },
            { title: 'Action', render: () => <Button type="link">View Map</Button> }
          ]}
          dataSource={violations}
          rowKey="id"
        />
      </Card>
    </div>
  );
};
