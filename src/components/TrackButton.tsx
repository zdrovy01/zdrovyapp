"use client";

import { useState } from "react";
import Sheet from "./Sheet";
import styles from "./TrackButton.module.css";

const FOOD_FIELDS = [
  { key: "proteins", label: "Proteins" },
  { key: "fats", label: "Fats" },
  { key: "carbs", label: "Carbs" },
] as const;

const WATER_STEP = 250;

type View = "options" | "food" | "water";

export default function TrackButton() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("options");
  const [values, setValues] = useState<Record<string, string>>({});
  const [water, setWater] = useState(0);

  const close = () => {
    setOpen(false);
    setView("options");
    setValues({});
    setWater(0);
  };

  const title =
    view === "food" ? "Food" : view === "water" ? "Water" : "What do you want to track?";

  return (
    <>
      <button
        type="button"
        className={styles.track}
        onClick={() => setOpen(true)}
      >
        Track
      </button>

      <Sheet open={open} onClose={close} peek={56} title={title}>
        {view === "options" && (
          <div className={styles.grid}>
            <button
              type="button"
              className={styles.square}
              onClick={() => setView("food")}
            >
              Food
            </button>
            <button
              type="button"
              className={styles.square}
              onClick={() => setView("water")}
            >
              Water
            </button>
          </div>
        )}

        {view === "food" && (
          <div className={styles.form}>
            {FOOD_FIELDS.map((f) => (
              <div key={f.key} className={styles.field}>
                <span className={styles.fieldLabel}>{f.label}</span>
                <span className={styles.inputWrap}>
                  <input
                    className={styles.input}
                    inputMode="numeric"
                    placeholder="0"
                    value={values[f.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                  />
                  <span className={styles.unit}>g</span>
                </span>
              </div>
            ))}
            <button type="button" className={styles.save} onClick={close}>
              Save
            </button>
          </div>
        )}

        {view === "water" && (
          <div className={styles.form}>
            <div className={styles.field}>
              <span className={styles.inputWrap}>
                <input
                  className={styles.waterInput}
                  inputMode="numeric"
                  placeholder="0"
                  value={water ? String(water) : ""}
                  onChange={(e) =>
                    setWater(Math.max(0, parseInt(e.target.value, 10) || 0))
                  }
                />
                <span className={styles.unit}>ml</span>
              </span>
              <div className={styles.stepper}>
                <button
                  type="button"
                  className={styles.stepBtn}
                  aria-label="Remove 250 ml"
                  onClick={() => setWater((w) => Math.max(0, w - WATER_STEP))}
                >
                  −
                </button>
                <button
                  type="button"
                  className={styles.stepBtn}
                  aria-label="Add 250 ml"
                  onClick={() => setWater((w) => w + WATER_STEP)}
                >
                  +
                </button>
              </div>
            </div>
            <button type="button" className={styles.save} onClick={close}>
              Save
            </button>
          </div>
        )}
      </Sheet>
    </>
  );
}
