import {
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

function Review() {
  const location = useLocation();
  const navigate = useNavigate();

  const formData = location.state;

  // If someone visits /review directly without
  // coming from registration
  if (!formData) {
    return (
      <main className="review-page">
        <div className="review-empty">
          <h1>No registration found.</h1>

          <button
            onClick={() => navigate('/register')}
          >
            Go to Registration
          </button>
        </div>
      </main>
    );
  }

  // Go back to registration while preserving
  // everything the user already entered
  const handleEdit = () => {
    navigate('/register', {
      state: formData,
    });
  };

  // Move to Step 3: Payment
  const handleProceed = () => {
    navigate('/payment', {
      state: formData,
    });
  };

  return (
    <main className="review-page">

      {/* Navigation */}
      <nav className="registration-nav">

        <button
          type="button"
          className="back-button"
          onClick={handleEdit}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="nav-logo">
          <span>PICNIC</span>
          <strong>VELOURA</strong>
        </div>

        <div className="registration-price">
          ₦1,000
        </div>

      </nav>

      {/* Review content */}
      <section className="review-container">

        <div className="review-intro">

          <p className="eyebrow dark">
            STEP 02 — REVIEW
          </p>

          <h1>
            Almost
            <br />
            <em>there.</em>
          </h1>

          <p>
            Take a moment to make sure everything
            looks right before continuing.
          </p>

        </div>

        <div className="review-card">

          {/* Card header */}
          <div className="review-card-header">

            <div className="review-check">
              <Check size={18} />
            </div>

            <div>
              <span>Your registration</span>
              <strong>Personal Details</strong>
            </div>

          </div>

          {/* Details */}
          <div className="review-details">

            <div className="review-detail">
              <span>FULL NAME</span>
              <strong>
                {formData.fullName}
              </strong>
            </div>

            <div className="review-detail">
              <span>EMAIL ADDRESS</span>
              <strong>
                {formData.email}
              </strong>
            </div>

            <div className="review-detail">
              <span>CLASS LEVEL</span>
              <strong>
                {formData.level}
              </strong>
            </div>

            <div className="review-detail">
              <span>AREA OF INTEREST</span>
              <strong>
                {formData.areaOfInterest === 'None'
                  ? 'Food, vibes & plot 😂'
                  : formData.areaOfInterest}
              </strong>
            </div>

          </div>

          {/* Payment information */}
          <div className="review-payment">

            <div>
              <span>REGISTRATION FEE</span>
              <strong>₦1,000</strong>
            </div>

            <p>
              Payment will be securely processed online.
            </p>

          </div>

          {/* Actions */}
          <div className="review-actions">

            <button
              type="button"
              className="edit-button"
              onClick={handleEdit}
            >
              <ArrowLeft size={17} />
              Edit Details
            </button>

            <button
              type="button"
              className="continue-button"
              onClick={handleProceed}
            >
              Proceed to Payment
              <ArrowRight size={19} />
            </button>

          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="simple-footer">

        <span>
          PICNIC VELOURA
        </span>

        <span>
          COLOURS AND FUN.
        </span>

      </footer>

    </main>
  );
}

export default Review;