import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Table, Tag } from 'antd';
import { ReloadOutlined, DatabaseOutlined, CloudServerOutlined, CloudOutlined, NotificationOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const mockChartData = [
  { name: 'Mon', synced: 400, failed: 24 },
  { name: 'Tue', synced: 300, failed: 13 },
  { name: 'Wed', synced: 200, failed: 98 },
  { name: 'Thu', synced: 278, failed: 39 },
  { name: 'Fri', synced: 189, failed: 48 },
  { name: 'Sat', synced: 239, failed: 38 },
  { name: 'Sun', synced: 349, failed: 43 },
];

export const IntegrationsPage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setCountdown(60);
    }, 1000);
  };

  const getStatusDot = (status) => {
    if (status === 'OK') return '#61CE70';
    if (status === 'Error') return '#EF4444';
    return '#F59E0B';
  };

  const healthData = [
    { name: 'CRM API', icon: <DatabaseOutlined />, status: 'OK', ping: '120ms' },
    { name: 'LOS API', icon: <CloudServerOutlined />, status: 'Degraded', ping: '850ms' },
    { name: 'e-KYC', icon: <SafetyCertificateOutlined />, status: 'Error', ping: 'Timeout' },
    { name: 'AWS S3', icon: <CloudOutlined />, status: 'OK', ping: '45ms' },
    { name: 'FCM', icon: <NotificationOutlined />, status: 'OK', ping: '88ms' },
    { name: 'MongoDB', icon: <DatabaseOutlined />, status: 'OK', ping: '12ms' },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>Integration Health</Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined spin={refreshing} />} 
          onClick={handleRefresh}
        >
          Refresh All (Auto in {countdown}s)
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {healthData.map(item => (
          <Col xs={24} sm={12} md={8} lg={4} key={item.name}>
            <Card bodyStyle={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 24, color: '#1038CC' }}>{item.icon}</div>
                <Text strong>{item.name}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: getStatusDot(item.status) }} />
                  <Text>{item.status}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.ping}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Card title="Sync Queue Volume (Last 7 Days)">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="synced" stackId="1" stroke="#61CE70" fill="#61CE70" />
                  <Area type="monotone" dataKey="failed" stackId="1" stroke="#EF4444" fill="#EF4444" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Failed Queue" extra={<Button type="link" danger>Retry All Failed</Button>}>
            <Table 
              size="small"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: 'RM Name', dataIndex: 'rm' },
                { title: 'Action Type', dataIndex: 'action' },
                { title: 'Error', dataIndex: 'error', render: e => <Text type="danger">{e}</Text> },
                { title: 'Retries', dataIndex: 'retries' },
                { title: 'Action', render: () => <Button size="small">Retry</Button> }
              ]}
              dataSource={[
                { id: 1, rm: 'Amit Singh', action: 'CREATE_LEAD', error: 'CRM Timeout', retries: 2 },
                { id: 2, rm: 'Priya Sharma', action: 'UPLOAD_DOC', error: 'S3 Denied', retries: 3 },
              ]}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Polyfill for missing icon
const SafetyCertificateOutlined = () => <span role="img" aria-label="safety">🛡️</span>;
