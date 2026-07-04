import React, { useState } from 'react';
import { Table, DatePicker, Select, Input, Button, Card, Typography, Tag, Avatar } from 'antd';
import { DownloadOutlined, ExpandAltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const mockAuditLogs = [
  { id: 1, timestamp: '2026-07-02 14:32:10', actor: 'Amit Singh', role: 'RM', action: 'CREATE', entity: 'Lead #ABC123', changes: { before: null, after: { value: 25.5, stage: 'Sanction' } } },
  { id: 2, timestamp: '2026-07-02 11:15:00', actor: 'Admin User', role: 'SUPER_ADMIN', action: 'UPDATE', entity: 'Config: NBA Rule', changes: { before: { dealValue: 20 }, after: { dealValue: 15 } } },
  { id: 3, timestamp: '2026-07-01 09:00:22', actor: 'System', role: 'SYSTEM', action: 'DELETE', entity: 'Token Session', changes: null },
  { id: 4, timestamp: '2026-07-01 08:30:10', actor: 'Priya Sharma', role: 'CLUSTER_MANAGER', action: 'LOGIN', entity: 'Auth Service', changes: null },
];

export const AuditLogsPage = () => {
  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'processing';
      case 'DELETE': return 'error';
      case 'LOGIN': return 'default';
      default: return 'default';
    }
  };

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>Audit Logs</Title>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Search Actor..." style={{ width: 200 }} />
          <Select placeholder="Action Type" style={{ width: 150 }}>
            <Select.Option value="CREATE">CREATE</Select.Option>
            <Select.Option value="UPDATE">UPDATE</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
            <Select.Option value="LOGIN">LOGIN</Select.Option>
          </Select>
          <Select placeholder="Entity Type" style={{ width: 150 }} />
          <RangePicker />
          <Button type="primary">Apply Filters</Button>
          <Button icon={<DownloadOutlined />}>Export CSV</Button>
        </div>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table 
          dataSource={mockAuditLogs}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          expandable={{
            expandedRowRender: (record) => {
              if (!record.changes) return <Text type="secondary">No changes recorded for this action.</Text>;
              return (
                <div style={{ display: 'flex', gap: 24, backgroundColor: '#FAFAFA', padding: 16, borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <Text strong type="danger">Before:</Text>
                    <pre style={{ marginTop: 8, color: '#EF4444' }}>{JSON.stringify(record.changes.before, null, 2)}</pre>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong type="success">After:</Text>
                    <pre style={{ marginTop: 8, color: '#61CE70' }}>{JSON.stringify(record.changes.after, null, 2)}</pre>
                  </div>
                </div>
              );
            },
            rowExpandable: (record) => record.changes !== null,
            expandIcon: ({ expanded, onExpand, record }) => 
              record.changes ? <ExpandAltOutlined onClick={e => onExpand(record, e)} style={{ cursor: 'pointer' }} /> : null
          }}
          columns={[
            { title: 'Timestamp', dataIndex: 'timestamp' },
            { 
              title: 'Actor', 
              render: (_, r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar size="small">{r.actor.charAt(0)}</Avatar>
                  <Text>{r.actor}</Text>
                  <Tag style={{ marginLeft: 8 }}>{r.role}</Tag>
                </div>
              )
            },
            { title: 'Action', dataIndex: 'action', render: a => <Tag color={getActionColor(a)}>{a}</Tag> },
            { title: 'Entity', dataIndex: 'entity', render: e => <a>{e}</a> },
          ]}
        />
      </Card>
    </div>
  );
};
