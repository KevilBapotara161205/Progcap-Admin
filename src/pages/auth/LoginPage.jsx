import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import apiClient from '../../api/axiosClient';

const { Title, Text } = Typography;

export const LoginPage = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/auth/login-web', {
        email: values.email,
        password: values.password
      });
      const data = response.data;
      if (data.success && data.data.user.role === 'SUPER_ADMIN') {
        setAuth(data.data.user, data.data.accessToken);
        navigate('/dashboard');
      } else {
        setError('Unauthorized access. Only admins can log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000D31', 
      backgroundImage: 'radial-gradient(#1038CC 1px, transparent 1px)',
      backgroundSize: '32px 32px',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Card style={{ width: 400, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1038CC', margin: 0 }}>Progcap</Title>
          <Title level={4} style={{ color: '#050126', marginTop: 8 }}>Admin Panel</Title>
          <Text type="secondary">Sign in to continue</Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input size="large" placeholder="admin@progcap.com" />
          </Form.Item>
          
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password size="large" placeholder="admin123" />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: 48, marginTop: 16 }}>
            Sign In
          </Button>
        </Form>
      </Card>
    </div>
  );
};
