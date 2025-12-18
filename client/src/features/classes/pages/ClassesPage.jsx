import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button, Input, Select, Badge, Modal, Table, Pagination, Card } from '../../../components/ui';
import { getClasses, createClass, updateClass, deleteClass } from '../api';
import { getTeachers } from '../../teachers/api';

const classSchema = z.object({
  name: z.string().min(2, 'Class name must be at least 2 characters'),
  section: z.string().optional(),
  grade: z.string().min(1, 'Grade is required'),
  academicYear: z.string().min(4, 'Academic year is required'),
  roomNumber: z.string().optional(),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').optional(),
  classTeacherId: z.string().optional(),
});

const updateClassSchema = classSchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    academicYear: new Date().getFullYear().toString(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['classes', filters],
    queryFn: () => getClasses(filters),
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers', { limit: 100, status: 'ACTIVE' }],
    queryFn: () => getTeachers({ limit: 100, status: 'ACTIVE' }),
  });

  const teachers = teachersData?.data?.teachers || [];

  const createMutation = useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowCreateModal(false);
      toast.success('Class created successfully');
      createForm.reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create class');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowEditModal(false);
      setSelectedClass(null);
      toast.success('Class updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update class');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowDeleteModal(false);
      setSelectedClass(null);
      toast.success('Class deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete class');
    },
  });

  const createForm = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: {
      academicYear: new Date().getFullYear().toString(),
    },
  });

  const editForm = useForm({
    resolver: zodResolver(updateClassSchema),
  });

  const onCreateSubmit = (data) => {
    const payload = {
      ...data,
      capacity: data.capacity || undefined,
      classTeacherId: data.classTeacherId || undefined,
    };
    createMutation.mutate(payload);
  };

  const onEditSubmit = (data) => {
    if (selectedClass) {
      const payload = {
        ...data,
        capacity: data.capacity || undefined,
        classTeacherId: data.classTeacherId || undefined,
      };
      updateMutation.mutate({ id: selectedClass.id, data: payload });
    }
  };

  const handleEdit = (classItem) => {
    setSelectedClass(classItem);
    editForm.reset({
      name: classItem.name,
      section: classItem.section || '',
      grade: classItem.grade,
      academicYear: classItem.academicYear,
      roomNumber: classItem.roomNumber || '',
      capacity: classItem.capacity || '',
      classTeacherId: classItem.classTeacherId || '',
      status: classItem.status,
    });
    setShowEditModal(true);
  };

  const handleDelete = () => {
    if (selectedClass) {
      deleteMutation.mutate(selectedClass.id);
    }
  };

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handleYearFilter = (e) => {
    setFilters((prev) => ({ ...prev, academicYear: e.target.value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const columns = [
    {
      header: 'Class',
      accessor: 'name',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          {row.section && <p className="text-xs text-muted">Section: {row.section}</p>}
        </div>
      ),
    },
    {
      header: 'Grade',
      accessor: 'grade',
      cell: (row) => <Badge variant="info">{row.grade}</Badge>,
    },
    {
      header: 'Academic Year',
      accessor: 'academicYear',
    },
    {
      header: 'Class Teacher',
      accessor: 'classTeacher',
      cell: (row) =>
        row.classTeacher
          ? `${row.classTeacher.firstName} ${row.classTeacher.lastName}`
          : '-',
    },
    {
      header: 'Room',
      accessor: 'roomNumber',
      cell: (row) => row.roomNumber || '-',
    },
    {
      header: 'Students',
      accessor: '_count',
      cell: (row) => (
        <span>
          {row._count?.enrollments || 0}
          {row.capacity && ` / ${row.capacity}`}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      ),
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
          setSelectedClass(row);
          setShowDeleteModal(true);
        }}
      >
        Delete
      </Button>
    </div>
  );

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: '', label: 'All Years' },
    ...Array.from({ length: 5 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString(),
    })),
  ];

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">Failed to load classes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Classes</h1>
          <p className="text-muted">Manage class sections</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Add Class</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by class name..."
              value={filters.search}
              onChange={handleSearch}
            />
          </div>
          <div className="w-full md:w-40">
            <Select
              value={filters.academicYear}
              onChange={handleYearFilter}
              options={yearOptions}
            />
          </div>
          <div className="w-full md:w-40">
            <Select
              value={filters.status}
              onChange={handleStatusFilter}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={data?.data?.classes || []}
          loading={isLoading}
          actions={actions}
          emptyMessage="No classes found"
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
        title="Add New Class"
        size="lg"
      >
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Class Name"
              {...createForm.register('name')}
              error={createForm.formState.errors.name?.message}
              placeholder="e.g., Class 10"
            />
            <Input
              label="Section"
              {...createForm.register('section')}
              error={createForm.formState.errors.section?.message}
              placeholder="e.g., A"
            />
            <Input
              label="Grade"
              {...createForm.register('grade')}
              error={createForm.formState.errors.grade?.message}
              placeholder="e.g., 10"
            />
            <Input
              label="Academic Year"
              {...createForm.register('academicYear')}
              error={createForm.formState.errors.academicYear?.message}
              placeholder="e.g., 2024"
            />
            <Input
              label="Room Number"
              {...createForm.register('roomNumber')}
              error={createForm.formState.errors.roomNumber?.message}
            />
            <Input
              label="Capacity"
              type="number"
              {...createForm.register('capacity')}
              error={createForm.formState.errors.capacity?.message}
            />
            <Select
              label="Class Teacher"
              {...createForm.register('classTeacherId')}
              error={createForm.formState.errors.classTeacherId?.message}
              options={[
                { value: '', label: 'Select Teacher (Optional)' },
                ...teachers.map((t) => ({
                  value: t.id,
                  label: `${t.firstName} ${t.lastName}`,
                })),
              ]}
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
              Create Class
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClass(null);
        }}
        title="Edit Class"
        size="lg"
      >
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Class Name"
              {...editForm.register('name')}
              error={editForm.formState.errors.name?.message}
            />
            <Input
              label="Section"
              {...editForm.register('section')}
              error={editForm.formState.errors.section?.message}
            />
            <Input
              label="Grade"
              {...editForm.register('grade')}
              error={editForm.formState.errors.grade?.message}
            />
            <Input
              label="Academic Year"
              {...editForm.register('academicYear')}
              error={editForm.formState.errors.academicYear?.message}
            />
            <Input
              label="Room Number"
              {...editForm.register('roomNumber')}
              error={editForm.formState.errors.roomNumber?.message}
            />
            <Input
              label="Capacity"
              type="number"
              {...editForm.register('capacity')}
              error={editForm.formState.errors.capacity?.message}
            />
            <Select
              label="Class Teacher"
              {...editForm.register('classTeacherId')}
              error={editForm.formState.errors.classTeacherId?.message}
              options={[
                { value: '', label: 'No Teacher Assigned' },
                ...teachers.map((t) => ({
                  value: t.id,
                  label: `${t.firstName} ${t.lastName}`,
                })),
              ]}
            />
            <Select
              label="Status"
              {...editForm.register('status')}
              error={editForm.formState.errors.status?.message}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedClass(null);
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
          setSelectedClass(null);
        }}
        title="Delete Class"
      >
        <p className="text-muted mb-6">
          Are you sure you want to delete{' '}
          <span className="text-white font-medium">{selectedClass?.name}</span>? This
          action cannot be undone and may affect enrollments.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedClass(null);
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
