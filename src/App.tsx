import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  UserOutlined,
  SafetyCertificateOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import UserManagementApp from './pages/UserManagementApp';
import SecureTestApp from './pages/SecureTestApp';

const { Sider, Content, Header } = Layout;

type ActiveApp = 'USER_MANAGEMENT' | 'SECURE_TEST';

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeApp, setActiveApp] = useState<ActiveApp>('USER_MANAGEMENT');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider collapsible collapsed={collapsed} trigger={null}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeApp]}
          onClick={({ key }) => setActiveApp(key as ActiveApp)}
          items={[
            {
              key: 'USER_MANAGEMENT',
              icon: <UserOutlined />,
              label: 'User Management',
            },
            {
              key: 'SECURE_TEST',
              icon: <SafetyCertificateOutlined />,
              label: 'Secure Test',
            },
          ]}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header className="!bg-white flex items-center px-4 shadow">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <h2 className="ml-3 font-semibold text-lg">
            {activeApp === 'USER_MANAGEMENT'
              ? 'User Management System'
              : 'Secure Assessment'}
          </h2>
        </Header>

        {/* Content */}
        <Content style={{ padding: 0 }}>
          {activeApp === 'USER_MANAGEMENT' && <UserManagementApp />}
          {activeApp === 'SECURE_TEST' && <SecureTestApp />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
