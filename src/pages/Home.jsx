import { ArrowDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <main>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-logo">
          <span>PICNIC</span>
          <strong>VELOURA</strong>
        </div>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#colours">Colours</a>
        </div>

        <button
          className="nav-register"
          onClick={() => navigate('/register')}
        >
          Register
          <ArrowRight size={17} />
        </button>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">
            THE OFFICE OF THE DIRECTOR OF SOCIALS
          </p>

          <h1>
            Colours
            <br />
            <span>&amp; Fun.</span>
          </h1>

          <p className="hero-description">
            An experience of colour, creativity,
            music and connection.
          </p>

          <button
            className="hero-button"
            onClick={() => navigate('/register')}
          >
            Register for ₦1,000
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="hero-side">
          <div className="hero-circle">
            <span>COME</span>
            <span>AS YOU</span>
            <span>ARE</span>
          </div>
        </div>

        <div className="scroll-indicator">
          <ArrowDown size={17} />
          <span>SCROLL TO EXPLORE</span>
        </div>
      </section>

      {/* About */}
      <section className="about-section" id="about">
        <div className="section-label">
          <span>01</span>
          ABOUT THE PICNIC
        </div>

        <div className="about-content">
          <h2>
            More than a picnic.
            <br />
            <em>It's a whole experience.</em>
          </h2>

          <p>
            Picnic Veloura is a social gathering created
            for people to unwind, connect, create and have
            a genuinely good time together.
          </p>

          <p>
            Come for the colours. Stay for the creativity,
            music, conversations, food, vibes and plot.
          </p>
        </div>
      </section>

      {/* Experience */}
      <section className="experience-section" id="experience">
        <div className="section-label light">
          <span>02</span>
          THE EXPERIENCE
        </div>

        <div className="experience-grid">
          <div className="experience-card burgundy">
            <span>01</span>
            <h3>Creativity</h3>
            <p>
              Explore your creative side through
              activities and shared experiences.
            </p>
          </div>

          <div className="experience-card purple">
            <span>02</span>
            <h3>Music</h3>
            <p>
              Good music, good energy and an atmosphere
              designed to keep the vibes going.
            </p>
          </div>

          <div className="experience-card brown">
            <span>03</span>
            <h3>Connection</h3>
            <p>
              Meet people, make memories and enjoy
              meaningful moments together.
            </p>
          </div>
        </div>
      </section>

      {/* Colour codes */}
      <section className="colours-section" id="colours">
        <div className="section-label">
          <span>03</span>
          THE COLOUR CODE
        </div>

        <div className="colours-heading">
          <h2>
            Pick your colour.
            <br />
            <em>Own your vibe.</em>
          </h2>

          <p>
            Each colour brings its own energy.
            Choose yours and come ready to make
            the picnic yours.
          </p>
        </div>

        <div className="colour-grid">
          <div className="colour-card black-card">
            <span>BLACK</span>
            <small>A TOUCH OF WHITE</small>
          </div>

          <div className="colour-card burgundy-card">
            <span>BURGUNDY</span>
            <small>A TOUCH OF WHITE</small>
          </div>

          <div className="colour-card purple-card">
            <span>PURPLE</span>
            <small>A TOUCH OF WHITE</small>
          </div>

          <div className="colour-card brown-card">
            <span>BROWN</span>
            <small>A TOUCH OF BEIGE</small>
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section className="register-section">
        <p>READY?</p>

        <h2>
          Let's make
          <br />
          <em>some memories.</em>
        </h2>

        <button
          onClick={() => navigate('/register')}
        >
          Register Now
          <ArrowRight size={20} />
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="nav-logo">
          <span>PICNIC</span>
          <strong>VELOURA</strong>
        </div>

        <p>
          Colours and fun.
        </p>

        <small>
          © 2026 Picnic Veloura · Office of the Director
          of Socials
        </small>
      </footer>
    </main>
  );
}

export default Home;