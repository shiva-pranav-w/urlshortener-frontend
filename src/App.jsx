import { useState, useEffect } from "react";
import "./App.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load token from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Register
  const register = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const error = await res.text();
        alert("Register failed: " + error);
        return;
      }

      alert("Registered successfully");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const error = await res.text();
        alert("Login failed: " + error);
        return;
      }

      const data = await res.text();
      setToken(data);
      localStorage.setItem("token", data);

      alert("Logged in");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Shorten URL
  const shorten = async () => {
    if (!token) {
      alert("Please login first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/url/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });

      if (!res.ok) {
        const error = await res.text();
        alert("Shorten failed: " + error);
        return;
      }

      const data = await res.json();
      setShortUrl(data.shortUrl);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Get stats
  const getStats = async () => {
    if (!token) {
      alert("Please login first");
      return;
    }

    if (!shortUrl) {
      alert("No short URL available");
      return;
    }

    const code = shortUrl.split("/").pop();

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/url/${code}/stats`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const error = await res.text();
        alert("Stats failed: " + error);
        return;
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>URL Shortener</h2>

      <div className="form-group">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="button-row">
          <button onClick={register} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          <button onClick={login} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>

      <div className="form-group">
        <input
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button onClick={shorten} disabled={loading}>
          {loading ? "Processing..." : "Shorten"}
        </button>
      </div>

      {shortUrl && (
        <div className="result">
          <p>
            Short URL:{" "}
            <a href={shortUrl} target="_blank" rel="noreferrer">
              {shortUrl}
            </a>
          </p>

          <button onClick={getStats} disabled={loading}>
            {loading ? "Fetching..." : "Get Stats"}
          </button>
        </div>
      )}

      {stats && (
        <div className="stats">
          <p>Hits: {stats.hitCount}</p>
          <p>Created: {stats.createdAt}</p>
        </div>
      )}
    </div>
  );
}

export default App;