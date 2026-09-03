import {
  Search,
  Users,
  CheckCircle,
  Clock,
  UserCheck,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function AdminDashboard() {
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');

  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState('');
  const [attendanceMessage, setAttendanceMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventColourCode, setEventColourCode] = useState('');

  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  // -----------------------------
  // LOGOUT
  // -----------------------------

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        return;
      }

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // -----------------------------
  // FETCH PARTICIPANTS
  // -----------------------------

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Error loading participants:', error);
      setError('Unable to load participants.');
      setLoading(false);
      return;
    }

    setParticipants(data || []);
    setLoading(false);
  };

  // -----------------------------
  // SEARCH PARTICIPANTS
  // -----------------------------

  const filteredParticipants = participants.filter((participant) => {
    const searchTerm = search.toLowerCase().trim();

    return (
      participant.full_name?.toLowerCase().includes(searchTerm) ||
      participant.email?.toLowerCase().includes(searchTerm) ||
      participant.participant_id?.toLowerCase().includes(searchTerm)
    );
  });

  // -----------------------------
  // ATTENDANCE LOOKUP
  // -----------------------------

  const attendanceParticipant = participants.find(
    (participant) =>
      participant.participant_id?.toLowerCase() ===
      attendanceSearch.trim().toLowerCase()
  );

  // -----------------------------
  // MARK ATTENDANCE
  // -----------------------------

  const markAttendance = async (participantId) => {
    const participant = participants.find(
      (item) => item.participant_id === participantId
    );

    if (!participant) {
      setAttendanceMessage('Participant not found.');
      return;
    }

    if (participant.payment_status !== 'Paid') {
      setAttendanceMessage(
        'This participant has not completed payment and cannot be checked in.'
      );
      return;
    }

    if (participant.attendance_status === 'Attended') {
      setAttendanceMessage(
        'This participant has already been checked in.'
      );
      return;
    }

    setAttendanceLoading(participantId);
    setAttendanceMessage('');

    const { error } = await supabase
      .from('participants')
      .update({
        attendance_status: 'Attended',
        attended_at: new Date().toISOString(),
      })
      .eq('participant_id', participantId)
      .eq('payment_status', 'Paid')
      .neq('attendance_status', 'Attended');

    if (error) {
      console.error('Error marking attendance:', error);

      setAttendanceMessage(
        'Unable to mark attendance. Please try again.'
      );

      setAttendanceLoading('');
      return;
    }

    setAttendanceMessage('Attendance marked successfully.');
    setAttendanceLoading('');

    await fetchParticipants();
  };

  // -----------------------------
  // STATISTICS
  // -----------------------------

  const paidCount = participants.filter(
    (participant) =>
      participant.payment_status === 'Paid'
  ).length;

  const pendingCount = participants.filter(
    (participant) =>
      participant.payment_status === 'Pending'
  ).length;

  const attendedCount = participants.filter(
    (participant) =>
      participant.attendance_status === 'Attended'
  ).length;

  // -----------------------------
  // SEND EVENT INFORMATION EMAILS
  // -----------------------------

  const sendEventInformation = async () => {
    setEmailMessage('');
    setEmailError('');

    if (
      !eventDate ||
      !eventTime ||
      !eventVenue.trim() ||
      !eventColourCode.trim()
    ) {
      setEmailError(
        'Please enter the date, time, venue and colour code.'
      );
      return;
    }

    if (paidCount === 0) {
      setEmailError(
        'There are no paid participants to send the email to.'
      );
      return;
    }

    const confirmed = window.confirm(
      `You are about to send the event information email to ${paidCount} paid participant${
        paidCount === 1 ? '' : 's'
      }.\n\nDo you want to continue?`
    );

    if (!confirmed) {
      return;
    }

    setEmailSending(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          'Your admin session has expired. Please sign in again.'
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/send-event-information`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            date: eventDate,
            time: eventTime,
            venue: eventVenue.trim(),
            colourCode: eventColourCode.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Unable to send event information emails.'
        );
      }

      setEmailMessage(
        `Successfully sent to ${data.successful} participant${
          data.successful === 1 ? '' : 's'
        }${
          data.failed > 0
            ? `. ${data.failed} email${
                data.failed === 1 ? '' : 's'
              } failed.`
            : '.'
        }`
      );
    } catch (error) {
      console.error(
        'Event information email error:',
        error
      );

      setEmailError(
        error.message ||
          'Unable to send event information emails.'
      );
    } finally {
      setEmailSending(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <main className="admin-page">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-brand">
          <span>PICNIC</span>
          <strong>VELOURA</strong>
        </div>

        <div className="admin-sidebar-title">
          ADMIN
        </div>

        <nav className="admin-nav">
          <a
            href="#overview"
            className="active"
          >
            Overview
          </a>

          <a href="#participants">
            Participants
          </a>

          <a href="#attendance">
            Attendance
          </a>

          <a href="#emails">
            Emails
          </a>
        </nav>

        <div className="admin-sidebar-footer">

          <span>OFFICE OF THE</span>

          <strong>
            DIRECTOR OF SOCIALS
          </strong>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <section className="admin-content">

        {/* HEADER */}

        <header className="admin-header">

          <div>
            <p className="admin-eyebrow">
              PICNIC VELOURA
            </p>

            <h1>
              Dashboard
            </h1>
          </div>

          <div className="admin-event-status">
            <span></span>
            Registration Open
          </div>

        </header>

        {/* STATISTICS */}

        <section
          className="stats-grid"
          id="overview"
        >

          <div className="stat-card">

            <div className="stat-icon">
              <Users size={19} />
            </div>

            <div>
              <span>
                Total Participants
              </span>

              <strong>
                {participants.length}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon paid">
              <CheckCircle size={19} />
            </div>

            <div>
              <span>
                Paid
              </span>

              <strong>
                {paidCount}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon pending">
              <Clock size={19} />
            </div>

            <div>
              <span>
                Pending Payment
              </span>

              <strong>
                {pendingCount}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon attendance">
              <UserCheck size={19} />
            </div>

            <div>
              <span>
                Attendance
              </span>

              <strong>
                {attendedCount}
              </strong>
            </div>

          </div>

        </section>

        {/* ATTENDANCE CHECK-IN */}

        <section
          className="attendance-section"
          id="attendance"
        >

          <div className="participants-header">

            <div>

              <p className="admin-eyebrow">
                EVENT CHECK-IN
              </p>

              <h2>
                Mark Attendance
              </h2>

              <p className="attendance-description">
                Enter a participant's unique Event ID
                to check them in.
              </p>

            </div>

          </div>

          <div className="attendance-checker">

            <div className="attendance-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Enter Event ID e.g. PV-0001"
                value={attendanceSearch}
                onChange={(e) => {
                  setAttendanceSearch(e.target.value);
                  setAttendanceMessage('');
                }}
              />

            </div>

            {attendanceSearch.trim() && (
              <div className="attendance-result">

                {attendanceParticipant ? (

                  <>

                    <div className="attendance-person">

                      <div>
                        <strong>
                          {attendanceParticipant.full_name}
                        </strong>

                        <span>
                          {attendanceParticipant.participant_id}
                        </span>
                      </div>

                      <div className="attendance-details">

                        <span>
                          {attendanceParticipant.level}
                        </span>

                        <span>
                          {attendanceParticipant.area_of_interest ===
                          'None'
                            ? 'Food, vibes & plot 😂'
                            : attendanceParticipant.area_of_interest}
                        </span>

                      </div>

                    </div>

                    {attendanceParticipant.payment_status !==
                    'Paid' ? (

                      <div className="already-attended">
                        <AlertCircle size={18} />
                        Payment not completed — cannot check in.
                      </div>

                    ) : attendanceParticipant.attendance_status ===
                      'Attended' ? (

                      <div className="already-attended">

                        <CheckCircle size={18} />

                        Already Checked In

                        {attendanceParticipant.attended_at && (
                          <span>
                            {' '}
                            •{' '}
                            {new Date(
                              attendanceParticipant.attended_at
                            ).toLocaleString()}
                          </span>
                        )}

                      </div>

                    ) : (

                      <button
                        className="mark-attendance-button"
                        onClick={() =>
                          markAttendance(
                            attendanceParticipant.participant_id
                          )
                        }
                        disabled={
                          attendanceLoading ===
                          attendanceParticipant.participant_id
                        }
                      >

                        {attendanceLoading ===
                        attendanceParticipant.participant_id
                          ? 'Checking in...'
                          : 'Mark as Attended'}

                      </button>

                    )}

                  </>

                ) : (

                  <div className="attendance-not-found">
                    No participant found with that Event ID.
                  </div>

                )}

              </div>
            )}

            {attendanceMessage && (
              <p className="attendance-message">
                {attendanceMessage}
              </p>
            )}

          </div>

        </section>

        {/* PARTICIPANTS */}

        <section
          className="participants-section"
          id="participants"
        >

          <div className="participants-header">

            <div>

              <p className="admin-eyebrow">
                REGISTRATION DATABASE
              </p>

              <h2>
                Participants
              </h2>

            </div>

            <div className="participant-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search name, email or ID..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

          </div>

          <div className="table-wrapper">

            {loading && (
              <div className="no-results">
                Loading participants...
              </div>
            )}

            {error && (
              <div className="no-results">
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              filteredParticipants.length === 0 && (

                <div className="no-results">

                  {search
                    ? 'No participants match your search.'
                    : 'No participants found.'}

                </div>

              )}

            {!loading &&
              !error &&
              filteredParticipants.length > 0 && (

                <table>

                  <thead>

                    <tr>
                      <th>Participant</th>
                      <th>Event ID</th>
                      <th>Level</th>
                      <th>Interest</th>
                      <th>Payment</th>
                      <th>Attendance</th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredParticipants.map(
                      (participant) => (

                        <tr
                          key={participant.participant_id}
                        >

                          <td>

                            <div className="participant-info">

                              <strong>
                                {participant.full_name}
                              </strong>

                              <span>
                                {participant.email}
                              </span>

                            </div>

                          </td>

                          <td>

                            <span className="participant-id">
                              {participant.participant_id}
                            </span>

                          </td>

                          <td>
                            {participant.level}
                          </td>

                          <td>

                            {participant.area_of_interest ===
                            'None'
                              ? 'Food, vibes & plot 😂'
                              : participant.area_of_interest}

                          </td>

                          <td>

                            <span
                              className={`status ${
                                participant.payment_status?.toLowerCase()
                              }`}
                            >
                              {participant.payment_status}
                            </span>

                          </td>

                          <td>

                            <span
                              className={`attendance ${
                                participant.attendance_status ===
                                'Attended'
                                  ? 'present'
                                  : ''
                              }`}
                            >
                              {participant.attendance_status}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              )}

          </div>

        </section>

        {/* EVENT INFORMATION EMAILS */}

        <section
          className="email-section"
          id="emails"
        >

          <div className="participants-header">

            <div>

              <p className="admin-eyebrow">
                EVENT COMMUNICATION
              </p>

              <h2>
                Event Information
              </h2>

              <p className="attendance-description">
                Enter the confirmed event details and send
                a personalised information email to all paid
                participants.
              </p>

            </div>

          </div>

          <div className="email-form">

            <div className="email-form-grid">

              <div className="email-field">

                <label>
                  Event Date
                </label>

                <input
                  type="text"
                  placeholder="e.g. Saturday, November 14, 2026"
                  value={eventDate}
                  onChange={(e) =>
                    setEventDate(e.target.value)
                  }
                />

              </div>

              <div className="email-field">

                <label>
                  Event Time
                </label>

                <input
                  type="text"
                  placeholder="e.g. 2:00 PM"
                  value={eventTime}
                  onChange={(e) =>
                    setEventTime(e.target.value)
                  }
                />

              </div>

              <div className="email-field">

                <label>
                  Venue
                </label>

                <input
                  type="text"
                  placeholder="Enter event venue"
                  value={eventVenue}
                  onChange={(e) =>
                    setEventVenue(e.target.value)
                  }
                />

              </div>

              <div className="email-field">

                <label>
                  Colour Code
                </label>

                <input
                  type="text"
                  placeholder="e.g. Burgundy with a touch of white"
                  value={eventColourCode}
                  onChange={(e) =>
                    setEventColourCode(e.target.value)
                  }
                />

              </div>

            </div>

            <div className="email-recipient-count">

              <Users size={18} />

              <span>
                This email will be sent to
              </span>

              <strong>
                {paidCount} paid participant
                {paidCount === 1 ? '' : 's'}
              </strong>

            </div>

            {emailError && (
              <div className="email-error">
                <AlertCircle size={18} />
                {emailError}
              </div>
            )}

            {emailMessage && (
              <div className="email-success">
                <CheckCircle size={18} />
                {emailMessage}
              </div>
            )}

            <button
              type="button"
              className="send-event-email-button"
              onClick={sendEventInformation}
              disabled={emailSending || paidCount === 0}
            >
              {emailSending
                ? 'Sending emails...'
                : 'Send Event Information'}
            </button>

          </div>

        </section>

      </section>

    </main>
  );
}

export default AdminDashboard;