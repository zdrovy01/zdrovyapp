import styles from "./page.module.css";
import TypedText from "@/components/TypedText";

export default function Home() {
  return (
    <main className={styles.hero}>
      <TypedText
        className={styles.comment}
        text="Hi Andrew! How did you sleep today?"
        step={0.02}
      />
    </main>
  );
}
