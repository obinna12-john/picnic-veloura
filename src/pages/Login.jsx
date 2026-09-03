import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      navigate('/admin');
    }

    setLoading(false);
  };

  return (
    <main className="login-page">
      <div className="login-card">

        <div className="login-brand">
          <span>PICNIC</span>
          <strong>VELOURA</strong>
        </div>

        <p className="eyebrow dark">ADMIN ACCESS</p>

        <h1>
          Welcome <em>back.</em>
        </h1>

        <p className="login-description">
          Sign in to manage participants, payments and
          attendance.
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label htmlFor="email">
              EMAIL ADDRESS
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              PASSWORD
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        <button
          className="back-home"
          onClick={() => navigate('/')}
        >
          ← Back to Picnic Veloura
        </button>

      </div>
    </main>
  );
}

export default Login;