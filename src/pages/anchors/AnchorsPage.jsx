import React, { useState } from 'react';
import {
  Row, Col, Card, Typography, Input, Button, Badge, Table, Switch,
  Drawer, Form, Select, Modal, Space, Popconfirm, Tooltip, Divider,
  Statistic, Tag, Empty, Spin
} from 'antd';
import {
  PlusOutlined, DownloadOutlined, EyeOutlined, EditOutlined,
  DeleteOutlined, SearchOutlined, ShopOutlined, BankOutlined,
  CheckCircleOutlined, StopOutlined, InboxOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axiosClient';
import { getDealerXray } from '../../api/aiApi';
import AIInsightCard from '../../components/AI/AIInsightCard';

const { Title, Text } = Typography;

export const AnchorsPage = () => {
  const [selectedAnchor, setSelectedAnchor] = useState(null);
  const [dealerDrawerVisible, setDealerDrawerVisible] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [viewingDealer, setViewingDealer] = useState(null);
  const [anchorSearch, setAnchorSearch] = useState('');
  const [anchorModalVisible, setAnchorModalVisible] = useState(false);
  const [newAnchorName, setNewAnchorName] = useState('');
  // ── AI X-Ray state ────────────────────────────────────────────────────────
  const [xrayDrawerOpen, setXrayDrawerOpen] = useState(false);
  const [xrayLoading, setXrayLoading] = useState(false);
  const [xrayData, setXrayData] = useState(null);
  const [xrayDealer, setXrayDealer] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: anchorsData, isLoading: loadingAnchors } = useQuery({
    queryKey: ['anchors'],
    queryFn: async () => {
      const res = await apiClient.get('/anchors');
      const anchors = res.data?.data || [];
      if (anchors.length > 0 && !selectedAnchor) {
        setSelectedAnchor(anchors[0]);
      }
      return anchors;
    }
  });

  const { data: dealersData, isLoading: loadingDealers } = useQuery({
    queryKey: ['dealers', selectedAnchor?._id],
    queryFn: async () => {
      const res = await apiClient.get(`/anchors/${selectedAnchor._id}/dealers`);
      return res.data?.data || [];
    },
    enabled: !!selectedAnchor?._id,
  });

  const { data: regionsList } = useQuery({
    queryKey: ['regions-list'],
    queryFn: async () => {
      const res = await apiClient.get('/org/regions');
      return res.data?.data || [];
    }
  });

  const { data: clustersList } = useQuery({
    queryKey: ['clusters-list'],
    queryFn: async () => {
      const res = await apiClient.get('/org/clusters');
      return res.data?.data || [];
    }
  });

  const { data: territoriesList } = useQuery({
    queryKey: ['territories-list'],
    queryFn: async () => {
      const res = await apiClient.get('/org/territories');
      return res.data?.data || [];
    }
  });

  const selectedRegionId = Form.useWatch('regionId', form);
  const selectedClusterId = Form.useWatch('cluster', form);

  const createAnchorMutation = useMutation({
    mutationFn: (newAnchor) => apiClient.post('/anchors', newAnchor),
    onSuccess: () => {
      queryClient.invalidateQueries(['anchors']);
      toast.success('Anchor created');
      setAnchorModalVisible(false);
      setNewAnchorName('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create anchor')
  });

  const createDealerMutation = useMutation({
    mutationFn: (newDealer) => apiClient.post(`/anchors/${selectedAnchor._id}/dealers`, newDealer),
    onSuccess: () => {
      queryClient.invalidateQueries(['dealers', selectedAnchor?._id]);
      toast.success('Dealer created successfully');
      closeDealerDrawer();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create dealer')
  });

  const updateDealerMutation = useMutation({
    mutationFn: (data) => apiClient.patch(`/anchors/${selectedAnchor._id}/dealers/${editingDealer._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['dealers', selectedAnchor?._id]);
      toast.success('Dealer updated');
      closeDealerDrawer();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update dealer')
  });

  const deleteDealerMutation = useMutation({
    mutationFn: (dealerId) => apiClient.delete(`/anchors/${selectedAnchor._id}/dealers/${dealerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['dealers', selectedAnchor?._id]);
      toast.success('Dealer deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete dealer')
  });

  const closeDealerDrawer = () => {
    setDealerDrawerVisible(false);
    setEditingDealer(null);
    setViewingDealer(null);
    form.resetFields();
  };

  const handleOpenXray = async (record) => {
    setXrayDealer(record);
    setXrayDrawerOpen(true);
    setXrayLoading(true);
    setXrayData(null);
    const result = await getDealerXray(record._id);
    setXrayData(result);
    setXrayLoading(false);
  };

  const handleRefreshXray = async () => {
    if (!xrayDealer) return;
    setXrayLoading(true);
    const result = await getDealerXray(xrayDealer._id);
    setXrayData(result);
    setXrayLoading(false);
  };

  const handleEditDealer = (record) => {
    setEditingDealer(record);
    setViewingDealer(null);
    form.setFieldsValue({
      businessName: record.businessName,
      ownerName: record.ownerName,
      phone: record.phone,
      businessType: record.businessType,
      gstNumber: record.gstNumber,
      address: record.address,
      regionId: record.cluster?.region?._id || record.cluster?.region || null,
      cluster: record.cluster?._id || record.cluster || null,
      territory: record.territory?._id || record.territory || null,
    });
    setDealerDrawerVisible(true);
  };

  const handleViewDealer = (record) => {
    setViewingDealer(record);
    setEditingDealer(null);
    setDealerDrawerVisible(true);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'DISTRIBUTOR': return 'blue';
      case 'WHOLESALER': return 'purple';
      case 'RETAILER': return 'green';
      default: return 'default';
    }
  };

  const filteredAnchors = (anchorsData || []).filter(a =>
    a.name?.toLowerCase().includes(anchorSearch.toLowerCase())
  );

  const dealerColumns = [
    {
      title: 'Business',
      dataIndex: 'businessName',
      ellipsis: true,
      render: (name, record) => (
        <div>
          <Text strong style={{ fontSize: 12 }}>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.ownerName || '—'}</Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'businessType',
      width: 110,
      render: (t) => t ? <Tag color={getTypeColor(t)} style={{ fontSize: 10, padding: '0 5px' }}>{t}</Tag> : '—',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: 110,
      render: (t) => <Text style={{ fontSize: 12 }}>{t || '—'}</Text>,
    },
    {
      title: 'City / State',
      width: 130,
      render: (_, r) => {
        const loc = [r.address?.city, r.address?.state].filter(Boolean).join(', ');
        return <Text style={{ fontSize: 12 }}>{loc || '—'}</Text>;
      },
    },
    {
      title: 'GST',
      dataIndex: 'gstNumber',
      width: 120,
      ellipsis: true,
      render: (t) => <Text style={{ fontSize: 11, fontFamily: 'monospace' }}>{t || '—'}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 80,
      render: (val, record) => (
        <Switch
          size="small"
          checked={val === 'ACTIVE'}
          checkedChildren="On"
          unCheckedChildren="Off"
          onChange={(checked) => {
            // Could call a status update mutation here
          }}
        />
      ),
    },
    {
      title: 'Actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title="View Details">
            <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => handleViewDealer(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleEditDealer(record)} />
          </Tooltip>
          <Tooltip title="AI X-Ray">
            <Button
              size="small"
              type="text"
              icon={<ThunderboltOutlined />}
              onClick={() => handleOpenXray(record)}
              style={{ color: '#7c3aed' }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this dealer?"
              description="This action cannot be undone."
              okText="Delete"
              okType="danger"
              onConfirm={() => deleteDealerMutation.mutate(record._id)}
            >
              <Button size="small" type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div className="page-header">
        <Title level={4} style={{ margin: 0, color: '#050126' }}>Anchors & Dealers</Title>
      </div>

      {/* Main two-pane layout */}
      <div style={{ flex: 1, display: 'flex', gap: 16, overflow: 'hidden', minHeight: 0 }}>

        {/* ── Left Pane: Anchors List ── */}
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Card
            size="small"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            bodyStyle={{ padding: '10px 10px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BankOutlined style={{ color: '#1038CC' }} />
                <span style={{ fontSize: 13 }}>Anchors</span>
                <Badge count={filteredAnchors.length} style={{ backgroundColor: '#1038CC', marginLeft: 4 }} />
              </div>
            }
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setAnchorModalVisible(true)}
                style={{ fontSize: 11 }}
              >
                Add
              </Button>
            }
          >
            <Input
              size="small"
              placeholder="Search anchors..."
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              value={anchorSearch}
              onChange={(e) => setAnchorSearch(e.target.value)}
              style={{ marginBottom: 10, fontSize: 12 }}
            />

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingAnchors ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <Spin size="small" />
                </div>
              ) : filteredAnchors.length === 0 ? (
                <Empty description="No anchors" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                filteredAnchors.map((anchor) => {
                  const isSelected = selectedAnchor?._id === anchor._id;
                  return (
                    <div
                      key={anchor._id}
                      onClick={() => setSelectedAnchor(anchor)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        marginBottom: 4,
                        cursor: 'pointer',
                        background: isSelected ? '#EEF2FF' : 'transparent',
                        border: isSelected ? '1px solid #C7D2FE' : '1px solid transparent',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F8F9FF'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: isSelected ? '#1038CC' : '#F0F4FF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isSelected ? '#fff' : '#1038CC',
                          fontWeight: 700, fontSize: 12, flexShrink: 0,
                        }}>
                          {anchor.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? '#1038CC' : '#333',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {anchor.name}
                        </span>
                      </div>
                      <Badge
                        status={anchor.status === 'ACTIVE' ? 'success' : 'default'}
                        style={{ flexShrink: 0 }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* ── Right Pane: Dealers Table ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Card
            size="small"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            bodyStyle={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            title={
              selectedAnchor ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShopOutlined style={{ color: '#1038CC' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#050126' }}>
                    {selectedAnchor.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>— Dealers</span>
                  <Badge
                    count={dealersData?.length || 0}
                    style={{ backgroundColor: '#1038CC', marginLeft: 4 }}
                  />
                </div>
              ) : (
                <span style={{ fontSize: 13, color: '#888' }}>Select an anchor to view dealers</span>
              )
            }
            extra={
              selectedAnchor && (
                <Space size={8}>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    style={{ fontSize: 11 }}
                  >
                    Bulk Import
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    style={{ fontSize: 11 }}
                    onClick={() => {
                      setEditingDealer(null);
                      setViewingDealer(null);
                      form.resetFields();
                      setDealerDrawerVisible(true);
                    }}
                  >
                    Add Dealer
                  </Button>
                </Space>
              )
            }
          >
            {!selectedAnchor ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty
                  image={<BankOutlined style={{ fontSize: 48, color: '#d0d0d0' }} />}
                  description={<span style={{ color: '#aaa', fontSize: 13 }}>Select an anchor from the left panel</span>}
                />
              </div>
            ) : (
              <div style={{ flex: 1, overflow: 'auto' }}>
                <Table
                  size="small"
                  columns={dealerColumns}
                  dataSource={dealersData || []}
                  rowKey="_id"
                  loading={loadingDealers}
                  scroll={{ x: 700 }}
                  pagination={{
                    pageSize: 10,
                    size: 'small',
                    showSizeChanger: false,
                    showTotal: (total) => `${total} dealers`,
                    style: { marginTop: 8 }
                  }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={<ShopOutlined style={{ fontSize: 36, color: '#d9d9d9' }} />}
                        description={<span style={{ fontSize: 12 }}>No dealers found for this anchor</span>}
                      />
                    )
                  }}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Add Anchor Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: '#1038CC' }} />
            <span>Add New Anchor</span>
          </div>
        }
        open={anchorModalVisible}
        onOk={() => {
          if (newAnchorName.trim()) {
            createAnchorMutation.mutate({ name: newAnchorName.trim() });
          }
        }}
        onCancel={() => { setAnchorModalVisible(false); setNewAnchorName(''); }}
        okText="Create Anchor"
        okButtonProps={{ disabled: !newAnchorName.trim(), loading: createAnchorMutation.isPending }}
        width={400}
      >
        <div style={{ padding: '16px 0' }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            Enter the official business name of the anchor company.
          </Text>
          <Input
            size="middle"
            placeholder="e.g. Mahindra Finance"
            value={newAnchorName}
            onChange={(e) => setNewAnchorName(e.target.value)}
            onPressEnter={() => {
              if (newAnchorName.trim()) createAnchorMutation.mutate({ name: newAnchorName.trim() });
            }}
            prefix={<BankOutlined style={{ color: '#bbb' }} />}
            autoFocus
          />
        </div>
      </Modal>

      {/* ── Add / Edit / View Dealer Drawer ── */}
      <Drawer
        title={
          viewingDealer
            ? <span>🔍 Dealer X-Ray — {viewingDealer.businessName}</span>
            : editingDealer
              ? `Edit Dealer — ${editingDealer.businessName}`
              : `Add Dealer to ${selectedAnchor?.name}`
        }
        width={viewingDealer ? 680 : 500}
        onClose={closeDealerDrawer}
        open={dealerDrawerVisible}
        bodyStyle={{ padding: 20 }}
      >
        {viewingDealer ? (
          /* ── X-Ray View ── */
          <div>
            {/* Profile Header */}
            <div style={{
              display: 'flex', gap: 16, alignItems: 'center',
              marginBottom: 20, padding: '16px',
              background: 'linear-gradient(135deg, #f0f4ff, #fafbff)',
              borderRadius: 10, border: '1px solid #e0e8ff',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1038CC, #3b5af7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 900, color: '#fff',
              }}>
                {viewingDealer.businessName?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <Title level={5} style={{ margin: 0 }}>{viewingDealer.businessName}</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {viewingDealer.businessType && <Tag color={getTypeColor(viewingDealer.businessType)} style={{ fontSize: 10 }}>{viewingDealer.businessType}</Tag>}
                  {viewingDealer.phone}
                </Text>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge
                  status={viewingDealer.status === 'ACTIVE' ? 'success' : 'error'}
                  text={<span style={{ fontSize: 12 }}>{viewingDealer.status}</span>}
                />
              </div>
            </div>

            {/* KPI row */}
            <Row gutter={12} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title={<span style={{ fontSize: 11 }}>Pipeline Value</span>} value="₹12.5L" valueStyle={{ color: '#1038CC', fontSize: 18 }} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title={<span style={{ fontSize: 11 }}>DPD Risk</span>} value="LOW" valueStyle={{ color: '#52c41a', fontSize: 18 }} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title={<span style={{ fontSize: 11 }}>Pending KYC</span>} value={1} valueStyle={{ color: '#faad14', fontSize: 18 }} />
                </Card>
              </Col>
            </Row>

            <Divider orientation="left" style={{ fontSize: 12, color: '#888', margin: '12px 0' }}>Business Information</Divider>
            <Row gutter={12}>
              <Col span={12}>
                <Card size="small" title={<span style={{ fontSize: 12 }}>Contact & Location</span>}>
                  <div style={{ fontSize: 12, lineHeight: '1.8' }}>
                    <div><Text type="secondary">Owner:</Text> <Text strong>{viewingDealer.ownerName || 'N/A'}</Text></div>
                    <div><Text type="secondary">Phone:</Text> <Text>{viewingDealer.phone || 'N/A'}</Text></div>
                    <div><Text type="secondary">GST:</Text> <Text code style={{ fontSize: 11 }}>{viewingDealer.gstNumber || 'N/A'}</Text></div>
                    <div><Text type="secondary">Location:</Text> <Text>{[viewingDealer.address?.city, viewingDealer.address?.state].filter(Boolean).join(', ') || 'N/A'}</Text></div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title={<span style={{ fontSize: 12 }}>NBA Insights</span>}>
                  <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, lineHeight: '1.9' }}>
                    <li><Text type="success">✓ Consistent repayment history</Text></li>
                    <li><Text type="warning">⚠ Sanction expires in 18 days</Text></li>
                    <li><Text type="secondary">📍 RM visited 2 days ago</Text></li>
                  </ul>
                </Card>
              </Col>
            </Row>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditDealer(viewingDealer)}
              >
                Edit Dealer
              </Button>
            </div>
          </div>
        ) : (
          /* ── Add / Edit Form ── */
          <Form form={form} layout="vertical" size="middle" onFinish={(values) => {
            if (editingDealer) {
              updateDealerMutation.mutate(values);
            } else {
              createDealerMutation.mutate(values);
            }
          }}>
            <Form.Item name="businessName" label="Business Name" rules={[{ required: true, message: 'Required' }]}>
              <Input placeholder="Enter business name" />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="ownerName" label="Owner Name">
                  <Input placeholder="Owner / Proprietor" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label="Mobile Number">
                  <Input placeholder="10-digit mobile" maxLength={10} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="businessType" label="Business Type">
              <Select placeholder="Select type">
                <Select.Option value="RETAILER">Retailer</Select.Option>
                <Select.Option value="DISTRIBUTOR">Distributor</Select.Option>
                <Select.Option value="WHOLESALER">Wholesaler</Select.Option>
                <Select.Option value="OTHER">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name={['address', 'street']} label="Street Address" rules={[{ required: true, message: 'Street address is required' }]}>
              <Input placeholder="123 Main St" />
            </Form.Item>

            <Row gutter={12}>
              <Col span={8}>
                <Form.Item name={['address', 'city']} label="City" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="City" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['address', 'state']} label="State" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="State" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['address', 'pincode']} label="Pincode" rules={[{ required: true, message: 'Required', len: 6 }]}>
                  <Input placeholder="Pincode" maxLength={6} />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }}>Location Hierarchy</Divider>

            <Row gutter={12}>
              <Col span={8}>
                <Form.Item name="regionId" label="Region">
                  <Select
                    placeholder="Select Region"
                    allowClear
                    onChange={() => {
                      form.setFieldValue('cluster', undefined);
                      form.setFieldValue('territory', undefined);
                    }}
                    options={(regionsList || []).map(r => ({ label: r.name, value: r._id }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="cluster" label="Cluster">
                  <Select
                    placeholder="Select Cluster"
                    allowClear
                    onChange={() => {
                      form.setFieldValue('territory', undefined);
                    }}
                    options={(clustersList || [])
                      .filter(c => !selectedRegionId || (c.region?._id || c.region) === selectedRegionId)
                      .map(c => ({ label: c.name, value: c._id }))
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="territory" label="Territory">
                  <Select
                    placeholder="Select Territory"
                    allowClear
                    options={(territoriesList || [])
                      .filter(t => !selectedClusterId || (t.cluster?._id || t.cluster) === selectedClusterId)
                      .map(t => ({ label: t.name, value: t._id }))
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="gstNumber" label="GST Number">
              <Input placeholder="22AAAAA0000A1Z5" style={{ fontFamily: 'monospace', letterSpacing: 1 }} />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={createDealerMutation.isPending || updateDealerMutation.isPending}
              style={{ marginTop: 4 }}
            >
              {editingDealer ? 'Update Dealer' : 'Save Dealer'}
            </Button>
          </Form>
        )}
      </Drawer>

      {/* ── AI Dealer X-Ray Drawer ── */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThunderboltOutlined style={{ color: '#7c3aed' }} />
            <span>AI Dealer X-Ray</span>
            {xrayDealer && (
              <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>
                — {xrayDealer.businessName}
              </span>
            )}
          </div>
        }
        width={520}
        open={xrayDrawerOpen}
        onClose={() => { setXrayDrawerOpen(false); setXrayData(null); setXrayDealer(null); }}
        extra={
          <Button
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={handleRefreshXray}
            loading={xrayLoading}
            style={{ borderColor: '#7c3aed', color: '#7c3aed', fontSize: 11 }}
          >
            Regenerate
          </Button>
        }
      >
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fafafa', borderRadius: 8, fontSize: 12, color: '#555' }}>
          <strong>Disclaimer:</strong> AI insights are advisory only. Based solely on system records. Not official compliance or credit decisions.
        </div>
        <AIInsightCard
          title={`${xrayDealer?.businessName || 'Dealer'} Intelligence`}
          data={xrayData?.insight ?? null}
          isLoading={xrayLoading}
          onRefresh={handleRefreshXray}
          sections={[
            { label: 'Business Summary', key: 'businessSummary' },
            { label: 'Risk Assessment', key: 'riskAssessment', color: '#cf1322' },
            { label: 'Positive Signals', key: 'positiveSignals', color: '#389e0d' },
            { label: 'Potential Concerns', key: 'potentialConcerns', color: '#d4380d' },
            { label: 'Conversation Points', key: 'suggestedConversationPoints' },
            { label: 'Recommended Follow-up', key: 'recommendedFollowUp', color: '#1038CC' },
            { label: 'Loan Opportunity', key: 'loanOpportunitySummary', color: '#531dab' },
          ]}
        />
      </Drawer>
    </div>
  );
};
