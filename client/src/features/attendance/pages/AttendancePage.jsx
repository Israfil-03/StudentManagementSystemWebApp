import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, Select, Badge, Modal, Card } from '../../../components/ui';
import { getAttendanceByClass, markBulkAttendance } from '../api';
import { getClasses, getClassStudents } from '../../classes/api';
import { formatDate } from '../../../lib/helpers';

const statusColors = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  EXCUSED: 'info',
};

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});

  // Fetch active classes
  const { data: classesData } = useQuery({
    queryKey: ['classes', { status: 'ACTIVE', limit: 100 }],
    queryFn: () => getClasses({ status: 'ACTIVE', limit: 100 }),
  });

  const classes = classesData?.data?.classes || [];

  // Fetch students in selected class
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['class-students', selectedClass],
    queryFn: () => getClassStudents(selectedClass, { limit: 100 }),
    enabled: !!selectedClass,
  });

  const students = studentsData?.data?.students || [];

  // Fetch attendance records for selected class and date
  const { data: attendanceRecords, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', selectedClass, selectedDate],
    queryFn: () =>
      getAttendanceByClass(selectedClass, { date: selectedDate }),
    enabled: !!selectedClass && !!selectedDate,
  });

  const existingAttendance = useMemo(() => {
    const map = {};
    if (attendanceRecords?.data?.attendance) {
      attendanceRecords.data.attendance.forEach((record) => {
        map[record.studentId] = record;
      });
    }
    return map;
  }, [attendanceRecords]);

  // Mark bulk attendance mutation
  const markBulkMutation = useMutation({
    mutationFn: markBulkAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setShowMarkModal(false);
      setAttendanceData({});
      toast.success('Attendance marked successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to mark attendance');
    },
  });

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setAttendanceData({});
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setAttendanceData({});
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { status, remarks: prev[studentId]?.remarks || '' },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const handleMarkAll = (status) => {
    const newData = {};
    students.forEach((student) => {
      newData[student.id] = { status, remarks: '' };
    });
    setAttendanceData(newData);
  };

  const handleSubmitAttendance = () => {
    const records = Object.entries(attendanceData).map(([studentId, data]) => ({
      studentId,
      classSectionId: selectedClass,
      date: selectedDate,
      status: data.status,
      remarks: data.remarks || undefined,
    }));

    if (records.length === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }

    markBulkMutation.mutate({ records });
  };

  const isLoading = loadingStudents || loadingAttendance;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted">Track student attendance</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Class</label>
            <Select
              value={selectedClass}
              onChange={handleClassChange}
              options={[
                { value: '', label: 'Select Class' },
                ...classes.map((c) => ({
                  value: c.id,
                  label: `${c.name}${c.section ? ` - ${c.section}` : ''} (${c.academicYear})`,
                })),
              ]}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="input-field w-full"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          {selectedClass && (
            <div className="flex items-end">
              <Button onClick={() => setShowMarkModal(true)}>
                Mark Attendance
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Attendance Overview */}
      {selectedClass && (
        <Card>
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">
              Attendance for {formatDate(selectedDate)}
            </h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-muted">
              No students enrolled in this class
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-light">
                  <tr>
                    <th className="table-header">Student ID</th>
                    <th className="table-header">Name</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Remarks</th>
                    <th className="table-header">Marked At</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const record = existingAttendance[student.id];
                    return (
                      <tr key={student.id} className="table-row">
                        <td className="table-cell font-mono text-primary">
                          {student.studentId}
                        </td>
                        <td className="table-cell">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="table-cell">
                          {record ? (
                            <Badge variant={statusColors[record.status]}>
                              {record.status}
                            </Badge>
                          ) : (
                            <span className="text-muted">Not marked</span>
                          )}
                        </td>
                        <td className="table-cell">
                          {record?.remarks || '-'}
                        </td>
                        <td className="table-cell text-muted">
                          {record?.createdAt
                            ? new Date(record.createdAt).toLocaleTimeString()
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {students.length > 0 && Object.keys(existingAttendance).length > 0 && (
            <div className="p-4 border-t border-border">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="success">Present</Badge>
                  <span>
                    {
                      Object.values(existingAttendance).filter(
                        (r) => r.status === 'PRESENT'
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="danger">Absent</Badge>
                  <span>
                    {
                      Object.values(existingAttendance).filter(
                        (r) => r.status === 'ABSENT'
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Late</Badge>
                  <span>
                    {
                      Object.values(existingAttendance).filter(
                        (r) => r.status === 'LATE'
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">Excused</Badge>
                  <span>
                    {
                      Object.values(existingAttendance).filter(
                        (r) => r.status === 'EXCUSED'
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {!selectedClass && (
        <Card className="p-8 text-center">
          <p className="text-muted">Select a class to view attendance</p>
        </Card>
      )}

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={showMarkModal}
        onClose={() => {
          setShowMarkModal(false);
          setAttendanceData({});
        }}
        title={`Mark Attendance - ${formatDate(selectedDate)}`}
        size="xl"
      >
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 pb-4 border-b border-border">
            <span className="text-sm text-muted mr-2">Mark all as:</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleMarkAll('PRESENT')}
            >
              Present
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleMarkAll('ABSENT')}
            >
              Absent
            </Button>
          </div>

          {/* Student List */}
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-surface-light sticky top-0">
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header w-40">Status</th>
                  <th className="table-header">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="table-row">
                    <td className="table-cell">
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-muted font-mono">
                          {student.studentId}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <select
                        value={
                          attendanceData[student.id]?.status ||
                          existingAttendance[student.id]?.status ||
                          ''
                        }
                        onChange={(e) =>
                          handleStatusChange(student.id, e.target.value)
                        }
                        className="input-field w-full text-sm"
                      >
                        <option value="">Select</option>
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                        <option value="EXCUSED">Excused</option>
                      </select>
                    </td>
                    <td className="table-cell">
                      <input
                        type="text"
                        placeholder="Optional remarks"
                        value={
                          attendanceData[student.id]?.remarks ||
                          existingAttendance[student.id]?.remarks ||
                          ''
                        }
                        onChange={(e) =>
                          handleRemarksChange(student.id, e.target.value)
                        }
                        className="input-field w-full text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <p className="text-sm text-muted">
              {Object.keys(attendanceData).length} of {students.length} marked
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowMarkModal(false);
                  setAttendanceData({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAttendance}
                loading={markBulkMutation.isPending}
                disabled={Object.keys(attendanceData).length === 0}
              >
                Save Attendance
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
