import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button, Input, Select, Badge, Modal, Card } from '../../../components/ui';
import { getStudent, updateStudent, deleteStudent } from '../api';
import { formatDate } from '../../../lib/helpers';

const updateStudentSchema = z.object({
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
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED']),
});

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: student, isLoading, error } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEditing(false);
      toast.success('Student updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update student');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
      navigate('/students');
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
    resolver: zodResolver(updateStudentSchema),
    values: student ? {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
      gender: student.gender,
      address: student.address || '',
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      guardianEmail: student.guardianEmail || '',
      status: student.status,
    } : undefined,
  });

  const onSubmit = (data) => {
    updateMutation.mutate({
      ...data,
      email: data.email || null,
      guardianEmail: data.guardianEmail || null,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 mb-4">Student not found</p>
        <Button onClick={() => navigate('/students')}>Back to Students</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/students')}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-muted font-mono">{student.studentId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              student.status === 'ACTIVE'
                ? 'success'
                : student.status === 'GRADUATED'
                ? 'info'
                : 'danger'
            }
            size="lg"
          >
            {student.status}
          </Badge>
          {!isEditing && (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Edit Form */
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                />
                <Input
                  label="Phone"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  {...register('dateOfBirth')}
                  error={errors.dateOfBirth?.message}
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
                  label="Address"
                  {...register('address')}
                  error={errors.address?.message}
                  className="md:col-span-2"
                />
                <Select
                  label="Status"
                  {...register('status')}
                  error={errors.status?.message}
                  options={[
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'INACTIVE', label: 'Inactive' },
                    { value: 'GRADUATED', label: 'Graduated' },
                    { value: 'TRANSFERRED', label: 'Transferred' },
                  ]}
                />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4">Guardian Information</h3>
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
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="submit" loading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* View Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted">Full Name</p>
                <p className="font-medium">{student.firstName} {student.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Student ID</p>
                <p className="font-mono text-primary">{student.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Email</p>
                <p>{student.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Phone</p>
                <p>{student.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Date of Birth</p>
                <p>{student.dateOfBirth ? formatDate(student.dateOfBirth) : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Gender</p>
                <Badge variant={student.gender === 'MALE' ? 'info' : student.gender === 'FEMALE' ? 'warning' : 'default'}>
                  {student.gender}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted">Address</p>
                <p>{student.address || '-'}</p>
              </div>
            </div>
          </Card>

          {/* Guardian Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Guardian</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted">Name</p>
                <p className="font-medium">{student.guardianName}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Phone</p>
                <p>{student.guardianPhone}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Email</p>
                <p>{student.guardianEmail || '-'}</p>
              </div>
            </div>
          </Card>

          {/* Enrollments */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Enrollments</h3>
            {student.enrollments?.length > 0 ? (
              <div className="space-y-3">
                {student.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-3 bg-surface-light rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{enrollment.classSection?.name}</p>
                      <p className="text-sm text-muted">
                        Enrolled: {formatDate(enrollment.enrolledAt)}
                      </p>
                    </div>
                    <Badge
                      variant={enrollment.status === 'ACTIVE' ? 'success' : 'default'}
                    >
                      {enrollment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-4">No enrollments yet</p>
            )}
          </Card>

          {/* Meta Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Record Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted">Created</p>
                <p>{formatDate(student.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Last Updated</p>
                <p>{formatDate(student.updatedAt)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Student"
      >
        <p className="text-muted mb-6">
          Are you sure you want to delete{' '}
          <span className="text-white font-medium">
            {student.firstName} {student.lastName}
          </span>
          ? This action cannot be undone and will remove all associated records.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteMutation.mutate()}
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
