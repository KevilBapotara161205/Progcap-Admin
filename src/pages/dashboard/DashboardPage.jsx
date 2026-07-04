import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Skeleton, Button, Table, Tag, Switch, Input, Space, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { SyncOutlined, ReloadOutlined, EditOutlined, CheckOutlined, CloseOutlined, ThunderboltOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import { getAdminInsights } from '../../api/aiApi';
import AIInsightCard from '../../components/AI/AIInsightCard';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

import apiClient from '../../api/axiosClient';

const fetchDashboardData = async () => {
  const res = await apiClient.get('/dashboard/summary');
  return res.data.data;
};

const CountUp = ({ end, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(end * percentage));
      
      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count}</span>;
};

export const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editVersion, setEditVersion] = useState(false);
  const [minVersion, setMinVersion] = useState('1.0.0');
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTriggered, setAiTriggered] = useState(false);

  const handleGenerateAdminInsights = async () => {
    setAiTriggered(true);
    setAiLoading(true);
    const result = await getAdminInsights();
    setAiInsight(result);
    setAiLoading(false);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (data?.appVersion?.minVersion) {
      setMinVersion(data.appVersion.minVersion);
    }
  }, [data]);

  const syncData = data ? [
    { name: 'Pending', value: data.syncQueue.pending, color: '#F59E0B' },
    { name: 'Synced', value: data.syncQueue.synced, color: '#61CE70' },
    { name: 'Failed', value: data.syncQueue.failed, color: '#EF4444' },
  ] : [];

  const handleVersionSave = () => {
    setEditVersion(false);
    toast.success('App version updated successfully');
  };

  const getStatusColor = (status) => {
    if (status === 'OK') return '#61CE70';
    if (status === 'Error') return '#EF4444';
    return '#F59E0B';
  };

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>System Dashboard</Title>
        <Text type="secondary">{dayjs(currentTime).format('MMM D, YYYY h:mm A')}</Text>
      </div>

      {/* ROW 1 - STATS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="dark-card" style={{ height: '100%' }}>
            {isLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
              <>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Total Active RMs</Text>
                <div style={{ fontSize: 36, fontWeight: 'bold', color: '#61CE70', marginTop: 8 }}>
                  <CountUp end={data.stats.activeRMs} />
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>field agents</Text>
              </>
            )}
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card className="dark-card" style={{ height: '100%' }}>
            {isLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
              <>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Leads in Pipeline</Text>
                <div style={{ fontSize: 36, fontWeight: 'bold', color: '#1038CC', marginTop: 8 }}>
                  <CountUp end={data.stats.leadsPipeline} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <Tag color="warning" bordered={false}>{data.stats.stuckLeads} stuck</Tag>
                  <Tag color="error" bordered={false}>{data.stats.urgentLeads} urgent</Tag>
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="dark-card" style={{ height: '100%' }}>
            {isLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
              <>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Today's Check-Ins</Text>
                <div style={{ fontSize: 36, fontWeight: 'bold', color: '#fff', marginTop: 8 }}>
                  <CountUp end={data.stats.todayCheckIns} />
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="dark-card" style={{ height: '100%', border: data?.stats.failedSyncs > 0 ? '1px solid #EF4444' : 'none' }}>
            {isLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
              <>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Failed Syncs</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: 36, fontWeight: 'bold', color: data.stats.failedSyncs > 0 ? '#EF4444' : '#61CE70', marginTop: 8 }}>
                    <CountUp end={data.stats.failedSyncs} />
                  </div>
                  {data.stats.failedSyncs > 0 && (
                    <Button type="link" danger style={{ padding: 0 }}>Retry All</Button>
                  )}
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="dark-card" style={{ height: '100%' }}>
            {isLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
              <>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Active RBH Users</Text>
                <div style={{ fontSize: 36, fontWeight: 'bold', color: '#F59E0B', marginTop: 8 }}>
                  <CountUp end={data.stats.activeRBH} />
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="dark-card" style={{ height: '100%' }}>
            {isLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
              <>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Anchors Onboarded</Text>
                <div style={{ fontSize: 36, fontWeight: 'bold', color: '#fff', marginTop: 8 }}>
                  <CountUp end={data.stats.anchorsOnboarded} />
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* ROW 2 - SERVER HEALTH */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0 }}>Integration Health</Title>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()}>Check All</Button>
        </div>
        <Row gutter={[16, 16]}>
          {data?.health.map(item => (
            <Col xs={12} sm={8} md={4} key={item.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: getStatusColor(item.status) }} />
                <Text strong>{item.name}</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item.lastChecked).format('HH:mm:ss')}</Text>
            </Col>
          ))}
        </Row>
      </Card>

      {/* ROW 3 - SYNC QUEUE & AUDIT LOG */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={10}>
          <Card title="Sync Queue Stats" style={{ height: '100%' }}>
            {data && (
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={syncData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {syncData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} md={14}>
          <Card title="Recent Audit Log" extra={<a href="/audit-logs">View Full Log</a>} style={{ height: '100%' }}>
            <Table 
              dataSource={data?.auditLogs || []} 
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'Actor', dataIndex: 'actor' },
                { title: 'Action', dataIndex: 'action', render: (val) => <Tag>{val}</Tag> },
                { title: 'Entity', dataIndex: 'entity' },
                { title: 'Time', dataIndex: 'time', render: (val) => dayjs(val).fromNow() }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* ROW 4 - APP VERSION */}
      <Card style={{ backgroundColor: '#FAFAFA', border: '1px solid #E5E7EB' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Text strong>Minimum App Version:</Text>
              {editVersion ? (
                <Space>
                  <Input value={minVersion} onChange={e => setMinVersion(e.target.value)} style={{ width: 100 }} />
                  <Button type="primary" icon={<CheckOutlined />} size="small" onClick={handleVersionSave} />
                  <Button icon={<CloseOutlined />} size="small" onClick={() => setEditVersion(false)} />
                </Space>
              ) : (
                <Space>
                  <Text>{minVersion}</Text>
                  <EditOutlined style={{ color: '#1038CC', cursor: 'pointer' }} onClick={() => setEditVersion(true)} />
                </Space>
              )}
            </div>
          </Col>
          <Col>
            <Space>
              <Text strong>Force Update:</Text>
              <Switch checked={data?.appVersion?.forceUpdate} onChange={(checked) => {
                if (checked) toast.error('Warning: This will block older versions from accessing the app!', { icon: '⚠️' });
                else toast.success('Force update disabled');
              }} />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ── AI Platform Intelligence ── */}
      <Divider style={{ margin: '24px 0 16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <Text strong style={{ fontSize: 14 }}>Platform AI Intelligence Report</Text>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>Powered by Gemini AI</Text>
        </div>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={handleGenerateAdminInsights}
          loading={aiLoading}
          style={{ background: '#7c3aed', borderColor: '#7c3aed', fontSize: 12, height: 32 }}
          size="small"
        >
          {aiTriggered ? 'Regenerate' : 'Generate AI Report'}
        </Button>
      </div>
      {aiTriggered && (
        <AIInsightCard
          title="Platform Health Intelligence"
          data={aiInsight?.insights ?? null}
          isLoading={aiLoading}
          onRefresh={handleGenerateAdminInsights}
          sections={[
            { label: 'System Health', key: 'systemHealthSummary' },
            { label: 'Active User Insights', key: 'activeUserInsights', color: '#1038CC' },
            { label: 'Pipeline Health', key: 'pipelineHealth' },
            { label: 'Anchor & Dealer Growth', key: 'anchorDealerGrowth', color: '#389e0d' },
            { label: 'KYC Completion', key: 'kycCompletionStatus' },
            { label: 'Operational Alerts', key: 'operationalAlerts', color: '#cf1322' },
            { label: 'Strategic Recommendations', key: 'strategicRecommendations', color: '#531dab' },
          ]}
        />
      )}
    </div>
  );
};
