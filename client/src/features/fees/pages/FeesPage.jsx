import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button, Input, Select, Badge, Modal, Table, Pagination, Card } from '../../../components/ui';
import { getFees, createFee, updateFee, recordPayment, deleteFee } from '../api';
import { getStudents } from '../../students/api';
import { formatDate, formatCurrency } from '../../../lib/helpers';

const feeSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  type: z.enum(['TUITION', 'TRANSPORT', 'LIBRARY', 'LABORATORY', 'SPORTS', 'EXAM', 'OTHER']),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  description: z.string().optional(),
  academicYear: z.string().min(4, 'Academic year is required'),
});

const paymentSchema = z.object({
  amountPaid: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE']),
  transactionId: z.string().optional(),
  remarks: z.string().optional(),
});

const feeTypes = [
  { value: 'TUITION', label: 'Tuition' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'LIBRARY', label: 'Library' },
  { value: 'LABORATORY', label: 'Laboratory' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'EXAM', label: 'Examination' },
  { value: 'OTHER', label: 'Other' },
];

const statusColors = {
  PENDING: 'warning',
  PARTIAL: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
};

export default function FeesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    type: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['fees', filters],
    queryFn: () => getFees(filters),
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', { limit: 100, status: 'ACTIVE' }],
    queryFn: () => getStudents({ limit: 100, status: 'ACTIVE' }),
  });

  const students = studentsData?.data?.students || [];

  const createMutation = useMutation({
    mutationFn: createFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      setShowCreateModal(false);
      toast.success('Fee record created successfully');
      createForm.reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create fee');
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, data }) => recordPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      setShowPaymentModal(false);
      setSelectedFee(null);
      toast.success('Payment recorded successfully');
      paymentForm.reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to record payment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      setShowDeleteModal(false);
      setSelectedFee(null);
      toast.success('Fee record deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete fee');
    },
  });

  const createForm = useForm({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      academicYear: new Date().getFullYear().toString(),
      type: 'TUITION',
    },
  });

  const paymentForm = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'CASH',
    },
  });

  const onCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const onPaymentSubmit = (data) => {
    if (selectedFee) {
      paymentMutation.mutate({ id: selectedFee.id, data });
    }
  };

  const handleRecordPayment = (fee) => {
    setSelectedFee(fee);
    paymentForm.reset({
      amountPaid: fee.amount - fee.paidAmount,
      paymentMethod: 'CASH',
    });
    setShowPaymentModal(true);
  };

  const handleDelete = () => {
    if (selectedFee) {
      deleteMutation.mutate(selectedFee.id);
    }
  };

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handleTypeFilter = (e) => {
    setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'student',
      cell: (row) => (
        <div>
          <p className="font-medium">
            {row.student?.firstName} {row.student?.lastName}
          </p>
          <p className="text-xs text-muted font-mono">{row.student?.studentId}</p>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row) => (
        <Badge variant="default">{row.type}</Badge>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (row) => (
        <div>
          <p className="font-medium">{formatCurrency(row.amount)}</p>
          {row.paidAmount > 0 && row.paidAmount < row.amount && (
            <p className="text-xs text-success">
              Paid: {formatCurrency(row.paidAmount)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      cell: (row) => formatDate(row.dueDate),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={statusColors[row.status]}>{row.status}</Badge>
      ),
    },
    {
      header: 'Year',
      accessor: 'academicYear',
    },
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      {row.status !== 'PAID' && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleRecordPayment(row)}
        >
          Pay
        </Button>
      )}
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          setSelectedFee(row);
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
        <p className="text-red-400">Failed to load fees</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fee Management</h1>
          <p className="text-muted">Track and manage student fees</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Add Fee</Button>
      </div>

      {/* Summary Cards */}
      {data?.data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted">Total Fees</p>
            <p className="text-2xl font-bold">
              {formatCurrency(data.data.summary.totalAmount || 0)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted">Collected</p>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(data.data.summary.paidAmount || 0)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted">Pending</p>
            <p className="text-2xl font-bold text-warning">
              {formatCurrency(data.data.summary.pendingAmount || 0)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted">Overdue</p>
            <p className="text-2xl font-bold text-danger">
              {formatCurrency(data.data.summary.overdueAmount || 0)}
            </p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by student name or ID..."
              value={filters.search}
              onChange={handleSearch}
            />
          </div>
          <div className="w-full md:w-40">
            <Select
              value={filters.type}
              onChange={handleTypeFilter}
              options={[{ value: '', label: 'All Types' }, ...feeTypes]}
            />
          </div>
          <div className="w-full md:w-40">
            <Select
              value={filters.status}
              onChange={handleStatusFilter}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'PARTIAL', label: 'Partial' },
                { value: 'PAID', label: 'Paid' },
                { value: 'OVERDUE', label: 'Overdue' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={data?.data?.fees || []}
          loading={isLoading}
          actions={actions}
          emptyMessage="No fee records found"
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

      {/* Create Fee Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          createForm.reset();
        }}
        title="Add New Fee"
        size="lg"
      >
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Student"
              {...createForm.register('studentId')}
              error={createForm.formState.errors.studentId?.message}
              options={[
                { value: '', label: 'Select Student' },
                ...students.map((s) => ({
                  value: s.id,
                  label: `${s.firstName} ${s.lastName} (${s.studentId})`,
                })),
              ]}
              className="md:col-span-2"
            />
            <Select
              label="Fee Type"
              {...createForm.register('type')}
              error={createForm.formState.errors.type?.message}
              options={feeTypes}
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              {...createForm.register('amount')}
              error={createForm.formState.errors.amount?.message}
            />
            <Input
              label="Due Date"
              type="date"
              {...createForm.register('dueDate')}
              error={createForm.formState.errors.dueDate?.message}
            />
            <Input
              label="Academic Year"
              {...createForm.register('academicYear')}
              error={createForm.formState.errors.academicYear?.message}
            />
            <Input
              label="Description"
              {...createForm.register('description')}
              error={createForm.formState.errors.description?.message}
              placeholder="Optional"
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
              Create Fee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedFee(null);
          paymentForm.reset();
        }}
        title="Record Payment"
      >
        {selectedFee && (
          <div className="mb-4 p-3 bg-surface-light rounded-lg">
            <p className="text-sm text-muted">Outstanding Balance</p>
            <p className="text-xl font-bold">
              {formatCurrency(selectedFee.amount - selectedFee.paidAmount)}
            </p>
          </div>
        )}
        <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            {...paymentForm.register('amountPaid')}
            error={paymentForm.formState.errors.amountPaid?.message}
          />
          <Select
            label="Payment Method"
            {...paymentForm.register('paymentMethod')}
            error={paymentForm.formState.errors.paymentMethod?.message}
            options={[
              { value: 'CASH', label: 'Cash' },
              { value: 'CARD', label: 'Card' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
              { value: 'CHEQUE', label: 'Cheque' },
              { value: 'ONLINE', label: 'Online' },
            ]}
          />
          <Input
            label="Transaction ID"
            {...paymentForm.register('transactionId')}
            error={paymentForm.formState.errors.transactionId?.message}
            placeholder="Optional"
          />
          <Input
            label="Remarks"
            {...paymentForm.register('remarks')}
            error={paymentForm.formState.errors.remarks?.message}
            placeholder="Optional"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedFee(null);
                paymentForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={paymentMutation.isPending}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedFee(null);
        }}
        title="Delete Fee Record"
      >
        <p className="text-muted mb-6">
          Are you sure you want to delete this fee record for{' '}
          <span className="text-white font-medium">
            {selectedFee?.student?.firstName} {selectedFee?.student?.lastName}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedFee(null);
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
