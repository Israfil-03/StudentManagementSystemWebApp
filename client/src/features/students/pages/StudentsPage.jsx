import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Input, Select, Badge, Modal, Table, Pagination, Card } from '../../../components/ui';
import { getStudents, createStudent, deleteStudent } from '../api';
import { formatDate } from '../../../lib/helpers';

const createStudentSchema = z.object({
  studentId: z.string().min(3, 'Student ID must be at least 3 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  address: z.string().optional(),
  guardianName: z.string().min(2, 'Guardian name is required'),
  guardianPhone: z.string().min(10, 'Guardian phone must be at least 10 digits'),
  guardianEmail: z.string().email('Invalid guardian email').optional().or(z.literal('')),
});

export default function StudentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['students', filters],
    queryFn: () => getStudents(filters),
  });

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowCreateModal(false);
      toast.success('Student created successfully');
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create student');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowDeleteModal(false);
      setSelectedStudent(null);
      toast.success('Student deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete student');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      gender: 'MALE',
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate({
      ...data,
      email: data.email || null,
      guardianEmail: data.guardianEmail || null,
    });
  };

  const handleDelete = () => {
    if (selectedStudent) {
      deleteMutation.mutate(selectedStudent.id);
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
      header: 'Student ID',
      accessor: 'studentId',
      cell: (row) => (
        <span className="font-mono text-primary">{row.studentId}</span>
      ),
    },
    {
      header: 'Name',
      accessor: 'firstName',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.firstName} {row.lastName}</p>
          {row.email && <p className="text-xs text-muted">{row.email}</p>}
        </div>
      ),
    },
    {
      header: 'Guardian',
      accessor: 'guardianName',
      cell: (row) => (
        <div>
          <p>{row.guardianName}</p>
          <p className="text-xs text-muted">{row.guardianPhone}</p>
        </div>
      ),
    },
    {
      header: 'Gender',
      accessor: 'gender',
      cell: (row) => (
        <Badge variant={row.gender === 'MALE' ? 'info' : row.gender === 'FEMALE' ? 'warning' : 'default'}>
          {row.gender}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : row.status === 'GRADUATED' ? 'info' : 'danger'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Enrolled',
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt),
    },
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(`/students/${row.id}`)}
      >
        View
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          setSelectedStudent(row);
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
        <p className="text-red-400">Failed to load students</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted">Manage student records</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Add Student</Button>
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
                { value: 'GRADUATED', label: 'Graduated' },
                { value: 'TRANSFERRED', label: 'Transferred' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={data?.data?.students || []}
          loading={isLoading}
          actions={actions}
          emptyMessage="No students found"
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
          reset();
        }}
        title="Add New Student"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Student ID"
              {...register('studentId')}
              error={errors.studentId?.message}
              placeholder="e.g., STU001"
            />
            <Select
              label="Gender"
              {...register('gender')}
              error={errors.gender?.message}
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
            <Input
              label="First Name"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="Optional"
            />
            <Input
              label="Phone"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="Optional"
            />
            <Input
              label="Date of Birth"
              type="date"
              {...register('dateOfBirth')}
              error={errors.dateOfBirth?.message}
            />
            <Input
              label="Address"
              {...register('address')}
              error={errors.address?.message}
              placeholder="Optional"
            />
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <h4 className="text-sm font-medium mb-3">Guardian Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Guardian Name"
                {...register('guardianName')}
                error={errors.guardianName?.message}
              />
              <Input
                label="Guardian Phone"
                {...register('guardianPhone')}
                error={errors.guardianPhone?.message}
              />
              <Input
                label="Guardian Email"
                type="email"
                {...register('guardianEmail')}
                error={errors.guardianEmail?.message}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStudent(null);
        }}
        title="Delete Student"
      >
        <p className="text-muted mb-6">
          Are you sure you want to delete{' '}
          <span className="text-white font-medium">
            {selectedStudent?.firstName} {selectedStudent?.lastName}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedStudent(null);
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
