import React, { useState } from 'react';
import { Layout, Menu, Card, Form, Input, Radio, Switch, Button, Select, Typography, Space } from 'antd';
import { MessageOutlined, BellOutlined, ApiOutlined, SafetyCertificateOutlined, MobileOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import toast from 'react-hot-toast';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export const SystemConfigPage = () => {
  const [activeMenu, setActiveMenu] = useState('otp');

  const menuItems = [
    { key: 'otp', icon: <MessageOutlined />, label: 'OTP Provider' },
    { key: 'fcm', icon: <BellOutlined />, label: 'FCM (Push)' },
    { key: 'crm', icon: <ApiOutlined />, label: 'CRM / LOS API' },
    { key: 'ekyc', icon: <SafetyCertificateOutlined />, label: 'e-KYC' },
    { key: 'app', icon: <MobileOutlined />, label: 'App Version' },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'otp':
        return (
          <Card title="OTP Provider Configuration">
            <Form layout="vertical">
              <Form.Item label="Provider">
                <Radio.Group defaultValue="msg91">
                  <Radio value="msg91">MSG91</Radio>
                  <Radio value="twilio">Twilio</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="API Key">
                <Input.Password 
                  defaultValue="abc123secretkey" 
                  iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
              <Form.Item label="Sender ID / Template ID">
                <Input defaultValue="PRGCAP" />
              </Form.Item>
              <Space>
                <Button type="primary">Save Config</Button>
                <Button onClick={() => toast.success('Test OTP Sent Successfully!')}>Test OTP</Button>
              </Space>
            </Form>
          </Card>
        );
      case 'fcm':
        return (
          <Card title="Firebase Cloud Messaging">
            <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#F0FDF4', border: '1px solid #61CE70', borderRadius: 8 }}>
              <Text strong style={{ color: '#047857' }}>✓ Service Account Configured</Text>
            </div>
            <Space>
              <Button type="primary">Re-upload JSON Key</Button>
              <Button onClick={() => toast.success('Test Push Notification Sent')}>Test Notification</Button>
            </Space>
          </Card>
        );
      case 'crm':
        return (
          <Card title="CRM / LOS Integration">
            <Form layout="vertical">
              <Title level={5}>CRM API</Title>
              <Form.Item label="Base URL"><Input defaultValue="https://crm.progcap.internal/api" /></Form.Item>
              <Form.Item label="API Key"><Input.Password defaultValue="secret_crm_key" /></Form.Item>
              <Button style={{ marginBottom: 24 }}>Test CRM Connection</Button>

              <Title level={5}>LOS API</Title>
              <Form.Item label="Base URL"><Input defaultValue="https://los.progcap.internal/api" /></Form.Item>
              <Form.Item label="API Key"><Input.Password defaultValue="secret_los_key" /></Form.Item>
              <Button style={{ marginBottom: 24 }}>Test LOS Connection</Button>

              <Form.Item label="Sync Interval">
                <Select defaultValue="15m" style={{ width: 200 }}>
                  <Select.Option value="5m">Every 5 minutes</Select.Option>
                  <Select.Option value="10m">Every 10 minutes</Select.Option>
                  <Select.Option value="15m">Every 15 minutes</Select.Option>
                  <Select.Option value="30m">Every 30 minutes</Select.Option>
                </Select>
              </Form.Item>
              <Button type="primary">Save Config</Button>
            </Form>
          </Card>
        );
      case 'ekyc':
        return (
          <Card title="e-KYC Configuration">
            <Form layout="vertical">
              <Form.Item label="Enable e-KYC">
                <Switch defaultChecked />
              </Form.Item>
              <Form.Item label="Provider">
                <Radio.Group defaultValue="karza">
                  <Radio value="mock">Mock (Testing)</Radio>
                  <Radio value="karza">Karza</Radio>
                  <Radio value="signzy">Signzy</Radio>
                  <Radio value="digilocker">DigiLocker</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="API Key"><Input.Password defaultValue="karza_key_123" /></Form.Item>
              <Button type="primary">Save Config</Button>
            </Form>
          </Card>
        );
      case 'app':
        return (
          <Card title="App Version Control">
            <Form layout="vertical">
              <Form.Item label="Minimum App Version">
                <Input defaultValue="1.2.0" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item label="Force Update">
                <Switch />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">When enabled, users on older versions must update before using the app.</Text>
                </div>
              </Form.Item>
              <Button type="primary">Save Config</Button>
            </Form>
          </Card>
        );
      default: return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>System Configuration</Title>
      </div>
      
      <Layout style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <Sider width={200} style={{ background: '#FAFAFA', borderRight: '1px solid #E5E7EB' }}>
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            items={menuItems}
            onClick={(e) => setActiveMenu(e.key)}
            style={{ height: '100%', borderRight: 0, backgroundColor: 'transparent' }}
          />
        </Sider>
        <Content style={{ padding: 24, minHeight: 400 }}>
          {renderContent()}
        </Content>
      </Layout>
    </div>
  );
};
