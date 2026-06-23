#!/usr/bin/env python3
"""
generate_charts.py — Regenerate benchmark comparison charts for NARA AI documentation.
Produces:
  - docs/assets/chart_algorithm_comparison.png   (NARA+LS vs Greedy vs Random)
  - docs/assets/chart_caloric_deviation.png      (7-day caloric delivery)
  - docs/assets/chart_ls_comparison.png          (Greedy-only vs Greedy+LocalSearch)
"""
import sys, os, random, collections
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
from parsing.recommendation_engine import (
    NaraRecommender, calculate_user_targets, is_main_dish,
    classify_recipe_category, _norm_prov, COMMODITY_KEYWORDS
)

# ─────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────
PROFILE = {
    "weight_kg": 60.0, "height_cm": 162.0, "age_years": 25,
    "sex": "female", "activity_level": "moderately_active",
    "goal": "weight_loss", "allergies": [], "province": "Jawa Barat",
    "clinical_conditions": []
}
N_RANDOM = 500
SEED = 42
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

C_NARA   = '#43644c'
C_GREEDY = '#7e9d8d'
C_RANDOM = '#bbcfc7'

OUT_DIR = os.path.join(os.path.dirname(__file__), 'assets')

# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────
def base_weight(cat):
    if cat in ('red_meat', 'poultry', 'fish_seafood', 'vegetable'):
        return 100.0
    if cat == 'plant_based':
        return 120.0
    return 300.0


def build_pool(engine, profile):
    user_allergies = {a.lower().strip() for a in profile.get('allergies', [])}
    pool = []
    for idx in range(len(engine.df)):
        row = engine.df.iloc[idx]
        if row['source'] != 'indonesian_local':
            continue
        ings = engine.parsed_ingredients[idx]
        skip = False
        for ing in ings:
            item = ing.get('item', '').lower().strip()
            if item in engine.allergen_map and (engine.allergen_map[item] & user_allergies):
                skip = True
                break
        if skip:
            continue
        if not is_main_dish(row['title'], ings, row['Recipe Protein']):
            continue
        cat = classify_recipe_category(ings, row['title'])
        pool.append((idx, row, cat))
    return pool


def pool_ras(pool, engine, prov_consumption):
    raws = []
    for idx, row, cat in pool:
        comp = engine.recipe_commodities[idx]
        raws.append(sum(comp[c] * prov_consumption.get(c, 0.0) for c in COMMODITY_KEYWORDS))
    max_r = max(raws) if raws else 1.0
    return [r / (max_r + 1e-5) for r in raws]


def ca(delivered, target):
    return max(0.0, 1.0 - abs(delivered - target) / max(target, 1.0))


def mb_all(dp, df, dc, tp, tf, tc):
    """Macro Balance: average accuracy across protein, fat, and carbohydrates."""
    p = max(0.0, 1.0 - abs(dp - tp) / max(tp, 1.0))
    f = max(0.0, 1.0 - abs(df - tf) / max(tf, 1.0))
    c = max(0.0, 1.0 - abs(dc - tc) / max(tc, 1.0))
    return (p + f + c) / 3.0


def clinical_safety(cal, prot, fat, floor_cal, t_prot, t_fat):
    """1.0 if meal satisfies all 3 clinical constraints, 0.0 otherwise.
    Constraints: calorie floor, fat cap (<=125% target), min protein (>=70% target)."""
    ok_cal  = cal  >= floor_cal
    ok_fat  = fat  <= t_fat * 1.25
    ok_prot = prot >= t_prot * 0.70
    return 1.0 if (ok_cal and ok_fat and ok_prot) else 0.0


def greedy_format(row, cat, t_cal, t_prot):
    """Calorie-first scale + nasi + veg (Greedy does not optimize macro/fat/RAS).
    Reserve 155 kcal for veg (25) + minimum nasi (100g = 130) so the full meal
    hits t_cal, not just the raw recipe component."""
    bw = base_weight(cat)
    rc  = row['Recipe Caloric Value']      * (bw / 100.0)
    rp  = row['Recipe Protein']            * (bw / 100.0)
    rf  = row['Recipe Fat']                * (bw / 100.0)
    rch = row['Recipe Carbohydrates']      * (bw / 100.0)

    cal_for_recipe = max(t_cal - 155.0, t_cal * 0.5)
    sf = max(0.5, min(2.0, round(cal_for_recipe / max(rc, 1.0), 1)))
    sc  = rc  * sf
    sp  = rp  * sf
    sf_ = rf  * sf
    sch = rch * sf

    veg_cal, veg_prot, veg_fat, veg_carb = 25.0, 2.0, 0.2, 4.0
    cal_gap = t_cal - sc - veg_cal
    nasi_g    = min(300.0, max(100.0, cal_gap / 1.30))
    nasi_cal  = 130.0 * (nasi_g / 100.0)
    nasi_prot =   2.7 * (nasi_g / 100.0)
    nasi_fat  =   0.3 * (nasi_g / 100.0)
    nasi_carb =  28.0 * (nasi_g / 100.0)

    total_cal  = sc  + veg_cal  + nasi_cal
    total_prot = sp  + veg_prot + nasi_prot
    total_fat  = sf_ + veg_fat  + nasi_fat
    total_carb = sch + veg_carb + nasi_carb
    return total_cal, total_prot, total_fat, total_carb


# ─────────────────────────────────────────────────────────────
# Main benchmark
# ─────────────────────────────────────────────────────────────
def main():
    rng = random.Random(SEED)

    print("Loading engine ...")
    engine = NaraRecommender()

    targets = calculate_user_targets(
        PROFILE['weight_kg'], PROFILE['height_cm'], PROFILE['age_years'],
        PROFILE['sex'], PROFILE['activity_level'], PROFILE['goal']
    )
    t_cal  = targets['caloric_target_meal']
    t_prot = targets['protein_target_meal']
    t_fat  = targets['fat_target_meal']
    t_carb = targets['carbohydrates_target_meal']
    # Calorie floor per meal (sex-based: 1600M / 1400F, split across 3 meals)
    min_daily = 1600.0 if PROFILE['sex'].lower() == 'male' else 1400.0
    floor_cal  = min_daily / 3.0
    print(f"Targets/meal: {t_cal:.1f} kcal | P: {t_prot:.1f}g | F: {t_fat:.1f}g | C: {t_carb:.1f}g | Floor: {floor_cal:.1f} kcal")

    prov_key = _norm_prov(PROFILE['province'])
    prov_consumption = engine.consumption_map.get(prov_key, engine.consumption_map.get('nasional', {}))

    pool = build_pool(engine, PROFILE)
    print(f"Valid pool: {len(pool)} recipes")

    norm_ras = pool_ras(pool, engine, prov_consumption)
    max_density = engine.df['Recipe Nutrition Density'].max()
    pool_aug = [(idx, row, cat, nras) for (idx, row, cat), nras in zip(pool, norm_ras)]

    # ── 1a. NARA Greedy (no local search) ────────────────────
    print("Running NARA Greedy (no local search) ...")
    gn_res   = engine.recommend(PROFILE, use_local_search=False)
    gn_meals = gn_res['primary_schedule']

    gn_ca  = np.mean([ca(m['calories_per_serving'], t_cal) for m in gn_meals])
    gn_mb  = np.mean([mb_all(m['protein_per_serving'], m['fat_per_serving'], m['carbs_per_serving'], t_prot, t_fat, t_carb) for m in gn_meals])
    gn_ra  = np.mean([m['regional_alignment_score'] / 100.0 for m in gn_meals])
    gn_nd  = np.mean([m['density'] / max_density for m in gn_meals])
    gn_cs  = np.mean([clinical_safety(m['calories_per_serving'], m['protein_per_serving'], m['fat_per_serving'], floor_cal, t_prot, t_fat) for m in gn_meals])
    gn_score = sum(m['score'] for m in gn_meals)

    # ── 1b. NARA + Local Search ───────────────────────────────
    print("Running NARA + Local Search ...")
    nara_res   = engine.recommend(PROFILE, use_local_search=True)
    nara_meals = nara_res['primary_schedule']

    nara_ca  = np.mean([ca(m['calories_per_serving'], t_cal) for m in nara_meals])
    nara_mb  = np.mean([mb_all(m['protein_per_serving'], m['fat_per_serving'], m['carbs_per_serving'], t_prot, t_fat, t_carb) for m in nara_meals])
    nara_ra  = np.mean([m['regional_alignment_score'] / 100.0 for m in nara_meals])
    nara_nd  = np.mean([m['density'] / max_density for m in nara_meals])
    nara_cs  = np.mean([clinical_safety(m['calories_per_serving'], m['protein_per_serving'], m['fat_per_serving'], floor_cal, t_prot, t_fat) for m in nara_meals])
    nara_score = sum(m['score'] for m in nara_meals)
    nara_cals = [m['calories_per_serving'] for m in nara_meals]

    print(f"\nNARA Greedy: CA={gn_ca*100:.1f}%  MB={gn_mb*100:.1f}%  RA={gn_ra*100:.1f}%  ND={gn_nd*100:.1f}%  TotalScore={gn_score:.2f}")
    print(f"NARA + LS  : CA={nara_ca*100:.1f}%  MB={nara_mb*100:.1f}%  RA={nara_ra*100:.1f}%  ND={nara_nd*100:.1f}%  TotalScore={nara_score:.2f}")
    print(f"LS delta   : CA={((nara_ca-gn_ca)*100):+.2f}%  MB={((nara_mb-gn_mb)*100):+.2f}%  RA={((nara_ra-gn_ra)*100):+.2f}%  ND={((nara_nd-gn_nd)*100):+.2f}%  Score={nara_score-gn_score:+.2f}")

    # ── 2. Greedy Calorie-Match ───────────────────────────────
    print("Running Greedy Calorie-Match ...")
    sorted_g = sorted(pool_aug,
                      key=lambda x: abs(x[1]['Recipe Caloric Value'] * (base_weight(x[2]) / 100.0) - t_cal))

    greedy_sel = []
    cat_cnt = collections.defaultdict(int)
    for idx, row, cat, nras in sorted_g:
        if cat_cnt[cat] >= 3:
            continue
        greedy_sel.append((idx, row, cat, nras))
        cat_cnt[cat] += 1
        if len(greedy_sel) >= 7:
            break

    g_cals, g_prots, g_fats, g_carbs, g_ras, g_nd = [], [], [], [], [], []
    for idx, row, cat, nras in greedy_sel:
        gc, gp, gf, gch = greedy_format(row, cat, t_cal, t_prot)
        g_cals.append(gc); g_prots.append(gp)
        g_fats.append(gf); g_carbs.append(gch)
        g_ras.append(nras)
        g_nd.append(row['Recipe Nutrition Density'] / max_density)

    greedy_ca = np.mean([ca(c, t_cal) for c in g_cals])
    greedy_mb = np.mean([mb_all(p, f, c, t_prot, t_fat, t_carb) for p, f, c in zip(g_prots, g_fats, g_carbs)])
    greedy_ra = np.mean(g_ras)
    greedy_nd = np.mean(g_nd)
    greedy_cs = np.mean([clinical_safety(c, p, f, floor_cal, t_prot, t_fat) for c, p, f in zip(g_cals, g_prots, g_fats)])

    # ── 3. Random (n=500) ─────────────────────────────────────
    print(f"Running Random baseline (n={N_RANDOM}) ...")
    r_ca_all, r_mb_all, r_ra_all, r_nd_all, r_cs_all = [], [], [], [], []
    r_cals_all = []

    pidx = list(range(len(pool_aug)))
    for _ in range(N_RANDOM):
        chosen = rng.sample(pidx, min(7, len(pidx)))
        tc, tp, tf, tch, tr, tn = [], [], [], [], [], []
        for pi in chosen:
            idx, row, cat, nras = pool_aug[pi]
            bw = base_weight(cat)
            rc  = row['Recipe Caloric Value'] * (bw / 100.0)
            rp  = row['Recipe Protein']       * (bw / 100.0)
            rf  = row['Recipe Fat']           * (bw / 100.0)
            rch = row['Recipe Carbohydrates'] * (bw / 100.0)
            tc.append(rc); tp.append(rp); tf.append(rf); tch.append(rch)
            tr.append(nras)
            tn.append(row['Recipe Nutrition Density'] / max_density)
        r_ca_all.append(np.mean([ca(c, t_cal) for c in tc]))
        r_mb_all.append(np.mean([mb_all(p, f, c, t_prot, t_fat, t_carb) for p, f, c in zip(tp, tf, tch)]))
        r_ra_all.append(np.mean(tr))
        r_nd_all.append(np.mean(tn))
        r_cs_all.append(np.mean([clinical_safety(c, p, f, floor_cal, t_prot, t_fat) for c, p, f in zip(tc, tp, tf)]))
        r_cals_all.append(tc)

    random_ca = np.mean(r_ca_all)
    random_mb = np.mean(r_mb_all)
    random_ra = np.mean(r_ra_all)
    random_nd = np.mean(r_nd_all)
    random_cs = np.mean(r_cs_all)
    random_cals_mean = np.mean(r_cals_all, axis=0)  # shape (7,)

    print(f"\nNARA  : CA={nara_ca*100:.1f}%  RA={nara_ra*100:.1f}%  ND={nara_nd*100:.1f}%  CS={nara_cs*100:.1f}%")
    print(f"Greedy: CA={greedy_ca*100:.1f}%  RA={greedy_ra*100:.1f}%  ND={greedy_nd*100:.1f}%  CS={greedy_cs*100:.1f}%")
    print(f"Random: CA={random_ca*100:.1f}%  RA={random_ra*100:.1f}%  ND={random_nd*100:.1f}%  CS={random_cs*100:.1f}%")

    # ─────────────────────────────────────────────────────────
    # Chart 1 — Multi-Dimensional Algorithm Comparison
    # ─────────────────────────────────────────────────────────
    metrics    = ['Caloric\nAccuracy', 'Clinical\nSafety', 'Regional\nAlignment', 'Nutrition\nDensity']
    nara_vals  = [nara_ca,   nara_cs,   nara_ra,   nara_nd  ]
    greedy_vals= [greedy_ca, greedy_cs, greedy_ra, greedy_nd]
    random_vals= [random_ca, random_cs, random_ra, random_nd]

    x   = np.arange(len(metrics))
    w   = 0.25
    fig, ax = plt.subplots(figsize=(13, 7))
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')

    bars_n = ax.bar(x - w,     [v*100 for v in nara_vals],   w, color=C_NARA,   label='NARA (proposed)',        zorder=3)
    bars_g = ax.bar(x,         [v*100 for v in greedy_vals], w, color=C_GREEDY, label='Greedy Calorie-Match',   zorder=3)
    bars_r = ax.bar(x + w,     [v*100 for v in random_vals], w, color=C_RANDOM, label=f'Random (n={N_RANDOM})', zorder=3)

    for bars in (bars_n, bars_g, bars_r):
        for bar in bars:
            h = bar.get_height()
            ax.text(bar.get_x() + bar.get_width() / 2, h + 0.8,
                    f'{h:.1f}%', ha='center', va='bottom', fontsize=9, fontweight='bold')

    ax.set_ylabel('Score (%)', fontsize=12)
    ax.set_ylim(0, 115)
    ax.set_xticks(x)
    ax.set_xticklabels(metrics, fontsize=11)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter(decimals=0))
    ax.grid(axis='y', linestyle='--', alpha=0.6, zorder=0)
    ax.set_axisbelow(True)
    for spine in ('top', 'right'):
        ax.spines[spine].set_visible(False)

    ax.legend(frameon=True, framealpha=0.9, fontsize=10, loc='upper right')

    subtitle = (f'female, {PROFILE["weight_kg"]:.0f} kg, {PROFILE["height_cm"]:.0f} cm, '
                f'moderately active, weight loss, {PROFILE["province"]}')
    fig.suptitle('NARA vs Baseline Methods — Multi-Dimensional Performance Comparison',
                 fontsize=13, fontweight='bold', y=0.98)
    ax.set_title(
        r'Continuous scoring: $\max(0,\;1 - |actual - target|\,/\,target)$'
        f'· profile: {subtitle}',
        fontsize=9.5, style='italic', pad=10
    )

    footnote = ('CA = Caloric Accuracy | '
                'CS = Clinical Safety (calorie floor + fat cap + min protein per meal) | '
                'RA = Regional Alignment (BPS provincial score) | '
                'ND = Nutrition Density (protein·4 + fiber·3) / kcal')
    fig.text(0.5, 0.01, footnote, ha='center', fontsize=8, color='#555555')

    plt.tight_layout(rect=[0, 0.04, 1, 0.96])
    out1 = os.path.join(OUT_DIR, 'chart_algorithm_comparison.png')
    fig.savefig(out1, dpi=150, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {out1}")

    # ─────────────────────────────────────────────────────────
    # Chart 2 — 7-Day Per-Meal Caloric Delivery vs Target
    # ─────────────────────────────────────────────────────────
    x2  = np.arange(7)
    w2  = 0.25
    fig2, ax2 = plt.subplots(figsize=(14, 6))
    fig2.patch.set_facecolor('white')
    ax2.set_facecolor('white')

    b2n = ax2.bar(x2 - w2, nara_cals,          w2, color=C_NARA,   label='NARA',                zorder=3)
    b2g = ax2.bar(x2,      g_cals,              w2, color=C_GREEDY, label='Greedy Calorie-Match', zorder=3)
    b2r = ax2.bar(x2 + w2, random_cals_mean,    w2, color=C_RANDOM, label=f'Random (mean, n={N_RANDOM})', zorder=3, alpha=0.85)

    # Deviation labels on NARA and Greedy bars only
    for bar, ref in zip(b2n, nara_cals):
        dev = (ref - t_cal) / t_cal * 100
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 3,
                 f'{dev:+.1f}%', ha='center', va='bottom', fontsize=7.5, fontweight='bold', color=C_NARA)
    for bar, ref in zip(b2g, g_cals):
        dev = (ref - t_cal) / t_cal * 100
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 3,
                 f'{dev:+.1f}%', ha='center', va='bottom', fontsize=7.5, fontweight='bold', color='#43644c')

    # Target line + tolerance band
    ax2.axhline(t_cal, color='#e63946', linewidth=1.8, linestyle='--', zorder=4,
                label=f'Target ({t_cal:.0f} kcal)')
    ax2.axhspan(t_cal * 0.95, t_cal * 1.05, alpha=0.12, color='#e63946', zorder=1)
    ax2.text(6.62, t_cal + 2, f'─{t_cal:.0f}', color='#e63946', fontsize=9, fontweight='bold', va='bottom')

    ax2.set_ylabel('Calories per Serving (kcal)', fontsize=12)
    ax2.set_xticks(x2)
    ax2.set_xticklabels(DAYS, fontsize=11)
    y_bot = max(0, min(min(random_cals_mean) - 40, t_cal * 0.35))
    ax2.set_ylim(y_bot, t_cal * 1.15)
    ax2.grid(axis='y', linestyle='--', alpha=0.5, zorder=0)
    ax2.set_axisbelow(True)
    for spine in ('top', 'right'):
        ax2.spines[spine].set_visible(False)

    ax2.legend(frameon=True, framealpha=0.9, fontsize=10, loc='upper right')
    ax2.set_title(f'7-Day Per-Meal Caloric Delivery vs Target\nShaded band: ±5% tolerance',
                  fontsize=12, style='italic')

    plt.tight_layout()
    out2 = os.path.join(OUT_DIR, 'chart_caloric_deviation.png')
    fig2.savefig(out2, dpi=150, bbox_inches='tight')
    plt.close(fig2)
    print(f"Saved: {out2}")

    # ─────────────────────────────────────────────────────────
    # Chart 3 — Greedy vs Greedy + Local Search comparison
    # ─────────────────────────────────────────────────────────
    metrics3    = ['Caloric\nAccuracy', 'Macro\nBalance', 'Regional\nAlignment', 'Nutrition\nDensity']
    gn_vals     = [gn_ca,    gn_mb,    gn_ra,    gn_nd   ]
    nara_ls_vals= [nara_ca,  nara_mb,  nara_ra,  nara_nd ]

    x3  = np.arange(len(metrics3))
    w3  = 0.30
    C_GN = '#7e9d8d'   # medium green — greedy only
    C_LS = '#43644c'   # dark green   — greedy + LS

    fig3, ax3 = plt.subplots(figsize=(11, 6))
    fig3.patch.set_facecolor('white')
    ax3.set_facecolor('white')

    b3g = ax3.bar(x3 - w3/2, [v*100 for v in gn_vals],     w3, color=C_GN, label='NARA Greedy',              zorder=3)
    b3l = ax3.bar(x3 + w3/2, [v*100 for v in nara_ls_vals], w3, color=C_LS, label='NARA + Local Search (ours)', zorder=3)

    for bar in b3g:
        h = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2, h + 0.8,
                 f'{h:.1f}%', ha='center', va='bottom', fontsize=9.5)

    for bar, gv in zip(b3l, gn_vals):
        h   = bar.get_height()
        d   = h - gv * 100
        col = '#43644c' if d > 0 else '#c0392b'
        ax3.text(bar.get_x() + bar.get_width()/2, h + 0.8,
                 f'{h:.1f}% ({d:+.1f})', ha='center', va='bottom',
                 fontsize=9.5, color=col, fontweight='bold')

    ax3.set_ylabel('Score (%)', fontsize=12)
    ax3.set_ylim(0, 120)
    ax3.set_xticks(x3)
    ax3.set_xticklabels(metrics3, fontsize=11)
    ax3.yaxis.set_major_formatter(mticker.PercentFormatter(decimals=0))
    ax3.grid(axis='y', linestyle='--', alpha=0.6, zorder=0)
    ax3.set_axisbelow(True)
    for spine in ('top', 'right'):
        ax3.spines[spine].set_visible(False)

    ax3.legend(frameon=True, framealpha=0.9, fontsize=10)
    fig3.suptitle('Greedy Selection vs Greedy + Local Search Refinement',
                  fontsize=13, fontweight='bold', y=0.98)
    ax3.set_title(
        f'Hill-climbing swap refinement over top-300 candidates · '
        f'Total score: Greedy={gn_score:.1f}  LS={nara_score:.1f}  (Δ={nara_score-gn_score:+.1f})',
        fontsize=9.5, style='italic', pad=10
    )

    plt.tight_layout(rect=[0, 0, 1, 0.96])
    out3 = os.path.join(OUT_DIR, 'chart_ls_comparison.png')
    fig3.savefig(out3, dpi=150, bbox_inches='tight')
    plt.close(fig3)
    print(f"Saved: {out3}")


if __name__ == '__main__':
    main()
