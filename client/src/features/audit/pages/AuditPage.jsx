import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, Select, Badge, Modal, Table, Pagination, Card } from '../../../components/ui';
import { getAuditLogs, getAuditLog } from '../api';
import { formatDate } from '../../../lib/helpers';
import { useAuth } from '../../../app/AuthProvider';
import { Navigate } from 'react-router-dom';

const actionColors = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  LOGIN: 'warning',
  LOGOUT: 'default',
};

const entityTypes = [
  'User',
  'Student',
  'Teacher',
  'ClassSection',
  'Subject',
  'Enrollment',
  'Attendance',
  'Fee',
];

export default function AuditPage() {
  const { user } = useAuth();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });

  // Only SUPER_ADMIN can access audit logs
  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => getAuditLogs(filters),
  });

  const { data: logDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['audit-log', selectedLogId],
    queryFn: () => getAuditLog(selectedLogId),
    enabled: !!selectedLogId,
  });

  const handleViewDetail = (log) => {
    setSelectedLogId(log.id);
    setShowDetailModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      cell: (row) => (
        <div>
          <p>{formatDate(row.createdAt)}</p>
          <p className="text-xs text-muted">
            {new Date(row.createdAt).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      header: 'User',
      accessor: 'user',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.user?.username || 'System'}</p>
          {row.user?.role && (
            <p className="text-xs text-muted">{row.user.role}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      cell: (row) => (
        <Badge variant={actionColors[row.action] || 'default'}>
          {row.action}
        </Badge>
      ),
    },
    {
      header: 'Entity',
      accessor: 'entityType',
      cell: (row) => (
        <div>
          <p>{row.entityType}</p>
          <p className="text-xs text-muted font-mono">{row.entityId}</p>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (row) => (
        <p className="max-w-xs truncate" title={row.description}>
          {row.description || '-'}
        </p>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      cell: (row) => (
        <span className="font-mono text-sm">{row.ipAddress || '-'}</span>
      ),
    },
  ];

  const actions = (row) => (
    <Button variant="secondary" size="sm" onClick={() => handleViewDetail(row)}>
      Details
    </Button>
  );

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">Failed to load audit logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted">System activity and change history</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-40">
            <label className="block text-sm font-medium mb-1">Action</label>
            <Select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              options={[
                { value: '', label: 'All Actions' },
                { value: 'CREATE', label: 'Create' },
                { value: 'UPDATE', label: 'Update' },
                { value: 'DELETE', label: 'Delete' },
                { value: 'LOGIN', label: 'Login' },
                { value: 'LOGOUT', label: 'Logout' },
              ]}
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-sm font-medium mb-1">Entity Type</label>
            <Select
              value={filters.entityType}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              options={[
                { value: '', label: 'All Entities' },
                ...entityTypes.map((type) => ({ value: type, label: type })),
              ]}
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 20,
                  action: '',
                  entityType: '',
                  startDate: '',
                  endDate: '',
                })
              }
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={data?.data?.auditLogs || []}
          loading={isLoading}
          actions={actions}
          emptyMessage="No audit logs found"
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedLogId(null);
        }}
        title="Audit Log Details"
        size="lg"
      >
        {loadingDetail ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : logDetail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted">Timestamp</p>
                <p>
                  {formatDate(logDetail.createdAt)}{' '}
                  {new Date(logDetail.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">User</p>
                <p>{logDetail.user?.username || 'System'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Action</p>
                <Badge variant={actionColors[logDetail.action] || 'default'}>
                  {logDetail.action}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted">Entity</p>
                <p>
                  {logDetail.entityType}{' '}
                  <span className="text-muted font-mono text-sm">
                    ({logDetail.entityId})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">IP Address</p>
                <p className="font-mono">{logDetail.ipAddress || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">User Agent</p>
                <p className="text-sm truncate" title={logDetail.userAgent}>
                  {logDetail.userAgent || '-'}
                </p>
              </div>
            </div>

            {logDetail.description && (
              <div>
                <p className="text-sm text-muted mb-1">Description</p>
                <p className="p-3 bg-surface-light rounded">{logDetail.description}</p>
              </div>
            )}

            {logDetail.oldValues && (
              <div>
                <p className="text-sm text-muted mb-1">Previous Values</p>
                <pre className="p-3 bg-surface-light rounded text-sm overflow-x-auto">
                  {JSON.stringify(logDetail.oldValues, null, 2)}
                </pre>
              </div>
            )}

            {logDetail.newValues && (
              <div>
                <p className="text-sm text-muted mb-1">New Values</p>
                <pre className="p-3 bg-surface-light rounded text-sm overflow-x-auto">
                  {JSON.stringify(logDetail.newValues, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted">No details available</p>
        )}
        <div className="flex justify-end pt-4">
          <Button
            variant="secondary"
            onClick={() => {
              setShowDetailModal(false);
              setSelectedLogId(null);
            }}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
