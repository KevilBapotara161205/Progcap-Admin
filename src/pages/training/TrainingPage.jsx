import React, { useState } from 'react';
import { Row, Col, Card, Typography, Table, Button, Drawer, Form, Input, Select, Radio, Upload, Space, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, PieChartOutlined, UploadOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

export const TrainingPage = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [completionsVisible, setCompletionsVisible] = useState(false);
  const [moduleType, setModuleType] = useState('VIDEO');
  const [questions, setQuestions] = useState([{ q: '', opts: ['', ''], ans: 0 }]);

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>Training Content</Title>
      </div>

      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}><Card><Text type="secondary">Total Modules</Text><Title level={2} style={{ margin: 0, color: '#1038CC' }}>12</Title></Card></Col>
        <Col span={8}><Card><Text type="secondary">Avg. Completion Rate</Text><Title level={2} style={{ margin: 0, color: '#61CE70' }}>78%</Title></Card></Col>
        <Col span={8}><Card><Text type="secondary">Pending Completions</Text><Title level={2} style={{ margin: 0, color: '#F59E0B' }}>45</Title></Card></Col>
      </Row>

      <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>Add Module</Button>}>
        <Table 
          columns={[
            { title: 'Title', dataIndex: 'title' },
            { title: 'Type', dataIndex: 'type' },
            { title: 'Assigned', dataIndex: 'assigned' },
            { title: 'Completion %', dataIndex: 'completion', render: v => `${v}%` },
            { title: 'Active', render: () => <Switch defaultChecked /> },
            { 
              title: 'Actions', 
              render: () => (
                <Space>
                  <Button type="text" icon={<PieChartOutlined />} onClick={() => setCompletionsVisible(true)} />
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Space>
              ) 
            },
          ]}
          dataSource={[
            { id: 1, title: 'Dealer Onboarding Guide', type: 'VIDEO', assigned: 142, completion: 85 },
            { id: 2, title: 'KYC Compliance Quiz', type: 'QUIZ', assigned: 142, completion: 40 },
          ]}
          rowKey="id"
        />
      </Card>

      <Drawer title="Add Training Module" width={600} open={drawerVisible} onClose={() => setDrawerVisible(false)}>
        <Form layout="vertical">
          <Form.Item label="Title" required><Input /></Form.Item>
          <Form.Item label="Description"><Input.TextArea rows={3} /></Form.Item>
          
          <Form.Item label="Content Type">
            <Radio.Group value={moduleType} onChange={e => setModuleType(e.target.value)}>
              <Radio.Button value="VIDEO">Video Link</Radio.Button>
              <Radio.Button value="PDF">PDF Upload</Radio.Button>
              <Radio.Button value="QUIZ">Interactive Quiz</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Card style={{ backgroundColor: '#FAFAFA', marginBottom: 24 }}>
            {moduleType === 'VIDEO' && (
              <Form.Item label="YouTube/Vimeo URL" required>
                <Input placeholder="https://..." />
              </Form.Item>
            )}
            
            {moduleType === 'PDF' && (
              <Upload.Dragger>
                <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                <p className="ant-upload-text">Click or drag PDF to this area to upload</p>
              </Upload.Dragger>
            )}

            {moduleType === 'QUIZ' && (
              <div>
                {questions.map((q, idx) => (
                  <Card key={idx} size="small" style={{ marginBottom: 16 }}>
                    <Form.Item label={`Question ${idx + 1}`}><Input /></Form.Item>
                    <Row gutter={8}>
                      <Col span={12}><Form.Item label="Option 1"><Input /></Form.Item></Col>
                      <Col span={12}><Form.Item label="Option 2"><Input /></Form.Item></Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" block onClick={() => setQuestions([...questions, { q: '', opts: ['', ''], ans: 0 }])}>+ Add Question</Button>
              </div>
            )}
          </Card>

          <Form.Item label="Assign To" required>
            <Select mode="multiple" defaultValue={['all_new']} options={[
              { value: 'all_new', label: 'All New Joinees' },
              { value: 'north', label: 'North Region' },
            ]} />
          </Form.Item>

          <Button type="primary" block onClick={() => { toast.success('Module saved'); setDrawerVisible(false); }}>Save Module</Button>
        </Form>
      </Drawer>

      <Drawer title="Completion Tracker" width={500} open={completionsVisible} onClose={() => setCompletionsVisible(false)}>
        <div style={{ height: 250, marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[{name: 'Completed', value: 85}, {name: 'Pending', value: 57}]} innerRadius={60} outerRadius={80} dataKey="value">
                <Cell fill="#61CE70" />
                <Cell fill="#F59E0B" />
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button type="primary">Send Reminder to Pending</Button>
        </div>
        
        <Table 
          size="small"
          columns={[
            { title: 'RM Name', dataIndex: 'name' },
            { title: 'Status', dataIndex: 'status', render: v => <Text type={v === 'Completed' ? 'success' : 'warning'}>{v}</Text> },
            { title: 'Score', dataIndex: 'score' },
          ]}
          dataSource={[
            { id: 1, name: 'Amit Singh', status: 'Completed', score: '90%' },
            { id: 2, name: 'Priya Sharma', status: 'Pending', score: '-' },
          ]}
        />
      </Drawer>
    </div>
  );
};
