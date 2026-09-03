import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    fullName: location.state?.fullName || '',
    email: location.state?.email || '',
    level: location.state?.level || '',
    areaOfInterest: location.state?.areaOfInterest || '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear error when user starts correcting the form
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError('');

    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!formData.level) {
      setError('Please select your class level.');
      return;
    }

    if (!formData.areaOfInterest) {
      setError('Please select an area of interest.');
      return;
    }

    // Move to Step 2: Review
    navigate('/review', {
      state: formData,
    });
  };

  return (
    <main className="registration-page">

      {/* Header */}
      <nav className="registration-nav">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/')}
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

      {/* Main content */}
      <section className="registration-container">

        <div className="registration-intro">
          <p className="eyebrow dark">
            REGISTRATION
          </p>

          <h1>
            Come join
            <br />
            <em>the experience.</em>
          </h1>

          <p>
            Tell us a little about yourself before
            you step into Picnic Veloura.
          </p>
        </div>

        <form
          className="registration-form"
          onSubmit={handleSubmit}
        >

          {/* Full name */}
          <div className="form-group">
            <label htmlFor="fullName">
              01 — FULL NAME
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              02 — EMAIL ADDRESS
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Class Level */}
          <div className="form-group">
            <label htmlFor="level">
              03 — CLASS LEVEL
            </label>

            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
            >
              <option value="">
                Select your level
              </option>

              <option value="100 Level">
                100 Level
              </option>

              <option value="200 Level">
                200 Level
              </option>

              <option value="300 Level">
                300 Level
              </option>

              <option value="400 Level">
                400 Level
              </option>

              <option value="500 Level">
                500 Level
              </option>
            </select>
          </div>

          {/* Area of Interest */}
          <div className="form-group">
            <label htmlFor="areaOfInterest">
              04 — AREA OF INTEREST
            </label>

            <select
              id="areaOfInterest"
              name="areaOfInterest"
              value={formData.areaOfInterest}
              onChange={handleChange}
              required
            >
              <option value="">
                Select your interest
              </option>

              <option value="Painting">
                Painting
              </option>

              <option value="Beading">
                Beading
              </option>

              <option value="Crocheting">
                Crocheting
              </option>

              <option value="Tailoring">
                Tailoring
              </option>

              <option value="None">
                None / Just here for the food, vibes and plot 😂
              </option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* Bottom */}
          <div className="registration-bottom">

            <p>
              Registration fee
              <strong>₦1,000</strong>
            </p>

            <button
              type="submit"
              className="continue-button"
            >
              Review Registration
              <ArrowRight size={19} />
            </button>

          </div>

        </form>

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

export default Register;