import { useState } from 'react';
import { Layout, Menu, Button, Badge, Dropdown, Avatar, Tooltip } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  HomeOutlined,
  TeamOutlined,
  ApartmentOutlined,
  ShopOutlined,
  AimOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  ApiOutlined,
  BellOutlined,
  FileTextOutlined,
  BarChartOutlined,
  BookOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { key: '/dashboard',   icon: <HomeOutlined />,        label: 'Dashboard' },
    { key: '/users',       icon: <TeamOutlined />,         label: 'Users' },
    { key: '/org',         icon: <ApartmentOutlined />,    label: 'Org Hierarchy' },
    { key: '/anchors',     icon: <ShopOutlined />,         label: 'Anchors & Dealers' },
    { key: '/leads',       icon: <FileTextOutlined />,     label: 'Leads' },
    { key: '/targets',     icon: <AimOutlined />,          label: 'Targets' },
    { key: '/nba',         icon: <SettingOutlined />,      label: 'NBA Config' },
    { key: '/geofence',    icon: <EnvironmentOutlined />,  label: 'Geofence Config' },
    // { key: '/config',      icon: <ToolOutlined />,         label: 'System Config' },
    // { key: '/integrations',icon: <ApiOutlined />,          label: 'Integrations Health' },
    { key: '/notifications',icon: <BellOutlined />,        label: 'Notifications' },
    // { key: '/audit-logs',  icon: <FileTextOutlined />,     label: 'Audit Logs' },
    { key: '/reports',     icon: <BarChartOutlined />,     label: 'Reports' },
    { key: '/training',    icon: <BookOutlined />,         label: 'Training Content' },
  ];

  const currentPageLabel = menuItems.find(m => m.key === location.pathname)?.label || 'Overview';

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: logout },
  ];

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <Sider
        width={220}
        collapsedWidth={56}
        collapsed={collapsed}
        theme="dark"
        style={{
          background: 'linear-gradient(180deg, #000D31 0%, #050126 100%)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
        }}
      >
        {/* Logo */}
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 16px',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28,
            background: '#1038CC',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 14, color: '#fff', flexShrink: 0,
          }}>P</div>
          {!collapsed && (
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
              Progcap <span style={{ color: '#1038CC' }}>Admin</span>
            </span>
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            fontSize: 12,
            paddingTop: 4,
          }}
        />

        {/* Bottom user strip */}
        <div style={{
          padding: collapsed ? '12px 4px' : '10px 12px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 8,
          flexShrink: 0,
        }}>
          {!collapsed && (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Admin'}
            </span>
          )}
          <Tooltip title="Logout" placement="right">
            <Button
              type="text"
              size="small"
              icon={<LogoutOutlined style={{ color: '#EF4444' }} />}
              onClick={logout}
            />
          </Tooltip>
        </div>
      </Sider>

      {/* ── Main ── */}
      <Layout style={{
        marginLeft: collapsed ? 56 : 220,
        transition: 'margin-left 0.2s',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <Header style={{
          background: '#fff',
          padding: '0 16px',
          height: 56,
          lineHeight: '56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          flexShrink: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              size="small"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <span style={{ fontWeight: 600, fontSize: 14, color: '#050126' }}>
              {currentPageLabel}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Badge count={5} size="small">
              <Button
                type="text"
                size="small"
                icon={<BellOutlined style={{ fontSize: 16 }} />}
                onClick={() => navigate('/notifications')}
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar
                  size={30}
                  style={{ backgroundColor: '#1038CC', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                  <span style={{ fontWeight: 600, fontSize: 12, color: '#050126' }}>{user?.name || 'Admin'}</span>
                  <span style={{ fontSize: 10, color: '#888' }}>{user?.role || 'SUPER_ADMIN'}</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{
          flex: 1,
          overflow: 'auto',
          padding: 16,
          background: '#F4F5F7',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
