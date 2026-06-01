"""
run_eda.py — Exploratory Data Analysis & Quality Audit.
Performs global auditing on all CSV files and generates deep recipe nutrition metrics.
"""

import os
import glob
import json
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REPORTS_DIR = os.path.join(BASE_DIR, "docs/reports")
JSON_OUTPUT = os.path.join(REPORTS_DIR, "eda_results.json")

def run_comprehensive_eda():
    os.makedirs(REPORTS_DIR, exist_ok=True)
    csv_files = glob.glob(os.path.join(BASE_DIR, 'datasets/**/*.csv'), recursive=True)
    results = []

    print(f"📊 Analyzing {len(csv_files)} files in the datasets directory...")

    for file_path in csv_files:
        rel_path = os.path.relpath(file_path, BASE_DIR)
        try:
            df = pd.read_csv(file_path, low_memory=False)
            
            # Global numeric stats
            numeric_df = df.select_dtypes(include=['number'])
            stats = numeric_df.describe().to_dict() if not numeric_df.empty else {}

            file_info = {
                "file_path": rel_path,
                "rows": len(df),
                "cols": len(df.columns),
                "null_total": int(df.isnull().sum().sum()),
                "duplicate_rows": int(df.duplicated().sum()),
                "columns": list(df.columns),
                "numeric_stats": stats,
                "recipe_audit": None
            }
            
            # Specific deep audit for Master Recipe Database
            if "master_recipe_database.csv" in file_path:
                print("   🔬 Running deep nutritional audit on Master Recipe Database ...")
                
                # Check for Recipe Nutrition columns
                recipe_cols = [c for c in df.columns if c.startswith("Recipe ")]
                
                if recipe_cols:
                    avg_cal = float(df["Recipe Caloric Value"].mean())
                    avg_prot = float(df["Recipe Protein"].mean())
                    avg_fat = float(df["Recipe Fat"].mean())
                    avg_carb = float(df["Recipe Carbohydrates"].mean())
                    avg_fiber = float(df["Recipe Dietary Fiber"].mean())
                    avg_match_rate = float(df["structured_match_rate"].mean())
                    
                    # Identify Top 5 most nutrient-dense recipes
                    top_dense = df.sort_values(by="Recipe Nutrition Density", ascending=False).head(5)
                    top_dense_list = []
                    
                    for _, r in top_dense.iterrows():
                        top_dense_list.append({
                            "title": str(r["title"]),
                            "calories": float(r["Recipe Caloric Value"]),
                            "protein": float(r["Recipe Protein"]),
                            "fat": float(r["Recipe Fat"]),
                            "carbs": float(r["Recipe Carbohydrates"]),
                            "density": float(r["Recipe Nutrition Density"]),
                            "iron": float(r["Recipe Iron"]),
                            "calcium": float(r["Recipe Calcium"]),
                            "potassium": float(r["Recipe Potassium"])
                        })
                        
                    file_info["recipe_audit"] = {
                        "avg_calories": round(avg_cal, 2),
                        "avg_protein": round(avg_prot, 2),
                        "avg_fat": round(avg_fat, 2),
                        "avg_carbs": round(avg_carb, 2),
                        "avg_fiber": round(avg_fiber, 2),
                        "avg_ingredient_match_rate": round(avg_match_rate * 100, 2),
                        "top_dense_recipes": top_dense_list
                    }

            results.append(file_info)
            print(f"   ✅ Processed: {rel_path}")
        except Exception as e:
            print(f"   ❌ Error processing {rel_path}: {e}")

    with open(JSON_OUTPUT, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n🎉 EDA completed. Results saved to: docs/reports/eda_results.json")

if __name__ == "__main__":
    run_comprehensive_eda()
