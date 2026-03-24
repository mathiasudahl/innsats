"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserConfig } from "@/lib/types";

const FIELD_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  backgroundColor: "var(--bg)",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--text)",
  marginBottom: "0.25rem",
};

const HINT_STYLE: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-subtle)",
  marginBottom: "0.5rem",
  lineHeight: 1.4,
};

function Field({
  label,
  hint,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  hint?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={LABEL_STYLE}>{label}</label>
      {hint && <p style={HINT_STYLE}>{hint}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...FIELD_STYLE, border: `1px solid ${error ? "#ef4444" : "var(--border)"}` }}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [athleteId, setAthleteId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  async function handlePreset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/check-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const config: UserConfig = {
        mode: "preset",
        name: "Mathias & Karoline",
        athleteId: "",
        apiKey: "",
      };
      localStorage.setItem("user-config", JSON.stringify(config));
      router.push("/");
      router.refresh();
    } else {
      setError("Feil passord");
      setLoading(false);
    }
  }

  function handleCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !athleteId.trim() || !apiKey.trim()) {
      setError("Navn, Athlete ID og API-nøkkel er påkrevd");
      return;
    }
    const config: UserConfig = {
      mode: "custom",
      name: name.trim(),
      athleteId: athleteId.trim(),
      apiKey: apiKey.trim(),
      anthropicKey: anthropicKey.trim() || undefined,
    };
    localStorage.setItem("user-config", JSON.stringify(config));
    router.push("/");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "var(--bg)",
        paddingTop: "4rem",
        paddingBottom: "4rem",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "2rem",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <h1
          style={{
            color: "var(--text)",
            fontSize: "1.375rem",
            fontWeight: 700,
            marginBottom: "0.25rem",
          }}
        >
          Innsats
        </h1>
        <p style={{ color: "var(--text-subtle)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
          Logg inn eller legg inn dine nøkler for å komme i gang.
        </p>

        {/* Preset login */}
        {!showCustom && (
          <form onSubmit={handlePreset}>
            <Field
              label="Passord"
              hint="Har du passord til siden, skriv det inn her."
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Passord"
              error={!!error}
            />
            {error && (
              <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "0.75rem" }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: "100%",
                padding: "0.625rem",
                backgroundColor: "var(--text)",
                color: "var(--surface)",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.9375rem",
                fontWeight: 600,
                cursor: loading || !password ? "not-allowed" : "pointer",
                opacity: loading || !password ? 0.6 : 1,
                marginBottom: "1.25rem",
              }}
            >
              {loading ? "Logger inn…" : "Logg inn"}
            </button>

            <div style={{ textAlign: "center" }}>
              <span style={{ color: "var(--text-subtle)", fontSize: "0.8125rem" }}>Ingen passord? </span>
              <button
                type="button"
                onClick={() => { setShowCustom(true); setError(""); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                Legg inn egne nøkler
              </button>
            </div>
          </form>
        )}

        {/* Custom login */}
        {showCustom && (
          <form onSubmit={handleCustom}>
            <button
              type="button"
              onClick={() => { setShowCustom(false); setError(""); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-subtle)",
                fontSize: "0.8125rem",
                cursor: "pointer",
                marginBottom: "1.25rem",
                padding: 0,
              }}
            >
              ← Tilbake
            </button>

            <Field
              label="Ditt navn"
              hint="Brukes som visningsnavn i appen."
              value={name}
              onChange={setName}
              placeholder="F.eks. Ola"
            />

            <Field
              label="Intervals Athlete ID"
              hint='Finn det på intervals.icu → Innstillinger → API. Ser slik ut: "i123456".'
              value={athleteId}
              onChange={setAthleteId}
              placeholder="i123456"
            />

            <Field
              label="Intervals API-nøkkel"
              hint="Samme sted: intervals.icu → Innstillinger → API → generer nøkkel."
              type="password"
              value={apiKey}
              onChange={setApiKey}
              placeholder="API-nøkkel"
            />

            <Field
              label="Anthropic API-nøkkel (valgfri)"
              hint="Gir tilgang til KI-funksjoner. Lag konto på console.anthropic.com og lag en API-nøkkel under API Keys."
              type="password"
              value={anthropicKey}
              onChange={setAnthropicKey}
              placeholder="sk-ant-..."
            />

            {!anthropicKey && (
              <div
                style={{
                  backgroundColor: "rgba(234,179,8,0.08)",
                  border: "1px solid rgba(234,179,8,0.25)",
                  borderRadius: "0.5rem",
                  padding: "0.625rem 0.75rem",
                  fontSize: "0.8125rem",
                  color: "#92400e",
                  marginBottom: "1rem",
                }}
              >
                Uten Anthropic-nøkkel vil KI-funksjoner (daglig analyse, øktforslag, push-program) være deaktivert. Du kan legge den til senere via innstillinger.
              </div>
            )}

            {error && (
              <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "0.75rem" }}>{error}</p>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.625rem",
                backgroundColor: "var(--text)",
                color: "var(--surface)",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.9375rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Kom i gang
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
