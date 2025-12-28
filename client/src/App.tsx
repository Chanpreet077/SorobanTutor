import { useEffect, useState } from "react";
import { api } from "./lib/api";
import Practice from "./practice";

type User = { id: string; email: string };

export default function App() {
  const [me, setMe] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Checking session...");
  const [busy, setBusy] = useState(false);

  // restore session
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await api.get<{ user: User }>("/me");
        if (ignore) return;
        setMe(res.data.user);
        setStatus("Authenticated");
      } catch {
        if (ignore) return;
        setMe(null);
        setStatus("Not Authenticated");
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  async function login(path: "/auth/login" | "/auth/register") {
    setBusy(true);
    try {
      const res = await api.post<{ user: User }>(path, { email, password });
      setMe(res.data.user);
      setStatus("Authenticated");
    } catch {
      setStatus("Login/Register failed");
    } finally {
      setBusy(false);
    }
  }

  //  Gate logic
if (!me) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui",
        background: "#f6f7fb",
      }}
    >
      <div
        style={{
          width: 420,
          padding: 32,
          borderRadius: 16,
          background: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>
          SorobanTutor
        </h1>

        <p style={{ textAlign: "center", marginTop: 0, color: "#666" }}>
          {status}
        </p>

        <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
          <input
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 12,
              fontSize: 16,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />

          <input
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: 12,
              fontSize: 16,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />

          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <button
              disabled={busy}
              onClick={() => login("/auth/register")}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
              }}
            >
              Register
            </button>

            <button
              disabled={busy}
              onClick={() => login("/auth/login")}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


  //  Logged in → main app
return (
  <div style={{ padding: 24, fontFamily: "system-ui" }}>
    <button onClick={logout} style={{ marginBottom: 16 }}>
      Logout
    </button>

    <Practice />
  </div>

  );



    async function logout() {
    await api.post("/auth/logout");
    setMe(null);
    setStatus("Not authenticated");
  }
}



