import React, { useState } from 'react';
import { Tabs, Table, Button, Tag, Space, Drawer, Typography, Timeline, Card, Form, Input, DatePicker, Select, Modal, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, FilterOutlined, ExclamationCircleOutlined, EyeOutlined, UserSwitchOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import apiClient from '../../api/axiosClient';

const { Title, Text } = Typography;

export const LeadsPage = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [reassignVisible, setReassignVisible] = useState(false);
  const [updateStageVisible, setUpdateStageVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newRmId, setNewRmId] = useState(null);
  const [newStage, setNewStage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const assignLeadMutation = useMutation({
    mutationFn: ({ leadId, rmId }) => apiClient.patch(`/leads/${leadId}/assign`, { rmId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Lead reassigned successfully');
      setReassignVisible(false);
      setDetailVisible(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reassign lead');
    }
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ leadId, stage }) => apiClient.patch(`/leads/${leadId}/stage`, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Lead stage updated successfully');
      setUpdateStageVisible(false);
      setDetailVisible(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update stage');
    }
  });

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', currentPage],
    queryFn: async () => {
      const res = await apiClient.get('/leads', { params: { page: currentPage, limit: 10 } });
      return res.data;
    }
  });

  const { data: kycDocs, isLoading: loadingKyc } = useQuery({
    queryKey: ['lead-kyc', selectedLead?._id],
    queryFn: async () => {
      if (!selectedLead?._id) return [];
      const res = await apiClient.get(`/kyc/lead/${selectedLead._id}`);
      return res.data?.data || [];
    },
    enabled: !!selectedLead?._id,
  });

  const [selectedFormAnchor, setSelectedFormAnchor] = useState(null);

  const { data: anchorsList } = useQuery({
    queryKey: ['anchors-list'],
    queryFn: async () => {
      const res = await apiClient.get('/anchors');
      return res.data?.data || [];
    }
  });

  const { data: dealersList, isFetching: loadingDealers } = useQuery({
    queryKey: ['dealers-list', selectedFormAnchor],
    queryFn: async () => {
      const res = await apiClient.get(`/anchors/${selectedFormAnchor}/dealers`);
      return res.data?.data || [];
    },
    enabled: !!selectedFormAnchor,
  });

  const { data: rmsList } = useQuery({
    queryKey: ['rms-list'],
    queryFn: async () => {
      const res = await apiClient.get('/users?role=RM&limit=100');
      return res.data?.data || [];
    }
  });

  const createLeadMutation = useMutation({
    mutationFn: (newLead) => apiClient.post('/leads', newLead),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Lead created');
      setCreateVisible(false);
      form.resetFields();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    }
  });

  const getStageColor = (stage) => {
    switch(stage) {
      case 'ASSIGNED': return 'blue';
      case 'IN_PROGRESS': return 'cyan';
      case 'KYC_SUBMITTED': return 'orange';
      case 'SANCTION': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    { title: 'Dealer', dataIndex: ['dealer', 'businessName'], render: t => <Text strong>{t || 'N/A'}</Text> },
    { title: 'Anchor', dataIndex: ['anchor', 'name'], render: t => t || 'N/A' },
    { title: 'Assigned RM', dataIndex: ['assignedTo', 'name'], render: t => t || 'Unassigned' },
    { title: 'Stage', dataIndex: 'stage', render: s => <Tag color={getStageColor(s)}>{s}</Tag> },
    { title: 'Expected Value', dataIndex: 'expectedValue', render: val => val ? `₹${val}L` : '-' },
    { title: 'Created', dataIndex: 'createdAt', render: val => dayjs(val).format('MMM D, YYYY') },
    { title: 'Urgency', dataIndex: 'isUrgent', render: u => u ? <Tag color="error" icon={<ExclamationCircleOutlined />}>Urgent</Tag> : '-' },
    { 
      title: 'Actions', 
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined style={{ color: '#1038CC' }} />} 
              onClick={() => {
                setSelectedLead(record);
                setDetailVisible(true);
              }} 
            />
          </Tooltip>
          <Tooltip title="Reassign RM">
            <Button 
              type="text" 
              icon={<UserSwitchOutlined style={{ color: '#faad14' }} />} 
              onClick={() => {
                setSelectedLead(record);
                setNewRmId(record.assignedTo?._id || record.assignedTo);
                setReassignVisible(true);
              }} 
            />
          </Tooltip>
          <Tooltip title="Update Stage">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#52c41a' }} />} 
              onClick={() => {
                setSelectedLead(record);
                setNewStage(record.stage);
                setUpdateStageVisible(true);
              }} 
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>Lead Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>Create Lead</Button>
      </div>

      <Card>
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: 'All Leads',
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Select placeholder="Filter by Anchor" style={{ width: 150 }} />
                    <Select placeholder="Filter by RM" style={{ width: 150 }} />
                    <Select mode="multiple" placeholder="Stage" style={{ width: 200 }} />
                    <DatePicker.RangePicker />
                    <Button icon={<FilterOutlined />}>Apply Filters</Button>
                  </div>
                  
                  {selectedRowKeys.length > 0 && (
                    <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#F0F4FF', borderRadius: 8 }}>
                      <Text strong>{selectedRowKeys.length} leads selected </Text>
                      <Button size="small" type="primary" style={{ marginLeft: 16 }}>Bulk Reassign</Button>
                    </div>
                  )}

                  <Table 
                    rowSelection={{
                      selectedRowKeys,
                      onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
                    }}
                    columns={columns} 
                    dataSource={leadsData?.data || []} 
                    rowKey="_id" 
                    loading={isLoading}
                    pagination={{
                      current: currentPage,
                      total: leadsData?.total || 0,
                      onChange: (page) => setCurrentPage(page)
                    }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* LEAD DETAIL DRAWER */}
      <Drawer
        title={`Lead Details #${selectedLead?._id?.substring(0,6) || ''}`}
        width={640}
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        extra={
          <Space>
            <Button 
              danger
              onClick={() => {
                setNewRmId(selectedLead?.assignedTo?._id || selectedLead?.assignedTo);
                setReassignVisible(true);
              }}
            >
              Reassign
            </Button>
            <Button 
              type="primary"
              onClick={() => {
                setNewStage(selectedLead?.stage);
                setUpdateStageVisible(true);
              }}
            >
              Update Stage
            </Button>
          </Space>
        }
      >
        {selectedLead && (
          <>
            <Card title="Dealer Information" size="small" style={{ marginBottom: 24 }}>
              <Row gutter={[16,16]}>
                <Col span={12}><Text type="secondary">Name:</Text> <Text strong>{selectedLead.dealer?.businessName || 'N/A'}</Text></Col>
                <Col span={12}><Text type="secondary">Anchor:</Text> <Text strong>{selectedLead.anchor?.name || 'N/A'}</Text></Col>
                <Col span={12}><Text type="secondary">Expected Value:</Text> <Text strong>₹{selectedLead.expectedValue || 0} Lakhs</Text></Col>
                <Col span={12}><Text type="secondary">Assigned RM:</Text> <Text strong>{selectedLead.assignedTo?.name || 'Unassigned'}</Text></Col>
              </Row>
            </Card>

            <Title level={5}>Stage Timeline</Title>
            <Timeline
              items={[
                { children: `Lead Created (${dayjs(selectedLead.createdAt).format('MMM D, YYYY')})`, color: 'green' },
                { children: `Current Stage: ${selectedLead.stage}`, color: 'blue' },
              ]}
            />
            
            <Title level={5} style={{ marginTop: 24 }}>KYC Documents</Title>
            {loadingKyc ? (
               <Text type="secondary">Loading documents...</Text>
            ) : kycDocs && kycDocs.length > 0 ? (
               <Row gutter={[16, 16]}>
                 {kycDocs.map(doc => (
                   <Col span={12} key={doc._id}>
                     <Card size="small" title={doc.docType.replace('_', ' ')} extra={<Tag color={doc.status === 'VERIFIED' ? 'success' : 'processing'}>{doc.status}</Tag>}>
                       {doc.s3Url ? (
                         <div style={{ height: 120, width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                            <img src={doc.s3Url.startsWith('/') ? `http://localhost:3000${doc.s3Url}` : doc.s3Url} alt={doc.docType} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                         </div>
                       ) : (
                         <Text type="secondary">No image available</Text>
                       )}
                       <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Uploaded: {dayjs(doc.uploadedAt).format('MMM D, YYYY')}</Text>
                       </div>
                     </Card>
                   </Col>
                 ))}
               </Row>
            ) : (
               <div style={{ padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, textAlign: 'center' }}>
                 <Text type="secondary">No KYC documents uploaded yet.</Text>
               </div>
            )}
          </>
        )}
      </Drawer>

      {/* CREATE LEAD MODAL */}
      <Modal title="Create New Lead" open={createVisible} onCancel={() => setCreateVisible(false)} onOk={() => form.submit()} confirmLoading={createLeadMutation.isPending}>
        <Form form={form} layout="vertical" onFinish={(values) => createLeadMutation.mutate(values)}>
          <Form.Item name="anchor" label="Anchor" rules={[{ required: true, message: 'Please select an anchor' }]}>
            <Select 
              placeholder="Select Anchor" 
              onChange={(val) => {
                setSelectedFormAnchor(val);
                form.setFieldsValue({ dealer: undefined }); // reset dealer when anchor changes
              }}
              showSearch
              optionFilterProp="children"
            >
              {anchorsList?.map(a => <Select.Option key={a._id} value={a._id}>{a.name}</Select.Option>)}
            </Select>
          </Form.Item>
          
          <Form.Item name="dealer" label="Dealer" rules={[{ required: true, message: 'Please select a dealer' }]}>
            <Select 
              placeholder={selectedFormAnchor ? "Select Dealer" : "Select Anchor first"}
              disabled={!selectedFormAnchor}
              loading={loadingDealers}
              showSearch
              optionFilterProp="children"
            >
              {dealersList?.map(d => <Select.Option key={d._id} value={d._id}>{d.businessName}</Select.Option>)}
            </Select>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}><Form.Item name="expectedValue" label="Expected Deal Value (₹L)"><Input type="number" /></Form.Item></Col>
            <Col span={12}>
              <Form.Item name="plannedVisitDate" label="Scheduled Visit Date & Time">
                <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="assignedTo" label="Assign to RM">
            <Select placeholder="Select RM" showSearch optionFilterProp="children">
              {rmsList?.map(rm => <Select.Option key={rm._id} value={rm._id}>{rm.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* REASSIGN RM MODAL */}
      <Modal
        title="Reassign RM"
        open={reassignVisible}
        onOk={() => {
          if (selectedLead && newRmId) {
            assignLeadMutation.mutate({ leadId: selectedLead._id, rmId: newRmId });
          }
        }}
        onCancel={() => setReassignVisible(false)}
        confirmLoading={assignLeadMutation.isPending}
      >
        <div style={{ padding: '16px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Select the new Relationship Manager (RM) for this lead:</Text>
          <Select 
            placeholder="Select RM" 
            style={{ width: '100%' }}
            value={newRmId}
            onChange={(val) => setNewRmId(val)}
            showSearch
            optionFilterProp="children"
          >
            {rmsList?.map(rm => <Select.Option key={rm._id} value={rm._id}>{rm.name}</Select.Option>)}
          </Select>
        </div>
      </Modal>

      {/* UPDATE STAGE MODAL */}
      <Modal
        title="Update Stage"
        open={updateStageVisible}
        onOk={() => {
          if (selectedLead && newStage) {
            updateStageMutation.mutate({ leadId: selectedLead._id, stage: newStage });
          }
        }}
        onCancel={() => setUpdateStageVisible(false)}
        confirmLoading={updateStageMutation.isPending}
      >
        <div style={{ padding: '16px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Select the new pipeline stage for this lead:</Text>
          <Select 
            placeholder="Select Stage" 
            style={{ width: '100%' }}
            value={newStage}
            onChange={(val) => setNewStage(val)}
          >
            <Select.Option value="ASSIGNED">Assigned</Select.Option>
            <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
            <Select.Option value="CREDIT_ASSESSMENT">Credit Assessment</Select.Option>
            <Select.Option value="KYC_SUBMITTED">KYC Submitted</Select.Option>
            <Select.Option value="SANCTIONED">Sanctioned</Select.Option>
            <Select.Option value="DISBURSED">Disbursed</Select.Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
};
