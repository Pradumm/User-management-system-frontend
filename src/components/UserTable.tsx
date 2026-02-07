import React from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { PaginationMetadata, User } from '../types/User.types';


interface UserTableProps {
  users: User[];
  loading: boolean;
  pagination: PaginationMetadata;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onTableChange: (page: number, pageSize: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  pagination,
  onEdit,
  onDelete,
  onTableChange,
}) => {
  const columns: ColumnsType<User> = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => onDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    onTableChange(paginationConfig.current || 1, paginationConfig.pageSize || 10);
  };

  return (

      <Table
      columns={columns}
      dataSource={users}
      rowKey="_id"
      loading={loading}
      onChange={handleTableChange}
      pagination={{
        current: pagination.page,
        pageSize: pagination.limit,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      scroll={{ x: 800 }}
    />
  );
};

export default UserTable;