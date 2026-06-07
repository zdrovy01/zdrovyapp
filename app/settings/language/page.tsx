"use client";

import { useLanguage } from "@/config/language-context";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";

const languages = [
    { code: "en-US", name: "English" },
    { code: "uk-UA", name: "Українська" },
    { code: "pl-PL", name: "Polski" },
    { code: "ru-RU", name: "Русский" },
];

export default function SettingsPage() {
    const { lang, setLang } = useLanguage();

    return (
        <>
            <Space size={40} />
            <ToolbarWin title="Language" />
            <Space size={20} />

            {languages.map((l) => (
                <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    style={{
                        width: "100%",
                        padding: "16px 20px",
                        background: lang === l.code ? "rgba(10,132,255,0.1)" : "transparent",
                        border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        color: lang === l.code ? "#0A84FF" : "#F5F5F5",
                        fontSize: 16,
                        fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
                        fontWeight: lang === l.code ? 600 : 400,
                        cursor: "pointer",
                        textAlign: "left",
                    }}
                >
                    {l.name}
                </button>
            ))}
        </>
    );
}