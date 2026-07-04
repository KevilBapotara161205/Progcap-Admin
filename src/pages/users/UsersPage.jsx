import React, { useState } from 'react';
import { Table, Button, Input, Select, Form, Tag, Switch, Drawer, Row, Col, Modal, Upload, Avatar, Typography, Divider, Statistic, Tooltip, Card } from 'antd';
import { PlusOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, SyncOutlined, InboxOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axiosClient';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export const UsersPage = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);

  // Fetch Org Data for Mapping
  const { data: orgData } = useQuery({
    queryKey: ['orgHierarchy'],
    queryFn: async () => {
      const res = await apiClient.get('/org/hierarchy');
      return res.data;
    }
  });

  // Fetch Users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', currentPage, filters],
    queryFn: async () => {
      const params = { page: currentPage, limit: 10, ...filters };
      const res = await apiClient.get('/users', { params });
      return res.data; // { data: [], total, page, limit }
    }
  });

  const createMutation = useMutation({
    mutationFn: (newUser) => apiClient.post('/users', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setDrawerVisible(false);
      form.resetFields();
      toast.success('User created successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => apiClient.patch(`/users/${editingUser._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setDrawerVisible(false);
      setEditingUser(null);
      form.resetFields();
      toast.success('User updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  });

  const handleEdit = (record) => {
    setEditingUser(record);
    setSelectedRole(record.role);
    form.setFieldsValue({
      name: record.name,
      phone: record.phone.replace('+91', ''),
      email: record.email,
      role: record.role,
      territory: record.territory?._id || record.territory,
    });
    setDrawerVisible(true);
  };

  // Update Status Mutation (Soft Delete / Status change)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => apiClient.patch(`/users/${id}`, { status: status ? 'ACTIVE' : 'INACTIVE' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update status')
  });

  const getRoleColor = (role) => {
    switch(role) {
      case 'SUPER_ADMIN': return '#000D31';
      case 'RBH': return '#1038CC';
      case 'CLUSTER_MANAGER': return '#61CE70';
      case 'RM': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar>{text ? text.charAt(0) : 'U'}</Avatar>
          <Text strong>{text}</Text>
        </div>
      )
    },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Email', dataIndex: 'email' },
    { 
      title: 'Role', 
      dataIndex: 'role',
      render: (role) => <Tag color={getRoleColor(role)}>{role}</Tag>
    },
    { 
      title: 'Territory', 
      dataIndex: 'territory',
      render: (territory) => territory?.name || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status, record) => (
        <Switch 
          checked={status === 'ACTIVE'} 
          checkedChildren="Active" 
          unCheckedChildren="Inactive"
          onChange={(checked) => statusMutation.mutate({ id: record._id, status: checked })}
        />
      )
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="View X-Ray">
            <Button type="text" icon={<EyeOutlined />} onClick={() => {
              setViewingUser(record);
              setViewDrawerVisible(true);
            }} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => {
              Modal.confirm({
                title: 'Delete User?',
                content: 'Are you sure you want to permanently delete this user?',
                okText: 'Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: () => deleteMutation.mutate(record._id)
              });
            }} />
          </Tooltip>
          <Tooltip title="Reset Password">
            <Button type="text" icon={<SyncOutlined />} />
          </Tooltip>
        </div>
      )
    }
  ];

  const onAddUser = (values) => {
    if (editingUser) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>User Management</Title>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={<DownloadOutlined />} onClick={() => setImportModalVisible(true)}>Bulk Import</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingUser(null); form.resetFields(); setSelectedRole(null); setDrawerVisible(true); }}>Add User</Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={usersData?.data || []} 
        rowKey="_id"
        loading={isLoading}
        pagination={{ 
          current: currentPage,
          total: usersData?.total || 0,
          onChange: (page) => setCurrentPage(page)
        }}
        style={{ backgroundColor: 'white', borderRadius: 8 }}
      />

      {/* ADD USER DRAWER */}
      <Drawer
        title={editingUser ? "Edit User" : "Add New User"}
        width={480}
        onClose={() => { setDrawerVisible(false); setEditingUser(null); form.resetFields(); setSelectedRole(null); }}
        open={drawerVisible}
      >
        <Form form={form} layout="vertical" onFinish={onAddUser}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email Address">
                <Input type="email" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select onChange={(val) => setSelectedRole(val)}>
              <Select.Option value="SUPER_ADMIN">Super Admin</Select.Option>
              <Select.Option value="RBH">RBH</Select.Option>
              <Select.Option value="CLUSTER_MANAGER">Cluster Manager</Select.Option>
              <Select.Option value="RM">RM</Select.Option>
            </Select>
          </Form.Item>

          {['RBH', 'CLUSTER_MANAGER'].includes(selectedRole) && !editingUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}

          {selectedRole && selectedRole !== 'SUPER_ADMIN' && (
            <Form.Item name="territory" label="Assign Territory">
              <Select placeholder="Select a territory" allowClear>
                {orgData?.data?.flatMap(r => r.clusters).filter(Boolean).flatMap(c => c.territories).filter(Boolean).map(t => (
                  <Select.Option key={t._id} value={t._id}>{t.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Button type="primary" htmlType="submit" block loading={createMutation.isPending || updateMutation.isPending}>
            {editingUser ? "Update User" : "Create User"}
          </Button>
        </Form>
      </Drawer>

      {/* BULK IMPORT MODAL */}
      <Modal
        title="Bulk Import Users"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>Cancel</Button>,
          <Button key="upload" type="primary">Import Users</Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Button type="link">Download CSV Template</Button>
        </div>
        <Dragger>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#1038CC' }} />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
        </Dragger>
      </Modal>
      {/* VIEW USER X-RAY DRAWER */}
      <Drawer
        title="360° RM X-Ray Profile"
        width={700}
        onClose={() => {
          setViewDrawerVisible(false);
          setViewingUser(null);
        }}
        open={viewDrawerVisible}
      >
        {viewingUser && (
          <div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', color: '#1038CC' }}>
                {viewingUser.name.charAt(0)}
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>{viewingUser.name}</Title>
                <Text type="secondary">{viewingUser.role} • {viewingUser.phone}</Text>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={8}><Card size="small"><Statistic title="Leads Assigned" value={24} valueStyle={{ color: '#1038CC' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="Check-ins Today" value={3} valueStyle={{ color: '#3f8600' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="Conversion Rate" value="12%" valueStyle={{ color: '#cf1322' }} /></Card></Col>
            </Row>

            <Divider orientation="left">Performance Context</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Territory Info" size="small" style={{ height: '100%' }}>
                  <p><Text strong>Assigned Territory:</Text> {viewingUser.territory?.name || 'N/A'}</p>
                  <p><Text strong>Status:</Text> <Tag color={viewingUser.status === 'ACTIVE' ? 'success' : 'error'}>{viewingUser.status}</Tag></p>
                  <p><Text strong>Email:</Text> {viewingUser.email || 'N/A'}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Intelligence Highlights" size="small" style={{ height: '100%' }}>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    <li><Text type="warning">Has 4 leads in STUCK state</Text></li>
                    <li><Text type="success">100% Geo-fence compliance</Text></li>
                    <li><Text type="secondary">Generated 2 Self-Sourced leads</Text></li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Drawer>
    </div>
  );
};
