import styles from "./page.module.css";
import TypedText from "@/components/TypedText";
import TrackButton from "@/components/TrackButton";

export default function Home() {
  return (
    <main className={styles.hero}>
      <TypedText
        className={styles.comment}
        text="Hello Andrew, track something so I can see how you're doing."
        step={0.02}
      />
      <div>
        <TrackButton />
      </div>
    </main>
  );
}
