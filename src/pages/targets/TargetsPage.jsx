import React, { useState } from 'react';
import { Table, DatePicker, Button, Typography, Progress, InputNumber, Row, Col, Card, Collapse, Modal, Radio, Input } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const mockTargets = [
  { id: 1, rmName: 'Amit Singh', cluster: 'North-1', region: 'North', target: 100, achieved: 120, rampUp: null },
  { id: 2, rmName: 'Rahul Kumar', cluster: 'South-1', region: 'South', target: 50, achieved: 20, rampUp: 'Month 2' },
];

export const TargetsPage = () => {
  const [data, setData] = useState(mockTargets);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);

  const columns = [
    { title: 'RM Name', dataIndex: 'rmName' },
    { title: 'Cluster', dataIndex: 'cluster' },
    { title: 'Region', dataIndex: 'region' },
    { 
      title: 'Monthly Target (₹L)', 
      dataIndex: 'target',
      render: (val, record) => (
        <InputNumber 
          defaultValue={val} 
          onBlur={(e) => {
            const newVal = Number(e.target.value);
            setData(data.map(d => d.id === record.id ? {...d, target: newVal} : d));
          }}
        />
      )
    },
    {
      title: 'Achievement %',
      render: (_, record) => {
        const percent = Math.round((record.achieved / record.target) * 100);
        let color = '#EF4444'; // red
        if (percent >= 100) color = '#61CE70'; // green
        else if (percent >= 70) color = '#F59E0B'; // amber
        
        return <Progress percent={percent} strokeColor={color} />;
      }
    },
    { title: 'Ramp-Up', dataIndex: 'rampUp', render: val => val ? <Text type="secondary">{val}</Text> : '-' },
    { title: 'Actions', render: () => <Button type="link">History</Button> }
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>Targets Management</Title>
        <div style={{ display: 'flex', gap: 12 }}>
          <DatePicker picker="month" defaultValue={dayjs()} />
          <Button icon={<DownloadOutlined />}>Bulk Upload</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setBulkModalVisible(true)}>Set Targets</Button>
        </div>
      </div>

      <Collapse style={{ marginBottom: 24 }}>
        <Collapse.Panel header={<Text strong>Ramp-Up Settings for New Joinees</Text>} key="1">
          <Row gutter={24}>
            <Col span={8}>
              <Text>Month 1 Multiplier</Text><br/>
              <InputNumber defaultValue={25} min={0} max={100} addonAfter="%" />
            </Col>
            <Col span={8}>
              <Text>Month 2 Multiplier</Text><br/>
              <InputNumber defaultValue={50} min={0} max={100} addonAfter="%" />
            </Col>
            <Col span={8}>
              <Text>Month 3 Multiplier</Text><br/>
              <InputNumber defaultValue={75} min={0} max={100} addonAfter="%" />
            </Col>
          </Row>
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#F0F4FF', borderRadius: 8 }}>
            <Text>Preview: For a standard ₹100L target, Month 1 target will be ₹25L.</Text>
          </div>
        </Collapse.Panel>
      </Collapse>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 20 }} />
      </Card>

      <Modal title="Bulk Set Targets" open={bulkModalVisible} onCancel={() => setBulkModalVisible(false)}>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Apply target to:</Text>
          <Radio.Group style={{ display: 'block', marginTop: 8 }}>
            <Radio value="all">All RMs</Radio>
            <Radio value="cluster">Select Cluster</Radio>
            <Radio value="region">Select Region</Radio>
          </Radio.Group>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Target Amount (₹L)</Text>
          <Input type="number" placeholder="e.g. 100" style={{ marginTop: 8 }} />
        </div>
      </Modal>
    </div>
  );
};
