import React, { useEffect } from 'react';
import { validateUserForm } from '../utils/Validation'; 
import type { User, UserFormData } from '../types/User.types';
import { Form, Input, message, Modal } from 'antd';

interface UserFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: UserFormData) => Promise<void>;
  initialValues?: User | null;
  title: string;
}

const UserForm: React.FC<UserFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  title,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        firstName: initialValues.firstName,
        lastName: initialValues.lastName,
        phone: initialValues.phone,
        email: initialValues.email,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Custom validation
      const errors = validateUserForm(values);
      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, error]) => {
          form.setFields([{ name: field, errors: [error] }]);
        });
        return;
      }

      setLoading(true);
      await onSubmit(values);
      form.resetFields();
      message.success(`User ${initialValues ? 'updated' : 'created'} successfully`);
      onCancel();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error?.errorFields) {
        // Form validation errors
        return;
      } else {
        message.error('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={initialValues ? 'Update' : 'Create'}
      cancelText="Cancel"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[
            { required: true, message: 'Please input first name!' },
            { whitespace: true, message: 'First name cannot be empty!' },
          ]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[
            { required: true, message: 'Please input last name!' },
            { whitespace: true, message: 'Last name cannot be empty!' },
          ]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: 'Please input phone number!' },
            { pattern: /^[0-9]{10}$/, message: 'Phone must be exactly 10 digits!' },
          ]}
        >
          <Input placeholder="Enter 10-digit phone number" maxLength={10} />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input placeholder="Enter email address" type="email" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;