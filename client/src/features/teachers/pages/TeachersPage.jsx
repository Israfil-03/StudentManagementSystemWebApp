import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button, Input, Select, Badge, Modal, Table, Pagination, Card } from '../../../components/ui';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../api';
import { formatDate } from '../../../lib/helpers';

const teacherSchema = z.object({
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
});

const updateTeacherSchema = teacherSchema.omit({ employeeId: true }).extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']),
});

export default function TeachersPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['teachers', filters],
    queryFn: () => getTeachers(filters),
  });

  const createMutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setShowCreateModal(false);
      toast.success('Teacher created successfully');
      createForm.reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create teacher');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTeacher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setShowEditModal(false);
      setSelectedTeacher(null);
      toast.success('Teacher updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update teacher');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setShowDeleteModal(false);
      setSelectedTeacher(null);
      toast.success('Teacher deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete teacher');
    },
  });

  const createForm = useForm({
    resolver: zodResolver(teacherSchema),
  });

  const editForm = useForm({
    resolver: zodResolver(updateTeacherSchema),
  });

  const onCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data) => {
    if (selectedTeacher) {
      updateMutation.mutate({ id: selectedTeacher.id, data });
    }
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    editForm.reset({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || '',
      specialization: teacher.specialization || '',
      qualification: teacher.qualification || '',
      status: teacher.status,
    });
    setShowEditModal(true);
  };

  const handleDelete = () => {
    if (selectedTeacher) {
      deleteMutation.mutate(selectedTeacher.id);
    }
  };

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      cell: (row) => (
        <span className="font-mono text-primary">{row.employeeId}</span>
      ),
    },
    {
      header: 'Name',
      accessor: 'firstName',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.firstName} {row.lastName}</p>
          <p className="text-xs text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Specialization',
      accessor: 'specialization',
      cell: (row) => row.specialization || '-',
    },
    {
      header: 'Qualification',
      accessor: 'qualification',
      cell: (row) => row.qualification || '-',
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge
          variant={
            row.status === 'ACTIVE'
              ? 'success'
              : row.status === 'ON_LEAVE'
              ? 'warning'
              : 'danger'
          }
        >
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt),
    },
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={() => handleEdit(row)}>
        Edit
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          setSelectedTeacher(row);
          setShowDeleteModal(true);
        }}
      >
        Delete
      </Button>
    </div>
  );

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">Failed to load teachers</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-muted">Manage teacher records</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Add Teacher</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, ID, or email..."
              value={filters.search}
              onChange={handleSearch}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={filters.status}
              onChange={handleStatusFilter}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'ON_LEAVE', label: 'On Leave' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={data?.data?.teachers || []}
          loading={isLoading}
          actions={actions}
          emptyMessage="No teachers found"
        />
        {data?.data?.pagination && (
          <div className="p-4 border-t border-border">
            <Pagination
              currentPage={data.data.pagination.page}
              totalPages={data.data.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          createForm.reset();
        }}
        title="Add New Teacher"
        size="lg"
      >
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              {...createForm.register('employeeId')}
              error={createForm.formState.errors.employeeId?.message}
              placeholder="e.g., TCH001"
            />
            <Input
              label="Email"
              type="email"
              {...createForm.register('email')}
              error={createForm.formState.errors.email?.message}
            />
            <Input
              label="First Name"
              {...createForm.register('firstName')}
              error={createForm.formState.errors.firstName?.message}
            />
            <Input
              label="Last Name"
              {...createForm.register('lastName')}
              error={createForm.formState.errors.lastName?.message}
            />
            <Input
              label="Phone"
              {...createForm.register('phone')}
              error={createForm.formState.errors.phone?.message}
            />
            <Input
              label="Specialization"
              {...createForm.register('specialization')}
              error={createForm.formState.errors.specialization?.message}
              placeholder="e.g., Mathematics"
            />
            <Input
              label="Qualification"
              {...createForm.register('qualification')}
              error={createForm.formState.errors.qualification?.message}
              placeholder="e.g., M.Sc., B.Ed."
              className="md:col-span-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                createForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Teacher
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTeacher(null);
        }}
        title="Edit Teacher"
        size="lg"
      >
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...editForm.register('firstName')}
              error={editForm.formState.errors.firstName?.message}
            />
            <Input
              label="Last Name"
              {...editForm.register('lastName')}
              error={editForm.formState.errors.lastName?.message}
            />
            <Input
              label="Email"
              type="email"
              {...editForm.register('email')}
              error={editForm.formState.errors.email?.message}
            />
            <Input
              label="Phone"
              {...editForm.register('phone')}
              error={editForm.formState.errors.phone?.message}
            />
            <Input
              label="Specialization"
              {...editForm.register('specialization')}
              error={editForm.formState.errors.specialization?.message}
            />
            <Input
              label="Qualification"
              {...editForm.register('qualification')}
              error={editForm.formState.errors.qualification?.message}
            />
            <Select
              label="Status"
              {...editForm.register('status')}
              error={editForm.formState.errors.status?.message}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'ON_LEAVE', label: 'On Leave' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedTeacher(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTeacher(null);
        }}
        title="Delete Teacher"
      >
        <p className="text-muted mb-6">
          Are you sure you want to delete{' '}
          <span className="text-white font-medium">
            {selectedTeacher?.firstName} {selectedTeacher?.lastName}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedTeacher(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
