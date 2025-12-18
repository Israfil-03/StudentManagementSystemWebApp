import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getStaff, createStaff, deactivateStaff, reactivateStaff, resetStaffPassword } from '../api';
import { Button, Input, Select, Table, Modal, Badge, Pagination } from '../../../components/ui';
import { formatDateTime, getRoleDisplayName } from '../../../lib/helpers';
import { useAuth } from '../../../app/AuthProvider';

const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'STAFF']),
});

export default function StaffPage() {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['staff', page, search],
    queryFn: () => getStaff({ page, limit: 10, q: search }),
  });

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member created successfully');
      setIsCreateModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create staff');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member deactivated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to deactivate staff');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member reactivated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to reactivate staff');
    },
  });

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Role',
      render: (row) => (
        <Badge color={row.role === 'ADMIN' ? 'purple' : 'primary'}>
          {getRoleDisplayName(row.role)}
        </Badge>
      )
    },
    { 
      key: 'active', 
      header: 'Status',
      render: (row) => (
        <Badge color={row.active ? 'success' : 'danger'}>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Created',
      render: (row) => formatDateTime(row.createdAt)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStaff(row);
              setIsResetPasswordModalOpen(true);
            }}
          >
            Reset Password
          </Button>
          {row.active ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => deactivateMutation.mutate(row.id)}
              loading={deactivateMutation.isPending}
              disabled={row.role === 'SUPER_ADMIN'}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => reactivateMutation.mutate(row.id)}
              loading={reactivateMutation.isPending}
            >
              Reactivate
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Staff Management</h1>
          <p className="text-surface-400 mt-1">Manage system users and permissions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Staff
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data?.data?.staff || []}
        loading={isLoading}
        emptyMessage="No staff members found"
      />

      {/* Pagination */}
      {data?.meta && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          limit={data.meta.limit}
          onPageChange={setPage}
        />
      )}

      {/* Create Modal */}
      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        loading={createMutation.isPending}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
      />
    </div>
  );
}

function CreateStaffModal({ isOpen, onClose, onSubmit, loading, isSuperAdmin }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { role: 'STAFF' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const roleOptions = isSuperAdmin 
    ? [{ value: 'ADMIN', label: 'Admin' }, { value: 'STAFF', label: 'Staff' }]
    : [{ value: 'STAFF', label: 'Staff' }];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Staff Member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          placeholder="Full name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Select
          label="Role"
          options={roleOptions}
          error={errors.role?.message}
          {...register('role')}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create</Button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ isOpen, onClose, staff }) {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await resetStaffPassword(staff.id, password);
      toast.success('Password reset successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setPassword('');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-surface-400">
          Reset password for <span className="text-surface-100 font-medium">{staff?.name}</span>
        </p>
        <Input
          label="New Password"
          type="password"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Reset Password</Button>
        </div>
      </form>
    </Modal>
  );
}
