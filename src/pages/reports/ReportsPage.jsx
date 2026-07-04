import React, { useState } from 'react';
import { Row, Col, Card, Typography, Button, Collapse, Radio, Checkbox, DatePicker, Table, Drawer, Input, Select, Switch, Space, Modal, Form } from 'antd';
import { BarChartOutlined, LineChartOutlined, DownloadOutlined, SettingOutlined, ScheduleOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const ReportsPage = () => {
  const [reportModal, setReportModal] = useState(false);
  const [scheduleDrawer, setScheduleDrawer] = useState(false);

  const prebuilt = [
    { title: 'RM Performance', desc: 'Monthly target vs achievement per RM' },
    { title: 'Pipeline Summary', desc: 'Current leads grouped by stage and anchor' },
    { title: 'KYC Completion', desc: 'Document upload and verification status' },
    { title: 'Sync Health', desc: 'Daily offline sync success/failure rates' },
    { title: 'Geofence Violations', desc: 'List of check-in violations by RM' },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>Reports & Analytics</Title>
      </div>

      <Title level={5} style={{ marginBottom: 16 }}>Pre-built Reports</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {prebuilt.map(r => (
          <Col xs={24} sm={12} md={8} lg={4} key={r.title}>
            <Card 
              hoverable 
              bodyStyle={{ padding: 16, textAlign: 'center' }}
              style={{ height: '100%', borderRadius: 16 }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#F0F4FF', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChartOutlined style={{ fontSize: 24, color: '#1038CC' }} />
              </div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>{r.title}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{r.desc}</Text>
              <Button type="primary" block style={{ marginTop: 16 }} onClick={() => setReportModal(true)}>Generate</Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Collapse style={{ marginBottom: 32 }}>
        <Collapse.Panel header={<Text strong>Custom Report Builder</Text>} key="1">
          <Row gutter={24}>
            <Col span={6}>
              <Text strong>1. Select Entity</Text>
              <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                <Radio value="leads">Leads</Radio>
                <Radio value="visits">Visits</Radio>
                <Radio value="users">Users</Radio>
                <Radio value="kyc">KYC</Radio>
              </Radio.Group>
            </Col>
            <Col span={10}>
              <Text strong>2. Select Columns</Text>
              <Checkbox.Group style={{ width: '100%', marginTop: 12 }}>
                <Row gutter={[8,8]}>
                  {['ID', 'Date Created', 'RM Name', 'Anchor', 'Dealer Name', 'Value', 'Status'].map(c => (
                    <Col span={12} key={c}><Checkbox value={c}>{c}</Checkbox></Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Col>
            <Col span={8}>
              <Text strong>3. Apply Filters</Text>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <RangePicker style={{ width: '100%' }} />
                <Select placeholder="Filter by Anchor" />
              </div>
              <div style={{ marginTop: 24 }}>
                <Text strong>4. Format</Text>
                <Radio.Group defaultValue="csv" style={{ display: 'block', margin: '8px 0 16px' }}>
                  <Radio.Button value="csv">CSV</Radio.Button>
                  <Radio.Button value="pdf">PDF</Radio.Button>
                </Radio.Group>
                <Button type="primary" block icon={<DownloadOutlined />} onClick={() => toast.success('Downloading report...')}>Generate & Download</Button>
              </div>
            </Col>
          </Row>
        </Collapse.Panel>
      </Collapse>

      <Card title="Scheduled Reports" extra={<Button icon={<ScheduleOutlined />} onClick={() => setScheduleDrawer(true)}>Schedule New Report</Button>}>
        <Table 
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Report Type', dataIndex: 'type' },
            { title: 'Schedule', dataIndex: 'schedule' },
            { title: 'Format', dataIndex: 'format' },
            { title: 'Last Sent', dataIndex: 'lastSent' },
            { title: 'Recipients', dataIndex: 'recipients' },
            { title: 'Active', render: () => <Switch defaultChecked /> },
          ]}
          dataSource={[
            { id: 1, name: 'Weekly Performance', type: 'RM Performance', schedule: 'Weekly (Monday 8AM)', format: 'PDF', lastSent: '2026-06-29 08:00', recipients: 'management@progcap.com' }
          ]}
          rowKey="id"
        />
      </Card>

      <Modal title="Generate Pre-built Report" open={reportModal} onCancel={() => setReportModal(false)} onOk={() => { toast.success('Report generated'); setReportModal(false); }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RangePicker />
          <Radio.Group defaultValue="csv">
            <Radio value="csv">Download as CSV</Radio>
            <Radio value="pdf">Download as PDF</Radio>
          </Radio.Group>
        </div>
      </Modal>

      <Drawer title="Schedule New Report" width={400} open={scheduleDrawer} onClose={() => setScheduleDrawer(false)}>
        <Form layout="vertical">
          <Form.Item label="Report Name"><Input /></Form.Item>
          <Form.Item label="Report Type"><Select options={prebuilt.map(p => ({label: p.title, value: p.title}))} /></Form.Item>
          <Form.Item label="Schedule">
            <Select defaultValue="weekly_mon" options={[{label: 'Daily at 8 AM', value: 'daily_8'}, {label: 'Weekly on Monday', value: 'weekly_mon'}]} />
          </Form.Item>
          <Form.Item label="Format"><Select defaultValue="pdf" options={[{label: 'PDF', value: 'pdf'}, {label: 'CSV', value: 'csv'}]} /></Form.Item>
          <Form.Item label="Recipients (comma separated)"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" block onClick={() => { toast.success('Report Scheduled'); setScheduleDrawer(false); }}>Save Schedule</Button>
        </Form>
      </Drawer>
    </div>
  );
};
