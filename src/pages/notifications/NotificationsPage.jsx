import React, { useState } from 'react';
import { Tabs, Table, Button, Card, Typography, Drawer, Form, Input, Select, Tag, Row, Col, Space } from 'antd';
import { PlusOutlined, SendOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

export const NotificationsPage = () => {
  const [templateDrawer, setTemplateDrawer] = useState(false);

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>Notification Management</Title>
      </div>

      <Card>
        <Tabs
          defaultActiveKey="broadcast"
          items={[
            {
              key: 'broadcast',
              label: 'Broadcast',
              children: (
                <Row gutter={24}>
                  <Col span={14}>
                    <Form layout="vertical" onFinish={() => toast.success('Broadcast Sent!')}>
                      <Form.Item label="Target Audience" required>
                        <Select mode="multiple" defaultValue={['all']} options={[
                          { value: 'all', label: 'All RMs' },
                          { value: 'north', label: 'North Region' },
                          { value: 'new', label: 'New Joinees (< 30 days)' },
                        ]} />
                      </Form.Item>
                      <Form.Item label="Notification Title" required><Input /></Form.Item>
                      <Form.Item label="Message Body" required><Input.TextArea rows={4} showCount maxLength={200} /></Form.Item>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">This will send to ~47 users.</Text>
                      </div>
                      <Button type="primary" icon={<SendOutlined />} htmlType="submit">Send Broadcast</Button>
                    </Form>
                  </Col>
                  <Col span={10}>
                    <Title level={5}>Recent Broadcasts</Title>
                    <Table 
                      size="small"
                      pagination={false}
                      columns={[
                        { title: 'Title', dataIndex: 'title' },
                        { title: 'Target', dataIndex: 'target' },
                        { title: 'Status', render: () => <Tag color="success">Sent</Tag> }
                      ]}
                      dataSource={[
                        { id: 1, title: 'App Maintenance', target: 'All RMs' },
                        { id: 2, title: 'New Target Assigned', target: 'North Region' },
                      ]}
                    />
                  </Col>
                </Row>
              )
            },
            {
              key: 'templates',
              label: 'Templates',
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setTemplateDrawer(true)}>Add Template</Button>
                  </div>
                  <Table 
                    columns={[
                      { title: 'Type', dataIndex: 'type' },
                      { title: 'Title', dataIndex: 'title' },
                      { title: 'Body Preview', dataIndex: 'body' },
                      { title: 'Active', dataIndex: 'active', render: () => <Tag color="blue">Active</Tag> },
                      { title: 'Actions', render: () => <Space><Button type="link">Edit</Button></Space> }
                    ]}
                    dataSource={[
                      { id: 1, type: 'Lead Assigned', title: 'New Lead: {{dealer_name}}', body: 'You have been assigned a new lead...' },
                      { id: 2, type: 'Target Reminder', title: 'Target Update', body: 'You are {{percent}}% away from your goal.' },
                    ]}
                    rowKey="id"
                  />
                </div>
              )
            },
            {
              key: 'logs',
              label: 'Delivery Logs',
              children: (
                <Table 
                  columns={[
                    { title: 'Notification Title', dataIndex: 'title' },
                    { title: 'Type', dataIndex: 'type' },
                    { title: 'Sent At', dataIndex: 'sentAt' },
                    { title: 'Recipients', dataIndex: 'total' },
                    { title: 'Delivered', dataIndex: 'delivered', render: v => <Text type="success">{v}</Text> },
                    { title: 'Failed', dataIndex: 'failed', render: v => <Text type="danger">{v}</Text> },
                  ]}
                  dataSource={[
                    { id: 1, title: 'App Maintenance', type: 'Broadcast', sentAt: '2026-07-01 10:00', total: 142, delivered: 140, failed: 2 },
                  ]}
                  rowKey="id"
                />
              )
            }
          ]}
        />
      </Card>

      <Drawer title="Add Template" open={templateDrawer} onClose={() => setTemplateDrawer(false)} width={500}>
        <Form layout="vertical">
          <Form.Item label="Trigger Type"><Select options={[{label: 'Lead Assigned', value: 'lead'}]} /></Form.Item>
          <Form.Item label="Title Template"><Input /></Form.Item>
          <Form.Item label="Body Template">
            <Input.TextArea rows={4} />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ marginRight: 8 }}>Variables:</Text>
              <Tag style={{ cursor: 'pointer' }}>{`{{user_name}}`}</Tag>
              <Tag style={{ cursor: 'pointer' }}>{`{{dealer_name}}`}</Tag>
              <Tag style={{ cursor: 'pointer' }}>{`{{value}}`}</Tag>
            </div>
          </Form.Item>
          <Button type="primary" block onClick={() => { toast.success('Template saved'); setTemplateDrawer(false); }}>Save Template</Button>
        </Form>
      </Drawer>
    </div>
  );
};
