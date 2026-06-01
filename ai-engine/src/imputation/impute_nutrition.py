"""
impute_nutrition.py — KNN-based micronutrient imputation for the master nutrition database.

Run from:  nara-ai/ai-engine/
    python impute_nutrition.py
"""

import os
import random

import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import StandardScaler

# ──────────────────────────────────────────────
# Column definitions
# ──────────────────────────────────────────────

FEATURE_COLS = ["Caloric Value", "Protein", "Fat", "Carbohydrates"]

TARGET_COLS = [
    # Fat breakdown
    "Saturated Fats",
    "Monounsaturated Fats",
    "Polyunsaturated Fats",
    # Other proximate
    "Sugars",
    "Dietary Fiber",
    "Cholesterol",
    "Sodium",
    "Water",
    # Vitamins
    "Vitamin A",
    "Vitamin B1",
    "Vitamin B11",
    "Vitamin B12",
    "Vitamin B2",
    "Vitamin B3",
    "Vitamin B5",
    "Vitamin B6",
    "Vitamin C",
    "Vitamin D",
    "Vitamin E",
    "Vitamin K",
    # Minerals
    "Calcium",
    "Copper",
    "Iron",
    "Magnesium",
    "Manganese",
    "Phosphorus",
    "Potassium",
    "Selenium",
    "Zinc",
]

CSV_PATH = "datasets/master/master_nutrition_database.csv"
REPORT_PATH = "datasets/master/imputation_report.txt"


# ──────────────────────────────────────────────
# Helper: Nutrition Density formula
# ──────────────────────────────────────────────


def compute_nutrition_density(df: pd.DataFrame) -> pd.Series:
    """
    Weighted beneficial-nutrient score per 100 kcal (simplified ANDI-style).
    """
    score = (
        df["Protein"] * 4
        + df["Dietary Fiber"] * 3
        + df["Vitamin C"] * 0.5
        + df["Vitamin A"] * 0.01
        + df["Iron"] * 5
        + df["Calcium"] * 0.1
        + df["Potassium"] * 0.05
        + df["Magnesium"] * 0.2
        + df["Vitamin B12"] * 20
        + df["Zinc"] * 3
    ) / df["Caloric Value"].clip(lower=1)
    return score.round(3)


# ──────────────────────────────────────────────
# Main imputation function
# ──────────────────────────────────────────────


def impute_micronutrients() -> None:

    # ── 1. Load ──────────────────────────────
    print("📂 Loading master nutrition database …")
    df = pd.read_csv(CSV_PATH)
    print(f"   Total rows loaded : {len(df):,}")

    for col in TARGET_COLS + FEATURE_COLS:
        if col not in df.columns:
            raise ValueError(f"Expected column '{col}' not found in CSV.")
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # ── 2. Split ──────────────────────────────
    # Incomplete: ANY target column equals -1 (sentinel for "unavailable")
    incomplete_mask = (df[TARGET_COLS] == -1).any(axis=1)
    complete_mask = ~incomplete_mask

    n_complete = complete_mask.sum()
    n_incomplete = incomplete_mask.sum()

    print(f"✅ Complete rows    : {n_complete:,}")
    print(f"⚠️  Incomplete rows  : {n_incomplete:,}  (will be imputed)")

    if n_complete == 0:
        raise RuntimeError("No complete rows found — cannot train KNN.")
    if n_incomplete == 0:
        print("🎉 Nothing to impute. Dataset is already complete.")
        return

    df_complete = df[complete_mask].copy()
    df_incomplete = df[incomplete_mask].copy()

    # ── 3. Scale features ─────────────────────
    print("\n⚙️  Fitting StandardScaler on complete rows …")
    scaler = StandardScaler()
    X_complete_scaled = scaler.fit_transform(df_complete[FEATURE_COLS].values)
    X_incomplete_scaled = scaler.transform(df_incomplete[FEATURE_COLS].values)

    # ── 4. KNN imputation per target column ───
    print("🤖 Running KNN imputation (k=5, weights=distance) …")
    knn = KNeighborsRegressor(
        n_neighbors=5, weights="distance", metric="euclidean", n_jobs=-1
    )

    incomplete_idx = df[incomplete_mask].index
    imputed_values: dict = {}

    for col in TARGET_COLS:
        y_train = df_complete[col].values.astype(float)
        knn.fit(X_complete_scaled, y_train)
        y_pred = knn.predict(X_incomplete_scaled)

        # Clip to [0, 99th-percentile] — prevents biologically impossible outliers
        p99 = float(np.percentile(y_train, 99))
        clip_max = max(p99, 0.0)
        y_pred = np.clip(y_pred, 0.0, clip_max)
        imputed_values[col] = y_pred

    # ── 5. Write back ─────────────────────────
    print("📝 Writing imputed values back …")
    for col in TARGET_COLS:
        df.loc[incomplete_idx, col] = imputed_values[col]

    # ── 6. Recompute Nutrition Density ─────────
    print("🔢 Recomputing Nutrition Density for imputed rows …")
    df.loc[incomplete_idx, "Nutrition Density"] = compute_nutrition_density(
        df.loc[incomplete_idx]
    )

    # ── 7. Sanity check ───────────────────────
    print("🔍 Running final validation check …")
    for col in TARGET_COLS + ["Nutrition Density"]:
        bad = (df.loc[incomplete_idx, col] == -1).sum()
        assert bad == 0, (
            f"ASSERTION FAILED: '{col}' still has {bad} rows with -1 after imputation."
        )
    print("   ✅ No -1 values remain in any target column.")

    # ── 8. Validation report ──────────────────
    report_lines = []

    def rlog(line=""):
        print(line)
        report_lines.append(line)

    rlog()
    rlog("=" * 70)
    rlog("  IMPUTATION REPORT  —  KNN Micronutrient Imputation")
    rlog("=" * 70)
    rlog(f"  Total rows  : {len(df):,}")
    rlog(f"  Complete    : {n_complete:,}  (KNN training set)")
    rlog(f"  Imputed     : {n_incomplete:,}")
    rlog()
    rlog("─" * 70)
    rlog("  SAMPLE OF 5 IMPUTED ROWS")
    rlog("─" * 70)

    rng = random.Random(42)
    sample_indices = rng.sample(list(incomplete_idx), min(5, n_incomplete))
    showcase_cols = ["Protein", "Vitamin C", "Iron", "Calcium", "Potassium"]

    for idx in sample_indices:
        row = df.loc[idx]
        rlog(f"\n  Food : {row['food']}")
        rlog(
            f"  Macros → Cal: {row['Caloric Value']:.1f} kcal | "
            f"P: {row['Protein']:.2f}g | F: {row['Fat']:.2f}g | C: {row['Carbohydrates']:.2f}g"
        )
        rlog("  Imputed ↓")
        for sc in showcase_cols:
            rlog(f"    {sc:<20}: {row[sc]:.4f}")

    rlog()
    rlog("─" * 70)
    rlog("  POST-IMPUTATION STATS (imputed rows only)")
    rlog("─" * 70)
    rlog(f"  {'Column':<25}  {'Min':>10}  {'Mean':>10}  {'Max':>10}")
    rlog(f"  {'-' * 25}  {'-' * 10}  {'-' * 10}  {'-' * 10}")
    imputed_subset = df.loc[incomplete_idx, TARGET_COLS + ["Nutrition Density"]]
    for col in TARGET_COLS + ["Nutrition Density"]:
        s = imputed_subset[col]
        rlog(f"  {col:<25}  {s.min():>10.4f}  {s.mean():>10.4f}  {s.max():>10.4f}")

    rlog()
    rlog("=" * 70)
    rlog("  All checks passed. Dataset saved.")
    rlog("=" * 70)

    # ── 9. Save ───────────────────────────────
    print(f"\n💾 Saving updated CSV → {CSV_PATH}")
    df.to_csv(CSV_PATH, index=False)
    print("   ✅ CSV saved.")

    print(f"📄 Saving report → {REPORT_PATH}")
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines) + "\n")
    print("   ✅ Report saved.")

    print("\n🎉 Imputation complete!")


if __name__ == "__main__":
    impute_micronutrients()
