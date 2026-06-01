"""
convert_report.py — EDA JSON-to-Markdown Formatter.
Parses the audited eda_results.json and creates a comprehensive, collaborative markdown report.
"""

import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REPORTS_DIR = os.path.join(BASE_DIR, "docs/reports")
JSON_INPUT = os.path.join(REPORTS_DIR, "eda_results.json")
MD_OUTPUT = os.path.join(REPORTS_DIR, "eda_report.md")

def convert_json_to_md():
    if not os.path.exists(JSON_INPUT):
        print(f"❌ JSON input not found at: {JSON_INPUT}")
        return
        
    print(f"📂 Loading JSON results from: {JSON_INPUT}")
    with open(JSON_INPUT, 'r') as f:
        data = json.load(f)

    print(f"📝 Writing Markdown report to: {MD_OUTPUT}")
    with open(MD_OUTPUT, 'w', encoding='utf-8') as f:
        f.write('# 📊 Nara Nutrition AI-Engine — Comprehensive EDA & Quality Report\n\n')
        f.write('This document contains the automated data quality checks, database row/column metrics, and deep recipe nutrition statistics for the master database.\n\n')
        
        # 1. Summary Card
        f.write('## 🚀 Database Summary Overview\n\n')
        f.write('| Target Database | Total Rows | Total Columns | Duplicate Records | Status |\n')
        f.write('| :--- | :---: | :---: | :---: | :---: |\n')
        
        for item in data:
            f_name = os.path.basename(item["file_path"])
            status = "✅ Clean" if item["null_total"] == 0 else "⚠️  Incomplete"
            f.write(f'| **{f_name}** | {item["rows"]:,} | {item["cols"]} | {item["duplicate_rows"]} | {status} |\n')
            
        f.write('\n---\n\n')
        
        # 2. Deep Recipe Audit Section (If available)
        recipe_item = next((x for x in data if x["recipe_audit"] is not None), None)
        if recipe_item:
            audit = recipe_item["recipe_audit"]
            f.write('## 🔬 Deep Nutritional Audit: Master Recipe Database\n\n')
            f.write('These statistics are compiled by our **Recipe Nutrition Compiler**, which matches parsed ingredients dynamically against the imputed master nutrition catalog.\n\n')
            
            f.write('### Average Recipe Nutrient Metrics (per 100g mixture)\n')
            f.write('| Metric / Nutrient | Compiled Average Value |\n')
            f.write('| :--- | :--- |\n')
            f.write(f'| **Ingredient Match Rate** | **{audit["avg_ingredient_match_rate"]}%** (Fuzzy/Exact successfully linked) |\n')
            f.write(f'| **Calories (per 100g)** | {audit["avg_calories"]} kcal |\n')
            f.write(f'| **Protein (per 100g)** | {audit["avg_protein"]} g |\n')
            f.write(f'| **Fat (per 100g)** | {audit["avg_fat"]} g |\n')
            f.write(f'| **Carbohydrates (per 100g)** | {audit["avg_carbs"]} g |\n')
            f.write(f'| **Dietary Fiber (per 100g)** | {audit["avg_fiber"]} g |\n\n')
            
            f.write('### 🏆 Top 5 Most Nutrient-Dense Recipes Showcase\n')
            f.write('These recipes are sorted by their **Recipe Nutrition Density score** (beneficial nutrients per calorie):\n\n')
            f.write('| Rank | Recipe Title | Cal Value (100g) | Protein (100g) | Iron (mg) | Calcium (mg) | Potassium (mg) | Nutrition Density |\n')
            f.write('| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n')
            
            for i, rec in enumerate(audit["top_dense_recipes"]):
                f.write(f'| {i+1} | **{rec["title"]}** | {rec["calories"]} kcal | {rec["protein"]}g | {rec["iron"]:.2f}mg | {rec["calcium"]:.1f}mg | {rec["potassium"]:.1f}mg | **{rec["density"]:.3f}** |\n')
                
            f.write('\n---\n\n')

        # 3. Individual File Details
        f.write('## 📄 Detailed File Quality Breakdown\n\n')
        for item in data:
            f.write(f'### File: `{item["file_path"]}`\n\n')
            f.write('| Metric | Value |\n')
            f.write('| :--- | :--- |\n')
            f.write(f'| **Rows** | {item["rows"]:,} |\n')
            f.write(f'| **Columns** | {item["cols"]} |\n')
            f.write(f'| **Total Missing Cells** | {item["null_total"]} |\n')
            f.write(f'| **Duplicate Rows** | {item["duplicate_rows"]} |\n\n')
            
            f.write("**Columns Staged:**\n")
            f.write(", ".join([f"`{c}`" for c in item['columns']]) + "\n\n")
            
            if item['numeric_stats']:
                f.write("**Numeric Statistics Summary:**\n")
                f.write("| Column Name | Mean | Min | Max |\n")
                f.write("| :--- | :--- | :--- | :--- |\n")
                count = 0
                for col, stats in item['numeric_stats'].items():
                    if count > 10: 
                        f.write("| ... | ... | ... | ... |\n")
                        break
                    # We skip recipe nutrition metrics in the summary list to avoid cluttering the table
                    if col.startswith("Recipe "):
                        continue
                    mean = round(stats.get('mean', 0), 2)
                    min_val = round(stats.get('min', 0), 2)
                    max_val = round(stats.get('max', 0), 2)
                    f.write(f'| {col} | {mean} | {min_val} | {max_val} |\n')
                    count += 1
            f.write('\n\n')

    print(f"✅ MD report written successfully: docs/reports/eda_report.md")

if __name__ == "__main__":
    convert_json_to_md()
