import { COLORS } from "@/config/theme";
interface TitleProps {
  text?: string;
}

export default function Title({ text = "Title" }: TitleProps) {
  return (
    <div
      style={{
        width: "100%",
        height: 52,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: "flex-start",
        alignItems: "center",
        display: "flex",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          color: COLORS.text,
          fontSize: 17,
          fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
          fontWeight: 510,
          lineHeight: "20px",
        }}
      >
        {text}
      </div>
    </div>
  );
}
