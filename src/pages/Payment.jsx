import {
  ArrowLeft,
  CreditCard,
} from 'lucide-react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useEffect, useState } from 'react';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const formData = location.state;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /*
    Get Paystack reference from the URL.
  */
  const params = new URLSearchParams(
    window.location.search
  );

  const reference = params.get('reference');

  /*
    When Paystack redirects back to this page,
    verify the payment using the reference.
  */
  useEffect(() => {
    if (reference) {
      verifyPayment(reference);
    }
  }, [reference]);

  const verifyPayment = async (reference) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/verify/${reference}`
      );

      const data = await response.json();

      console.log(
        'Payment verification response:',
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Payment verification failed.'
        );
      }

      /*
        Make sure the backend actually returned
        the participant information.
      */
      if (!data.participant) {
        throw new Error(
          'Payment was verified, but registration details were not returned.'
        );
      }

      /*
        Payment verified successfully.
        Send participant information to
        the confirmation page.
      */
      navigate('/confirmation', {
        state: {
          participant: data.participant,
        },
        replace: true,
      });

    } catch (error) {
      console.error(
        'Payment verification error:',
        error
      );

      setError(
        error.message ||
          'We could not verify your payment.'
      );

      setLoading(false);
    }
  };

  /*
    If Paystack has returned us to this page
    with a payment reference, show the verification
    screen instead of "No registration found."
  */
  if (reference) {
    return (
      <main className="payment-page">
        <div className="payment-empty">

          {loading ? (
            <>
              <h1>
                Confirming your payment...
              </h1>

              <p>
                Please wait while we confirm your
                payment and registration.
              </p>
            </>
          ) : error ? (
            <>
              <h1>
                Payment verification failed.
              </h1>

              <p>{error}</p>

              <button
                onClick={() =>
                  navigate('/register')
                }
              >
                Back to Registration
              </button>
            </>
          ) : null}

        </div>
      </main>
    );
  }

  /*
    No Paystack reference means this is the normal
    payment page before payment has been made.
  */
  if (!formData) {
    return (
      <main className="payment-page">
        <div className="payment-empty">

          <h1>
            No registration found.
          </h1>

          <p>
            Please complete the registration process
            before making payment.
          </p>

          <button
            onClick={() =>
              navigate('/register')
            }
          >
            Go to Registration
          </button>

        </div>
      </main>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/initialize`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email: formData.email,
            fullName: formData.fullName,
            level: formData.level,
            areaOfInterest:
              formData.areaOfInterest,
          }),
        }
      );

      const data = await response.json();

      console.log(
        'Payment initialization response:',
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Unable to initialize payment.'
        );
      }

      /*
        Send the customer to Paystack checkout.
      */
      window.location.href =
        data.authorizationUrl;

    } catch (error) {
      console.error(
        'Payment initialization error:',
        error
      );

      setError(
        error.message ||
          'Something went wrong while starting payment.'
      );

      setLoading(false);
    }
  };

  return (
    <main className="payment-page">

      {/* Navigation */}
      <nav className="registration-nav">

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate('/review', {
              state: formData,
            })
          }
          disabled={loading}
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

      {/* Payment */}
      <section className="payment-container">

        <div className="payment-intro">

          <p className="eyebrow dark">
            STEP 03 — PAYMENT
          </p>

          <h1>
            Secure
            <br />
            <em>your spot.</em>
          </h1>

          <p>
            You're one step away from joining
            Picnic Veloura.
          </p>

        </div>

        <div className="payment-card">

          {/* Payment header */}
          <div className="payment-card-top">

            <div className="payment-icon">
              <CreditCard size={21} />
            </div>

            <div>
              <span>
                REGISTRATION
              </span>

              <strong>
                Picnic Veloura
              </strong>
            </div>

          </div>

          {/* Summary */}
          <div className="payment-summary">

            <div>
              <span>
                PARTICIPANT
              </span>

              <strong>
                {formData.fullName}
              </strong>
            </div>

            <div>
              <span>
                CLASS LEVEL
              </span>

              <strong>
                {formData.level}
              </strong>
            </div>

            <div>
              <span>
                AREA OF INTEREST
              </span>

              <strong>
                {formData.areaOfInterest === 'None'
                  ? 'Food, vibes & plot 😂'
                  : formData.areaOfInterest}
              </strong>
            </div>

          </div>

          {/* Total */}
          <div className="payment-total">

            <span>
              REGISTRATION FEE
            </span>

            <strong>
              ₦1,000
            </strong>

          </div>

          {/* Error */}
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* Pay button */}
          <button
            type="button"
            className="pay-button"
            onClick={handlePayment}
            disabled={loading}
          >
            <CreditCard size={18} />

            {loading
              ? 'Preparing secure payment...'
              : 'Continue to Secure Payment'}
          </button>

          <p className="payment-note">
            Your payment will be securely processed
            online.
          </p>

        </div>

      </section>

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

export default Payment;