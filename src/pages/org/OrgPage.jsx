import React, { useState } from 'react';
import { Tabs, Table, Button, Tree, Typography, Card, Space, Modal, Form, Input, Switch, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axiosClient';

const { Title } = Typography;

export const OrgPage = () => {
  const [viewTree, setViewTree] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEntity, setModalEntity] = useState('');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch Regions
  const { data: regionsData, isLoading: loadingRegions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const res = await apiClient.get('/org/regions');
      return res.data; 
    }
  });

  // Fetch Hierarchy
  const { data: hierarchyData } = useQuery({
    queryKey: ['hierarchy'],
    queryFn: async () => {
      const res = await apiClient.get('/org/hierarchy');
      return res.data;
    }
  });

  // Fetch Clusters
  const { data: clustersData, isLoading: loadingClusters } = useQuery({
    queryKey: ['clusters'],
    queryFn: async () => {
      const res = await apiClient.get('/org/clusters');
      return res.data;
    }
  });

  // Fetch Territories
  const { data: territoriesData, isLoading: loadingTerritories } = useQuery({
    queryKey: ['territories'],
    queryFn: async () => {
      const res = await apiClient.get('/org/territories');
      return res.data;
    }
  });

  const createRegionMutation = useMutation({
    mutationFn: (newRegion) => apiClient.post('/org/regions', newRegion),
    onSuccess: () => {
      queryClient.invalidateQueries(['regions']);
      queryClient.invalidateQueries(['hierarchy']);
      toast.success('Region added successfully');
      setModalVisible(false);
      form.resetFields();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add region')
  });

  const createClusterMutation = useMutation({
    mutationFn: (newCluster) => apiClient.post('/org/clusters', newCluster),
    onSuccess: () => {
      queryClient.invalidateQueries(['clusters']);
      queryClient.invalidateQueries(['hierarchy']);
      toast.success('Cluster added successfully');
      setModalVisible(false);
      form.resetFields();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add cluster')
  });

  const createTerritoryMutation = useMutation({
    mutationFn: (newTerritory) => apiClient.post('/org/territories', newTerritory),
    onSuccess: () => {
      queryClient.invalidateQueries(['territories']);
      queryClient.invalidateQueries(['hierarchy']);
      toast.success('Territory added successfully');
      setModalVisible(false);
      form.resetFields();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add territory')
  });

  const regionCols = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Code', dataIndex: 'code' },
    { title: 'Status', dataIndex: 'status', render: val => <Switch checked={val === 'ACTIVE'} /> },
    { title: 'Actions', render: () => <Space><Button type="text" icon={<EditOutlined/>}/><Button type="text" danger icon={<DeleteOutlined/>}/></Space> }
  ];

  const clusterCols = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Code', dataIndex: 'code' },
    { title: 'Region', render: (_, r) => r.region?.name || '-' },
    { title: 'Status', dataIndex: 'status', render: val => <Switch checked={val === 'ACTIVE'} /> },
    { title: 'Actions', render: () => <Space><Button type="text" icon={<EditOutlined/>}/><Button type="text" danger icon={<DeleteOutlined/>}/></Space> }
  ];

  const territoryCols = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Code', dataIndex: 'code' },
    { title: 'Cluster', render: (_, r) => r.cluster?.name || '-' },
    { title: 'Status', dataIndex: 'status', render: val => <Switch checked={val === 'ACTIVE'} /> },
    { title: 'Actions', render: () => <Space><Button type="text" icon={<EditOutlined/>}/><Button type="text" danger icon={<DeleteOutlined/>}/></Space> }
  ];

  const openModal = (entity) => {
    setModalEntity(entity);
    setModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      if (modalEntity === 'Region') {
        createRegionMutation.mutate(values);
      } else if (modalEntity === 'Cluster') {
        createClusterMutation.mutate(values);
      } else if (modalEntity === 'Territory') {
        createTerritoryMutation.mutate(values);
      }
    });
  };

  const transformHierarchy = (data) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(r => ({
      title: `${r.name} (${r.code})`,
      key: r._id,
      children: (r.clusters || []).filter(c => c && c._id).map(c => ({
        title: `${c.name} (${c.code})`,
        key: c._id,
        children: (c.territories || []).filter(t => t && t._id).map(t => ({
          title: `${t.name} (${t.code})`,
          key: t._id,
        }))
      }))
    }));
  };

  return (
    <div>
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>Organization Hierarchy</Title>
        <Button 
          icon={<ApartmentOutlined />} 
          onClick={() => setViewTree(!viewTree)}
        >
          {viewTree ? 'List View' : 'Visual Hierarchy View'}
        </Button>
      </div>

      <Card>
        {viewTree ? (
          <div>
            <Title level={5}>Visual Hierarchy</Title>
            <Tree
              showLine
              defaultExpandAll
              treeData={transformHierarchy(hierarchyData?.data)}
            />
          </div>
        ) : (
          <Tabs
            defaultActiveKey="regions"
            items={[
              {
                key: 'regions',
                label: 'Regions',
                children: (
                  <div>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('Region')}>Add Region</Button>
                    </div>
                    <Table columns={regionCols} dataSource={regionsData?.data || []} rowKey="_id" loading={loadingRegions} />
                  </div>
                )
              },
              {
                key: 'clusters',
                label: 'Clusters',
                children: (
                  <div>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('Cluster')}>Add Cluster</Button>
                    </div>
                    <Table columns={clusterCols} dataSource={clustersData?.data || []} rowKey="_id" loading={loadingClusters} />
                  </div>
                )
              },
              {
                key: 'territories',
                label: 'Territories',
                children: (
                  <div>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('Territory')}>Add Territory</Button>
                    </div>
                    <Table columns={territoryCols} dataSource={territoriesData?.data || []} rowKey="_id" loading={loadingTerritories} />
                  </div>
                )
              }
            ]}
          />
        )}
      </Card>

      <Modal
        title={`Add ${modalEntity}`}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={createRegionMutation.isPending || createClusterMutation.isPending || createTerritoryMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={`${modalEntity} Name`} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="code" label={`${modalEntity} Code`} rules={[{ required: true }]}><Input /></Form.Item>
          
          {modalEntity === 'Cluster' && (
            <Form.Item name="region" label="Parent Region" rules={[{ required: true }]}>
              <Select
                placeholder="Select Region"
                options={(regionsData?.data || []).map(r => ({ label: r.name, value: r._id }))}
              />
            </Form.Item>
          )}

          {modalEntity === 'Territory' && (
            <Form.Item name="cluster" label="Parent Cluster" rules={[{ required: true }]}>
              <Select
                placeholder="Select Cluster"
                options={(clustersData?.data || []).map(c => ({
                  label: `${c.name} ${c.region ? `(${c.region.name || c.region.code || ''})` : ''}`,
                  value: c._id
                }))}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};
