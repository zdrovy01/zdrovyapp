"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/config/language-context";
import { COLORS } from "@/config/theme";

interface TextInputProps {
  placeholder?: string;
  onSend?: (text: string) => void;
}

export default function TextInput({ placeholder = "Message", onSend }: TextInputProps) {
  const { lang } = useLanguage();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [text]);

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMicError("Your browser does not support speech recognition");
      setTimeout(() => setMicError(""), 3000);
      return;
    }

    transcriptRef.current = "";
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = lang;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          transcriptRef.current += e.results[i][0].transcript + " ";
        }
      }
    };

    recognition.onend = () => {
      setListening(false);
      const result = transcriptRef.current.trim();
      if (result) setText(result);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => {
      setListening(false);
      if (e.error === "not-allowed") {
        setMicError("Allow access to the microphone in the browser");
      } else if (e.error === "network") {
        setMicError("Internet connection is required for recognition");
      } else {
        setMicError(`Error: ${e.error}`);
      }
      setTimeout(() => setMicError(""), 4000);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch (e) {
      console.error("Recognition start failed:", e);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ width: "100%", paddingLeft: 20, paddingRight: 20, boxSizing: "border-box" }}>
      {micError && (
        <div style={{
          marginBottom: 8,
          color: COLORS.danger,
          fontSize: 13,
          fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
        }}>
          {micError}
        </div>
      )}

      <div style={{
        width: "100%",
        minHeight: 56,
        background: COLORS.surface,
        borderRadius: 4,
        padding: "12px 12px 12px 16px",
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        boxSizing: "border-box",
      }}>
        {/* Text area / Listening state */}
        {listening ? (
          <div style={{
            flex: "1 1 0",
            minHeight: 32,
            display: "flex",
            alignItems: "center",
            color: COLORS.textSecondary,
            fontSize: 17,
            fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
            fontWeight: 400,
            paddingTop: 6,
            paddingBottom: 6,
          }}>
            <span style={{ marginRight: 8 }}>Listening</span>
            <span style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: COLORS.accent, display: "inline-block",
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </span>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            style={{
              flex: "1 1 0",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              overflow: "hidden",
              color: COLORS.text,
              fontSize: 17,
              fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              fontWeight: 400,
              lineHeight: "22px",
              paddingTop: 5,
              paddingBottom: 5,
            }}
          />
        )}

        {/* Send button */}
        {text.trim() && !listening && (
          <button onClick={handleSend} style={{
            width: 32, height: 32, borderRadius: 100,
            background: COLORS.accent, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 12V2M7 2L2 7M7 2L12 7" stroke={COLORS.onAccent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Mic / Stop button */}
        {!text.trim() && (
          <button
            onClick={listening ? stopListening : startListening}
            style={{
              width: 32, height: 32, borderRadius: 100,
              background: listening ? "#FF453A" : COLORS.hairline,
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            {listening ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="10" height="10" rx="2" fill="var(--c-text,#F5F5F5)" />
              </svg>
            ) : (
              <svg width="11" height="15" viewBox="0 0 11 15" fill="none">
                <path d="M5.0332 9.14014C4.59733 9.14014 4.20378 9.03857 3.85254 8.83545C3.50553 8.63232 3.22835 8.3488 3.021 7.98486C2.81787 7.62093 2.71631 7.19775 2.71631 6.71533V2.42432C2.71631 1.94189 2.81787 1.51872 3.021 1.15479C3.22835 0.790853 3.50553 0.507324 3.85254 0.304199C4.20378 0.101074 4.59733 -0.000488281 5.0332 -0.000488281C5.46484 -0.000488281 5.85417 0.101074 6.20117 0.304199C6.55241 0.507324 6.82959 0.790853 7.03271 1.15479C7.23584 1.51872 7.3374 1.94189 7.3374 2.42432V6.71533C7.3374 7.19775 7.23584 7.62093 7.03271 7.98486C6.82959 8.3488 6.55241 8.63232 6.20117 8.83545C5.85417 9.03857 5.46484 9.14014 5.0332 9.14014ZM5.0332 11.7173C4.30111 11.7173 3.62826 11.603 3.01465 11.3745C2.40104 11.146 1.86784 10.8201 1.41504 10.397C0.966471 9.9738 0.61735 9.46598 0.367676 8.87354C0.122233 8.28109 -0.000488281 7.61882 -0.000488281 6.88672V5.65527C-0.000488281 5.46908 0.0651042 5.3125 0.196289 5.18555C0.331706 5.05436 0.492513 4.98877 0.678711 4.98877C0.869141 4.98877 1.03206 5.05436 1.16748 5.18555C1.3029 5.3125 1.37061 5.46908 1.37061 5.65527V6.84229C1.37061 7.56169 1.52507 8.1901 1.83398 8.72754C2.14714 9.26497 2.57878 9.6818 3.12891 9.97803C3.67904 10.27 4.3138 10.416 5.0332 10.416C5.74837 10.416 6.38102 10.27 6.93115 9.97803C7.48128 9.6818 7.91081 9.26497 8.21973 8.72754C8.52865 8.1901 8.68311 7.56169 8.68311 6.84229V5.65527C8.68311 5.46908 8.75081 5.3125 8.88623 5.18555C9.02165 5.05436 9.18457 4.98877 9.375 4.98877C9.56543 4.98877 9.72624 5.05436 9.85742 5.18555C9.99284 5.3125 10.0605 5.46908 10.0605 5.65527V6.88672C10.0605 7.61882 9.93571 8.28109 9.68604 8.87354C9.44059 9.46598 9.09147 9.9738 8.63867 10.397C8.1901 10.8201 7.6569 11.146 7.03906 11.3745C6.42546 11.603 5.75684 11.7173 5.0332 11.7173ZM2.0625 14.2119C1.87207 14.2119 1.70703 14.1442 1.56738 14.0088C1.43197 13.8776 1.36426 13.721 1.36426 13.5391C1.36426 13.3486 1.43197 13.1857 1.56738 13.0503C1.70703 12.9191 1.87207 12.8535 2.0625 12.8535H7.99756C8.18799 12.8535 8.35091 12.9191 8.48633 13.0503C8.62598 13.1857 8.6958 13.3486 8.6958 13.5391C8.6958 13.721 8.62598 13.8776 8.48633 14.0088C8.35091 14.1442 8.18799 14.2119 7.99756 14.2119H2.0625ZM5.0332 13.8945C4.85124 13.8945 4.69466 13.8289 4.56348 13.6978C4.43652 13.5666 4.37305 13.4079 4.37305 13.2217V11.3301C4.37305 11.1481 4.43652 10.9915 4.56348 10.8604C4.69466 10.7249 4.85124 10.6572 5.0332 10.6572C5.21094 10.6572 5.36328 10.7249 5.49023 10.8604C5.62142 10.9915 5.68701 11.1481 5.68701 11.3301V13.2217C5.68701 13.4079 5.62142 13.5666 5.49023 13.6978C5.36328 13.8289 5.21094 13.8945 5.0332 13.8945Z" fill="var(--c-text,#F5F5F5)" />
              </svg>
            )}
          </button>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
