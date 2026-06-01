import pandas as pd
import glob
import os
import json

def run_comprehensive_eda():
    csv_files = glob.glob('datasets/**/*.csv', recursive=True)
    results = []

    print(f"Analyzing {len(csv_files)} files...")

    for file_path in csv_files:
        try:
            # Using low_memory=False to avoid DtypeWarning
            df = pd.read_csv(file_path, low_memory=False)
            
            # Identify numeric columns for basic stats
            numeric_df = df.select_dtypes(include=['number'])
            stats = numeric_df.describe().to_dict() if not numeric_df.empty else {}

            file_info = {
                "file_path": file_path,
                "rows": len(df),
                "cols": len(df.columns),
                "null_total": int(df.isnull().sum().sum()),
                "duplicate_rows": int(df.duplicated().sum()),
                "columns": list(df.columns),
                "numeric_stats": stats
            }
            results.append(file_info)
            print(f"✅ Processed: {file_path}")
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")

    with open('eda_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("\nEDA completed. Results saved to eda_results.json")

if __name__ == "__main__":
    run_comprehensive_eda()
