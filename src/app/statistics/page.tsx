import styles from "./statistics.module.css";

const METRICS = [
  { key: "sleep", label: "Sleep", value: 0, unit: "h" },
  { key: "calories", label: "Calories", value: 0, unit: "kcal" },
  { key: "movement", label: "Movement", value: 0, unit: "min" },
  { key: "water", label: "Water", value: 0, unit: "ml" },
];

export default function Statistics() {
  return (
    <main className="routeMain">
      <h1 className="routeTitle">Statistics</h1>
      <div className={styles.grid}>
        {METRICS.map((m) => (
          <div key={m.key} className={styles.card}>
            <span className={styles.label}>{m.label}</span>
            <span className={styles.value}>
              <span className={styles.number}>{m.value}</span>
              <span className={styles.unit}>{m.unit}</span>
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
