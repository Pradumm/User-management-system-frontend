import React, { useState, useEffect } from 'react';
import { Button, message, Input, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm';
import { userApi } from '../services/api';
import type { User, UserFormData, PaginationMetadata } from '../types/User.types';

const UserManagementApp: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [pagination, setPagination] = useState<PaginationMetadata>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers(pagination.page, pagination.limit, debouncedSearch);
    }, [pagination.page, pagination.limit, debouncedSearch]);

    const fetchUsers = async (page: number = 1, limit: number = 10, search: string = '') => {
        setLoading(true);
        try {
            const response = await userApi.getUsers(page, limit, search);
            setUsers(response.data);
            setPagination(response.pagination);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingUser(null);
        setModalVisible(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await userApi.deleteUser(id);
            message.success('User deleted successfully');
            fetchUsers(pagination.page, pagination.limit, debouncedSearch);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleSubmit = async (values: UserFormData) => {
        if (editingUser) {
            await userApi.updateUser(editingUser._id, values);
        } else {
            await userApi.createUser(values);
        }
        fetchUsers(pagination.page, pagination.limit, debouncedSearch);
    };



    const handleModalClose = () => {
        setModalVisible(false);
        setEditingUser(null);
    };

    const handleTableChange = (page: number, pageSize: number) => {
        setPagination(prev => ({
            ...prev,
            page,
            limit: pageSize,
        }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleRefresh = () => {
        fetchUsers(pagination.page, pagination.limit, debouncedSearch);
    };

    return (
        <div className=" bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="  p-6 mb-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                User Management System
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage your users efficiently
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                loading={loading}
                                size="large"
                            >
                                Refresh
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                                size="large"
                            >
                                Add New User
                            </Button>
                        </div>
                    </div>
                </div>

                {/* User Table with Search */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Search Bar - Top Left */}
                    <div className="mb-4">
                        <Input
                            placeholder="Search by name, email, or phone..."
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            size="large"
                            allowClear
                            style={{ maxWidth: 400 }}
                            disabled={loading}
                        />
                    </div>

                    {/* Table with Loading Overlay */}
                    <Spin spinning={loading} tip="Loading users...">
                        <UserTable
                            users={users}
                            loading={loading}
                            pagination={pagination}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onTableChange={handleTableChange}
                        />
                    </Spin>
                </div>

                {/* User Form Modal */}
                <UserForm
                    visible={modalVisible}
                    onCancel={handleModalClose}
                    onSubmit={handleSubmit}
                    initialValues={editingUser}
                    title={editingUser ? 'Edit User' : 'Create New User'}
                />
            </div>
        </div>
    );
};

export default UserManagementApp;