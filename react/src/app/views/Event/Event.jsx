import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Trash2, 
  Filter, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  X, 
  Bell, 
  Clock,
  Eye as EyeIcon,
  Edit2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';

const formatDisplayDate = (value) => {
  if (!value) return '—';

  const rawValue = String(value).trim();
  const dateOnly = rawValue.includes('T') ? rawValue.split('T')[0] : rawValue;
  const parsedDate = /^\d{2}-\d{2}-\d{4}$/.test(dateOnly)
    ? (() => {
        const [day, month, year] = dateOnly.split('-');
        return new Date(Number(year), Number(month) - 1, Number(day));
      })()
    : new Date(dateOnly);

  if (Number.isNaN(parsedDate.getTime())) return dateOnly;

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const Event = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      company: "HR1",
      department: "Analyst",
      emailTitle: "Birthday Party",
      eventDate: "03-04-2021",
      eventTime: "04:20 PM",
      eventNote: "Birthday Party",
      notification: true
    },
    {
      id: 2,
      company: "HR1",
      department: "Finance",
      emailTitle: "test",
      eventDate: "28-02-2021",
      eventTime: "07:40 PM",
      eventNote: "",
      notification: false
    }
  ]);

  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [showEventInfo, setShowEventInfo] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditEventForm, setShowEditEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  
  const [visibleColumns, setVisibleColumns] = useState({
    company: true,
    department: true,
    emailTitle: true,
    eventDate: true,
    eventTime: true,
    actions: true
  });

  const [newEvent, setNewEvent] = useState({
    company: 'HR1',
    department: '',
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    eventNote: '',
    notification: true
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeValue, setTimeValue] = useState('12:00');
  const [amPm, setAmPm] = useState('PM');

  const [isAdding, setIsAdding] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const timePickerRef = useRef(null);
  const columnsDropdownRef = useRef(null);

  const companyOptions = ["HR1", "HR2", "Aarya Trans Solutions pune"];
  const departmentOptions = [
    "Accounts Analyst", "Billing", "CSE", "Finance",
    "HR & Admin", "MIS", "Operations (Bus)"
  ];

  // PDF download function
  const handleDownloadPDF = () => {
    const pdfContent = `===== Page 1 =====

# Aarya Trans Solutions Pvt. Ltd.

| Department | Event Title | Event Date | Event Time |
|---|---|---|---|
${events.map(event => `| ${event.department} | ${event.emailTitle} | ${formatDisplayDate(event.eventDate)} | ${event.eventTime}    |`).join('\n')}

Total Events: ${events.length}
Generated on: ${new Date().toLocaleDateString('en-IN')}`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aarya_Trans_Solutions_Events_${new Date().toISOString().split('T')[0]}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('PDF download started!');
  };

  // CSV download function
  const handleDownloadCSV = () => {
    let csvContent = '"Department","Event Title","Event Date","Event Time"\r\n';
    
    events.forEach(event => {
      const formattedTime = event.eventTime.replace(' ', '');
      
      const row = [
        `"${event.department}"`,
        `"${event.emailTitle}"`,
        `"${event.eventDate}"`,
        `"${formattedTime}"`
      ].join(',');
      csvContent += row + '\r\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aarya_Trans_Solutions_Events_${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('CSV file download started!');
  };

  // Print function
  const handlePrint = () => {
    executePrint();
  };

  // Actual print function
  const executePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Aarya Trans Solutions Pvt. Ltd. - Events Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 20px;
            color: #333;
            font-size: 11px;
          }
          .page-container {
            width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 18px;
            border-bottom: 2px solid #5e35b1;
            padding-bottom: 8px;
          }
          .header h1 {
            color: #5e35b1;
            margin: 0;
            font-size: 18px;
          }
          .header h2 {
            color: #666;
            margin: 3px 0 0 0;
            font-size: 13px;
          }
          .print-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 14px;
            font-size: 11px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14px;
            font-size: 11px;
          }
          th {
            background-color: #f8f9fa;
            color: #333;
            font-weight: bold;
            padding: 6px 8px;
            text-align: left;
            border: 1px solid #ddd;
          }
          td {
            padding: 5px 8px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Aarya Trans Solutions Pvt. Ltd.</h1>
          <h2>Events & Meetings Report</h2>
        </div>
        
        <div class="print-info">
          <div>Generated on: ${new Date().toLocaleDateString('en-IN')}</div>
          <div>Total Events: ${events.length}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Department</th>
              <th>Event Title</th>
              <th>Event Date</th>
              <th>Event Time</th>
              <th>Notification</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(event => `
              <tr>
                <td>${event.company}</td>
                <td>${event.department}</td>
                <td>${event.emailTitle}</td>
                <td>${event.eventDate}</td>
                <td>${event.eventTime}</td>
                <td>${event.notification ? 'On' : 'Off'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p> Aarya Trans Solutions Pvt. Ltd. | Page 1 of 1</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="
            background-color: #5e35b1;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-right: 10px;
          ">Print Now</button>
          <button onclick="window.close()" style="
            background-color: #666;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          ">Close</button>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
    };
    
    setShowPrintDialog(false);
  };

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        times.push(`${hourStr}:${minuteStr}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // View Event Handler
  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventInfo(true);
  };

  // Edit Event Handler
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({
      company: event.company,
      department: event.department,
      eventTitle: event.emailTitle,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      eventNote: event.eventNote || '',
      notification: event.notification
    });
    
    if (event.eventTime) {
      const [time, period] = event.eventTime.split(' ');
      setTimeValue(time);
      setAmPm(period || 'PM');
    }
    
    setShowEditEventForm(true);
  };

  // Handle update event
  const handleUpdateEvent = (e) => {
    e.preventDefault();
    
    const updatedEvents = events.map(event => {
      if (event.id === editingEvent.id) {
        return {
          ...event,
          company: newEvent.company,
          department: newEvent.department,
          emailTitle: newEvent.eventTitle,
          eventDate: newEvent.eventDate,
          eventTime: newEvent.eventTime,
          eventNote: newEvent.eventNote,
          notification: newEvent.notification
        };
      }
      return event;
    });
    
    setEvents(updatedEvents);
    setShowEditEventForm(false);
    setEditingEvent(null);
    setNewEvent({
      company: 'HR1',
      department: '',
      eventTitle: '',
      eventDate: '',
      eventTime: '',
      eventNote: '',
      notification: true
    });
  };

  // Filtering
  const filteredEvents = events.filter(event =>
    event.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.emailTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.eventNote && event.eventNote.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const recordsNum = recordsPerPage === 'All' ? filteredEvents.length : parseInt(recordsPerPage);
  const startIndex = (currentPage - 1) * recordsNum;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + recordsNum);
  const totalPages = Math.ceil(filteredEvents.length / (recordsNum || 1));

  // Row selection
  const toggleRowSelection = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(paginatedEvents.map(e => e.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Bulk delete function
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      alert("कृपया डिलीट करण्यासाठी किमान एक रो निवडा!");
      return;
    }
    
    const confirmDelete = window.confirm(`तुम्हाला ${selectedRows.length} इव्हेंट डिलीट करायचे आहेत का?`);
    
    if (confirmDelete) {
      setIsBulkDeleting(true);
      const updatedEvents = events.filter(event => !selectedRows.includes(event.id));
      setEvents(updatedEvents);
      setSelectedRows([]);
      setIsBulkDeleting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setTimeValue(time);
  };

  const handleAmPmToggle = () => {
    setAmPm(prev => prev === 'AM' ? 'PM' : 'AM');
  };

  const confirmTimeSelection = () => {
    const formattedTime = `${timeValue} ${amPm}`;
    setNewEvent(prev => ({
      ...prev,
      eventTime: formattedTime
    }));
    setShowTimePicker(false);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    setIsAdding(true);
    const newEventObj = {
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      company: newEvent.company,
      department: newEvent.department,
      emailTitle: newEvent.eventTitle,
      eventDate: newEvent.eventDate,
      eventTime: newEvent.eventTime || '12:00 PM',
      eventNote: newEvent.eventNote,
      notification: newEvent.notification
    };

    setEvents(prev => [...prev, newEventObj]);
    setShowAddEventForm(false);
    setNewEvent({
      company: 'HR1',
      department: '',
      eventTitle: '',
      eventDate: '',
      eventTime: '',
      eventNote: '',
      notification: true
    });
    setTimeValue('12:00');
    setAmPm('PM');
    setIsAdding(false);
  };

  // Handle individual delete
  const handleDeleteEvent = (id) => {
    if (window.confirm("तुम्हाला हा इव्हेंट डिलीट करायचा आहे का?")) {
      setEvents(prev => prev.filter(e => e.id !== id));
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    }
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  // Close time picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showTimePicker && timePickerRef.current && !timePickerRef.current.contains(e.target)) {
        setShowTimePicker(false);
      }
      if (showColumnsDropdown && columnsDropdownRef.current && !columnsDropdownRef.current.contains(e.target)) {
        setShowColumnsDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTimePicker, showColumnsDropdown]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px', fontFamily: "'Segoe UI', sans-serif" }}>
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
        Events &amp; Meetings
      </h1>

      {/* Print Dialog Modal */}
      {showPrintDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #eee'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                Print
              </h2>
              <button
                onClick={() => setShowPrintDialog(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#666" />
              </button>
            </div>

            {/* Print Dialog Content - Screenshot प्रमाणे */}
            <div style={{ padding: '24px' }}>
              {/* Aarys Section */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  Aarys
                </h3>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  Print
                </div>
                <div style={{ fontSize: '13px', color: '#888' }}>
                  Total: 1 sheet of paper
                </div>
              </div>

              {/* Compa Section */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  Compa
                </h3>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>Printer</strong>
                  <span>Microsoft Print to PDF</span>
                </div>
              </div>

              {/* Copies Section */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  Copies
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <input 
                    type="checkbox" 
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>Pages</strong>
                    <span>All</span>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 1-5, 8, 11-13"
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}
                />
              </div>

              {/* Color Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  Color
                </h3>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  Color
                </div>
                <div style={{ fontSize: '14px', color: '#5e35b1', cursor: 'pointer' }}>
                  More settings
                </div>
              </div>

              {/* System Dialog Option */}
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #eee'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  Print using system dialog... (Ctrl+Shift+P)
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

              {/* Print Preview - Screenshot मधील Table */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
                  Aarys Trans Solutions Pvt. Ltd.
                </h3>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  Company
                </div>
                
                <div style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '12px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Department</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Event Title</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Event Date</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Event Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.slice(0, 2).map((event, index) => (
                        <tr key={event.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{event.department}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{event.emailTitle}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatDisplayDate(event.eventDate)}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{event.eventTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: '20px',
                borderTop: '1px solid #eee'
              }}>
                <button
                  onClick={() => setShowPrintDialog(false)}
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    padding: '10px 24px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={executePrint}
                  style={{
                    backgroundColor: '#5e35b1',
                    color: 'white',
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Info Modal */}
      {showEventInfo && selectedEvent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #eee'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                Event Info
              </h2>
              <button
                onClick={() => setShowEventInfo(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#666" />
              </button>
            </div>

            {/* Event Info Content */}
            <div style={{ padding: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500', color: '#333', width: '120px' }}>Company</td>
                    <td style={{ padding: '12px 0' }}>{selectedEvent.company}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500', color: '#333' }}>Department</td>
                    <td style={{ padding: '12px 0' }}>{selectedEvent.department}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500', color: '#333' }}>Event Title</td>
                    <td style={{ padding: '12px 0' }}>{selectedEvent.emailTitle}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500', color: '#333' }}>Event Date</td>
                    <td style={{ padding: '12px 0' }}>{formatDisplayDate(selectedEvent.eventDate)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500', color: '#333' }}>Event Time</td>
                    <td style={{ padding: '12px 0' }}>{selectedEvent.eventTime}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500', color: '#333' }}>Event Note</td>
                    <td style={{ padding: '12px 0' }}>{selectedEvent.eventNote || 'No notes'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 0', fontWeight: '500', color: '#333' }}>Notification</td>
                    <td style={{ padding: '12px 0' }}>
                      {selectedEvent.notification ? 'On' : 'Off'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                <button
                  onClick={() => setShowEventInfo(false)}
                  style={{
                    backgroundColor: '#5e35b1',
                    color: 'white',
                    padding: '8px 24px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '750px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #eee'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                Add Event
              </h2>
              <button
                onClick={() => setShowAddEventForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#666" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} style={{ padding: '24px' }}>
              {/* Row 1: Company & Department */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                    Company
                  </label>
                  <select
                    name="company"
                    value={newEvent.company}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  >
                    {companyOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                    Department
                  </label>
                  <select
                    name="department"
                    value={newEvent.department}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  >
                    <option value="">Select Department...</option>
                    {departmentOptions.map((dept, i) => (
                      <option key={i} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Event Title & Event Date */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="eventTitle"
                    value={newEvent.eventTitle}
                    onChange={handleInputChange}
                    placeholder="Event Title"
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={newEvent.eventDate}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Row 3: Event Time & Status */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                {/* Event Time */}
                <div style={{ flex: 1, position: 'relative' }} ref={timePickerRef}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                    Event Time
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="text"
                      name="eventTime"
                      value={newEvent.eventTime}
                      onChange={handleInputChange}
                      placeholder="Event Time"
                      onClick={() => setShowTimePicker(true)}
                      readOnly
                      style={{ 
                        width: '100%', 
                        padding: '8px 36px 8px 8px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px', 
                        fontSize: '13px',
                        cursor: 'pointer',
                        height: '34px'
                      }}
                    />
                    <Clock 
                      size={16} 
                      color="#666" 
                      style={{ 
                        position: 'absolute', 
                        right: '10px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setShowTimePicker(true)}
                    />

                    {/* Time Picker Popup */}
                    {showTimePicker && (
                      <div
                        className="time-picker-container"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          backgroundColor: 'white',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          zIndex: 1000,
                          marginTop: '4px',
                          width: '200px'
                        }}
                      >
                        <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}
                          >
                            <span style={{ fontWeight: '500' }}>Select Time</span>
                            <button
                              type="button"
                              onClick={() => setShowTimePicker(false)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {/* Time Display */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '12px'
                            }}
                          >
                            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{timeValue}</span>
                            <button
                              type="button"
                              onClick={handleAmPmToggle}
                              style={{
                                padding: '4px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: amPm === 'PM' ? '#5e35b1' : '#f8f9fa',
                                color: amPm === 'PM' ? 'white' : '#333',
                                cursor: 'pointer'
                              }}
                            >
                              {amPm}
                            </button>
                          </div>

                          {/* Time Grid */}
                          <div
                            style={{
                              maxHeight: '200px',
                              overflowY: 'auto',
                              border: '1px solid #eee',
                              borderRadius: '4px'
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '4px',
                                padding: '8px'
                              }}
                            >
                              {timeOptions.map((time) => (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => handleTimeSelect(time)}
                                  style={{
                                    padding: '6px 4px',
                                    border: '1px solid',
                                    borderColor: timeValue === time ? '#5e35b1' : '#ddd',
                                    borderRadius: '4px',
                                    backgroundColor: timeValue === time ? '#5e35b1' : 'white',
                                    color: timeValue === time ? 'white' : '#333',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Confirm Button */}
                          <div style={{ marginTop: '12px' }}>
                            <button
                              type="button"
                              onClick={confirmTimeSelection}
                              style={{
                                width: '100%',
                                padding: '8px',
                                backgroundColor: '#5e35b1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              Set Time
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Dropdown */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={newEvent.status || 'Pending'}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', height: '34px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Postponed">Postponed</option>
                  </select>
                </div>
              </div>

              {/* Event Note */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                  Event Note
                </label>
                <textarea
                  name="eventNote"
                  value={newEvent.eventNote}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Add notes about the event..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              {/* Notification */}
              <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={20} color="#5e35b1" />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="notification"
                    checked={newEvent.notification}
                    onChange={handleInputChange}
                  />
                  Notification
                </label>
              </div>

              {/* Add Button - Dark Purple (#5e35b1) */}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isAdding}
                  style={{
                    backgroundColor: '#5e35b1',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '14px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAdding ? 'not-allowed' : 'pointer',
                    width: '100%',
                    opacity: isAdding ? 0.7 : 1
                  }}
                >
                  {isAdding ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEventForm && editingEvent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '750px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #eee'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                Edit Event
              </h2>
              <button
                onClick={() => {
                  setShowEditEventForm(false);
                  setEditingEvent(null);
                  setNewEvent({
                    company: 'HR1',
                    department: '',
                    eventTitle: '',
                    eventDate: '',
                    eventTime: '',
                    eventNote: '',
                    notification: true
                  });
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#666" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} style={{ padding: '24px' }}>
              {/* Same form as Add Event but with update functionality */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                    Company
                  </label>
                  <select
                    name="company"
                    value={newEvent.company}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  >
                    {companyOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                    Department
                  </label>
                  <select
                    name="department"
                    value={newEvent.department}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  >
                    <option value="">Select Department...</option>
                    {departmentOptions.map((dept, i) => (
                      <option key={i} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="eventTitle"
                    value={newEvent.eventTitle}
                    onChange={handleInputChange}
                    placeholder="Event Title"
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={newEvent.eventDate}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px', position: 'relative' }} ref={timePickerRef}>
                <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                  Event Time
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    name="eventTime"
                    value={newEvent.eventTime}
                    onChange={handleInputChange}
                    placeholder="Event Time"
                    onClick={() => setShowTimePicker(true)}
                    readOnly
                    style={{ 
                      width: '100%', 
                      padding: '10px 40px 10px 10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px', 
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  />
                  <Clock 
                    size={18} 
                    color="#666" 
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowTimePicker(true)}
                  />
                </div>
                
                {showTimePicker && (
                  <div className="time-picker-container" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    marginTop: '4px',
                    width: '200px'
                  }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontWeight: '500' }}>Select Time</span>
                        <button 
                          type="button"
                          onClick={() => setShowTimePicker(false)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{timeValue}</span>
                        <button
                          type="button"
                          onClick={handleAmPmToggle}
                          style={{
                            padding: '4px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: amPm === 'PM' ? '#5e35b1' : '#f8f9fa',
                            color: amPm === 'PM' ? 'white' : '#333',
                            cursor: 'pointer'
                          }}
                        >
                          {amPm}
                        </button>
                      </div>

                      <div style={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto',
                        border: '1px solid #eee',
                        borderRadius: '4px'
                      }}>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '4px',
                          padding: '8px'
                        }}>
                          {timeOptions.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleTimeSelect(time)}
                              style={{
                                padding: '6px 4px',
                                border: '1px solid',
                                borderColor: timeValue === time ? '#5e35b1' : '#ddd',
                                borderRadius: '4px',
                                backgroundColor: timeValue === time ? '#5e35b1' : 'white',
                                color: timeValue === time ? 'white' : '#333',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginTop: '12px' }}>
                        <button
                          type="button"
                          onClick={confirmTimeSelection}
                          style={{
                            width: '100%',
                            padding: '8px',
                            backgroundColor: '#5e35b1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Set Time
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                  Event Note
                </label>
                <textarea
                  name="eventNote"
                  value={newEvent.eventNote}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Add notes about the event..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={20} color="#5e35b1" />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="notification"
                    checked={newEvent.notification}
                    onChange={handleInputChange}
                  />
                  Notification
                </label>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#5e35b1',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    padding: '16px 80px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    minWidth: '200px'
                  }}
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Bar - Image के अनुसार Layout */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '4px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', 
        padding: '16px', 
        marginBottom: '16px', 
        border: '1px solid #e0e0e0',
        position: 'relative'
      }}>
        {/* पहली लाइन - Image के अनुसार */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'nowrap'
        }}>
          {/* Left side - Add Event Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Add Event Button - Dark Purple (#5e35b1) */}
            <button
              onClick={() => setShowAddEventForm(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: '#5e35b1',
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '4px',
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '14px', 
                fontWeight: 500 
              }}
            >
              <Calendar size={18} /> Add Event
            </button>

            {/* Bulk Delete Button - Red (#F44336) */}
            <button
              onClick={handleBulkDelete}
              disabled={selectedRows.length === 0 || isBulkDeleting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: selectedRows.length > 0 && !isBulkDeleting ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: '#F44336',
                color: 'white',
                opacity: selectedRows.length > 0 ? 1 : 0.6
              }}
            >
              <Trash2 size={18} /> {isBulkDeleting ? 'Deleting...' : 'Bulk delete'}
            </button>
          </div>

          {/* Right side - खाली रहने दिया क्योंकि 4 बटन अब search bar के पंक्ति में होंगे */}
          <div></div>
        </div>

        {/* दूसरी लाइन - Image के अनुसार (Show entries, Search, और 4 Export बटन) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: '1px solid #e0e0e0',
          paddingTop: '16px'
        }}>
          {/* Left side - Show entries dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#616161' }}>Show</span>
            <select
              value={recordsPerPage}
              onChange={e => { setRecordsPerPage(e.target.value); setCurrentPage(1); }}
              style={{ 
                border: '1px solid #bdbdbd', 
                borderRadius: '3px', 
                padding: '6px 10px', 
                fontSize: '14px',
                backgroundColor: 'white',
                minWidth: '70px'
              }}
            >
              {['10', '25', '50', 'All'].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span style={{ fontSize: '14px', color: '#616161' }}>records per page</span>
          </div>

          {/* Center - Search box with icon */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            <span style={{ fontSize: '14px', color: '#616161' }}>Search</span>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '6px 12px 6px 36px', 
                  border: '1px solid #bdbdbd', 
                  borderRadius: '3px', 
                  fontSize: '14px',
                  width: '250px',
                  backgroundColor: '#fff',
                  outline: 'none'
                }}
              />
              {/* Search icon inside the input */}
              <Search 
                size={16} 
                color="#666" 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)'
                }}
              />
            </div>
          </div>

          {/* Right side - 4 Export buttons (PDF, CSV, Print, Columns) */}
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }} ref={columnsDropdownRef}>
            {/* Button 1 - Red (#f44336) - PDF Download */}
            <button 
              title="Download as PDF"
              onClick={handleDownloadPDF}
              style={{ 
                width: '34px', 
                height: '34px', 
                backgroundColor: '#f44336', 
                border: 'none', 
                borderRadius: '3px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
            >
              <FileText size={18} color="#fff" />
            </button>
            
            {/* Button 2 - Yellow (#fbc02d) - CSV Download */}
            <button 
              title="Download as CSV"
              onClick={handleDownloadCSV}
              style={{ 
                width: '34px', 
                height: '34px', 
                backgroundColor: '#fbc02d', 
                border: 'none', 
                borderRadius: '3px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9a825'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fbc02d'}
            >
              <FileSpreadsheet size={18} color="#fff" />
            </button>
            
            {/* Button 3 - Blue (#29b6f6) - Print */}
            <button 
              title="Print"
              onClick={() => setShowPrintDialog(true)}
              style={{ 
                width: '34px', 
                height: '34px', 
                backgroundColor: '#29b6f6', 
                border: 'none', 
                borderRadius: '3px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0288d1'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#29b6f6'}
            >
              <Printer size={18} color="#fff" />
            </button>
            
            {/* Button 4 - Purple (#ab47bc) */}
            <button
              title="Show/Hide Columns"
              onClick={() => setShowColumnsDropdown(prev => !prev)}
              style={{ 
                width: '34px', 
                height: '34px', 
                backgroundColor: '#ab47bc', 
                border: 'none', 
                borderRadius: '3px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#8e24aa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ab47bc'}
            >
              <Eye size={18} color="#fff" />
            </button>

            {showColumnsDropdown && (
              <div style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                backgroundColor: '#673ab7',
                color: '#fff',
                borderRadius: '3px',
                padding: '8px 0',
                minWidth: '160px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                fontSize: '13px',
                zIndex: 1000
              }}>
                <div style={{ 
                  padding: '6px 12px', 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  fontWeight: '500',
                  fontSize: '12px',
                  color: '#e1bee7'
                }}>
                  Show/Hide Columns
                </div>
                {[
                  { key: 'company', label: 'Company' },
                  { key: 'department', label: 'Department' },
                  { key: 'emailTitle', label: 'Event Title' },
                  { key: 'eventDate', label: 'Event Date' },
                  { key: 'eventTime', label: 'Event Time' },
                  { key: 'actions', label: 'Actions' }
                ].map(item => (
                  <div 
                    key={item.key}
                    onClick={() => toggleColumnVisibility(item.key)}
                    style={{ 
                      padding: '8px 12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      cursor: 'pointer',
                      backgroundColor: visibleColumns[item.key] ? 'rgba(255,255,255,0.1)' : 'transparent',
                      ':hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
                    }}
                  >
                    {visibleColumns[item.key] ? (
                      <CheckSquare size={14} />
                    ) : (
                      <div style={{ width: '14px', height: '14px', border: '1px solid rgba(255,255,255,0.3)' }} />
                    )}
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '4px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', 
        overflowX: 'auto', 
        border: '1px solid #e0e0e0',
        fontFamily: "'Segoe UI', sans-serif"
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          minWidth: '800px',
          fontSize: '14px'
        }}>
          <thead style={{ 
            backgroundColor: '#f8f9fa'
          }}>
            <tr>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'center', 
                width: '40px',
                fontWeight: '600',
                color: '#333',
                borderBottom: '2px solid #dee2e6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    type="checkbox"
                    checked={paginatedEvents.length > 0 && paginatedEvents.every(e => selectedRows.includes(e.id))}
                    onChange={e => handleSelectAll(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                </div>
              </th>
              {visibleColumns.company && (
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Company
                </th>
              )}
              {visibleColumns.department && (
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Department
                </th>
              )}
              {visibleColumns.emailTitle && (
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Event Title
                </th>
              )}
              {visibleColumns.eventDate && (
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Event Date
                </th>
              )}
              {visibleColumns.eventTime && (
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#333',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Event Time
                </th>
              )}
              {visibleColumns.actions && (
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center', 
                  fontWeight: '600', 
                  color: '#333',
                  width: '150px',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.map((event, index) => {
              return (
                <tr key={event.id} style={{ 
                  backgroundColor: index % 2 === 0 ? 'white' : '#fafafa', 
                  borderBottom: '1px solid #e0e0e0',
                  ':hover': { backgroundColor: '#f5f5f5' }
                }}>
                  <td style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={selectedRows.includes(event.id)} 
                      onChange={() => toggleRowSelection(event.id)} 
                      style={{ width: '16px', height: '16px' }}
                    />
                  </td>
                  {visibleColumns.company && (
                    <td style={{ 
                      padding: '12px 16px',
                      color: '#333'
                    }}>
                      {event.company}
                    </td>
                  )}
                  {visibleColumns.department && (
                    <td style={{ 
                      padding: '12px 16px',
                      color: '#666'
                    }}>
                      {event.department}
                    </td>
                  )}
                  {visibleColumns.emailTitle && (
                    <td style={{ 
                      padding: '12px 16px',
                      color: '#333',
                      fontWeight: '500'
                    }}>
                      {event.emailTitle}
                    </td>
                  )}
                  {visibleColumns.eventDate && (
                    <td style={{ 
                      padding: '12px 16px',
                      color: '#666'
                    }}>
                      {event.eventDate}
                    </td>
                  )}
                  {visibleColumns.eventTime && (
                    <td style={{ 
                      padding: '12px 16px',
                      color: '#666'
                    }}>
                      {event.eventTime}
                    </td>
                  )}
                  {visibleColumns.actions && (
                    <td style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {/* Green View Button */}
                        <button 
                          title="View Event"
                          onClick={() => handleViewEvent(event)}
                          style={{ 
                            backgroundColor: '#4CAF50', 
                            color: 'white', 
                            border: 'none', 
                            width: '34px', 
                            height: '34px',
                            borderRadius: '4px', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#388E3C'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                        >
                          <EyeIcon size={16} />
                        </button>
                        
                        {/* Purple Edit Button */}
                        <button 
                          title="Edit Event"
                          onClick={() => handleEditEvent(event)}
                          style={{ 
                            backgroundColor: '#9C27B0', 
                            color: 'white', 
                            border: 'none', 
                            width: '34px', 
                            height: '34px',
                            borderRadius: '4px', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7B1FA2'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#9C27B0'}
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        {/* Red Delete Button */}
                        <button 
                          title="Delete Event"
                          onClick={() => handleDeleteEvent(event.id)}
                          style={{ 
                            backgroundColor: '#F44336', 
                            color: 'white', 
                            border: 'none', 
                            width: '34px', 
                            height: '34px',
                            borderRadius: '4px', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D32F2F'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F44336'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {paginatedEvents.length === 0 && (
              <tr>
                <td colSpan={Object.values(visibleColumns).filter(v => v).length + 1} style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#666'
                }}>
                  {searchTerm ? `No events found for "${searchTerm}"` : 'No events found. Add your first event!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination - Image प्रमाणे बॉक्स स्टाईल */}
        <div style={{ 
          padding: '16px 24px', 
          backgroundColor: '#f8f9fa', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontSize: '14px', 
          color: '#616161', 
          borderTop: '1px solid #e0e0e0'
        }}>
          <div>
            Showing {startIndex + 1} to {Math.min(startIndex + recordsNum, filteredEvents.length)} of {filteredEvents.length} entries
            {searchTerm && <span> (filtered from {events.length} total entries)</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Previous Button - Image प्रमाणे बॉक्स */}
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
              disabled={currentPage === 1} 
              style={{ 
                padding: '6px 16px', 
                border: '1px solid #bdbdbd', 
                backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: currentPage === 1 ? '#9e9e9e' : '#333',
                fontSize: '14px',
                fontWeight: 'normal',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                height: '32px',
                minWidth: '90px'
              }}
            >
              Previous
            </button>
            
            {/* Page Number Display - Image प्रमाणे पर्पल बॉक्स */}
            <div style={{
              padding: '6px 12px',
              border: '1px solid #bdbdbd',
              backgroundColor: '#5e35b1',
              color: 'white',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'normal',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '100px'
            }}>
              Page {currentPage} of {totalPages || 1}
            </div>
            
            {/* Next Button - Image प्रमाणे बॉक्स */}
            <button 
              onClick={() => setCurrentPage(p => p + 1)} 
              disabled={currentPage >= totalPages} 
              style={{ 
                padding: '6px 16px', 
                border: '1px solid #bdbdbd', 
                backgroundColor: currentPage >= totalPages ? '#f5f5f5' : 'white',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: currentPage >= totalPages ? '#9e9e9e' : '#333',
                fontSize: '14px',
                fontWeight: 'normal',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                height: '32px',
                minWidth: '90px'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event;