import {
  CheckCircle,
  User,
  Mail,
  GraduationCap,
  Palette,
  Hash,
  CreditCard,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const participant = location.state?.participant;

  if (!participant) {
    return (
      <main className="confirmation-page">
        <div className="confirmation-empty">
          <h1>No confirmation found.</h1>
          <p>
            Your registration details could not be loaded.
          </p>

          <button onClick={() => navigate('/register')}>
            Back to Registration
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="confirmation-page">
      <div className="confirmation-card">

        <div className="confirmation-icon">
          <CheckCircle size={42} />
        </div>

        <p className="confirmation-eyebrow">
          PICNIC VELOURA
        </p>

        <h1>Registration Confirmed!</h1>

        <p className="confirmation-message">
          Your payment was successful and your place at
          Picnic Veloura has been confirmed.
        </p>

        <div className="confirmation-id">
          <span>Your Event ID</span>
          <strong>{participant.participant_id}</strong>
        </div>

        <div className="confirmation-details">

          <div className="confirmation-detail">
            <div className="confirmation-detail-icon">
              <User size={18} />
            </div>

            <div>
              <span>Full Name</span>
              <strong>{participant.full_name}</strong>
            </div>
          </div>

          <div className="confirmation-detail">
            <div className="confirmation-detail-icon">
              <Mail size={18} />
            </div>

            <div>
              <span>Email</span>
              <strong>{participant.email}</strong>
            </div>
          </div>

          <div className="confirmation-detail">
            <div className="confirmation-detail-icon">
              <GraduationCap size={18} />
            </div>

            <div>
              <span>Level</span>
              <strong>{participant.level}</strong>
            </div>
          </div>

          <div className="confirmation-detail">
            <div className="confirmation-detail-icon">
              <Palette size={18} />
            </div>

            <div>
              <span>Area of Interest</span>
              <strong>
                {participant.area_of_interest === 'None'
                  ? 'Food, vibes & plot 😂'
                  : participant.area_of_interest}
              </strong>
            </div>
          </div>

          <div className="confirmation-detail">
            <div className="confirmation-detail-icon">
              <CreditCard size={18} />
            </div>

            <div>
              <span>Payment Status</span>
              <strong>{participant.payment_status}</strong>
            </div>
          </div>

          <div className="confirmation-detail">
            <div className="confirmation-detail-icon">
              <Hash size={18} />
            </div>

            <div>
              <span>Payment Reference</span>
              <strong>{participant.paystack_reference}</strong>
            </div>
          </div>

        </div>

        <div className="confirmation-notice">
          <strong>Keep your Event ID safe.</strong>
          <p>
            You will need your Event ID when checking in
            at Picnic Veloura.
          </p>
        </div>

        <button
          className="confirmation-home-button"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>

      </div>
    </main>
  );
}

export default Confirmation;