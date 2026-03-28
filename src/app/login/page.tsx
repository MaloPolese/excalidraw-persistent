"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Wrong password.");
        setPassword("");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f8f8",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          padding: "40px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#111",
          }}
        >
          Board
        </h1>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>
          Enter your password to access the board.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "14px",
              border: error ? "1px solid #f87171" : "1px solid #e5e5e5",
              borderRadius: "6px",
              outline: "none",
              marginBottom: "8px",
              fontFamily: "monospace",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p
              style={{
                fontSize: "12px",
                color: "#dc2626",
                marginBottom: "8px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              fontFamily: "monospace",
              background: loading || !password ? "#e5e5e5" : "#111",
              color: loading || !password ? "#999" : "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: loading || !password ? "not-allowed" : "pointer",
              transition: "background 0.15s ease",
            }}
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
