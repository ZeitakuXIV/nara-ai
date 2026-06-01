#!/usr/bin/env python3
"""
main.py — Central CLI orchestrator for the Nara AI-Engine pipeline.
"""

import argparse
import sys
import os
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def run_script(script_path: str):
    """Safely runs a python script in a subprocess from the root directory."""
    full_path = os.path.join(BASE_DIR, script_path)
    if not os.path.exists(full_path):
        print(f"❌ Script not found: {script_path}")
        return False
        
    print(f"\n=======================================================")
    print(f"▶️  Executing: {script_path}")
    print(f"=======================================================")
    
    try:
        # Run subprocess with python interpreter
        result = subprocess.run([sys.executable, full_path], cwd=BASE_DIR, check=True)
        print(f"✅ Success: {script_path} completed successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failure: {script_path} failed with exit code {e.returncode}.")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Nara Nutrition AI-Engine Data Pipeline Orchestrator"
    )
    
    # Define steps
    steps_group = parser.add_argument_group("Pipeline Steps")
    steps_group.add_argument(
        "--ingest", action="store_true", help="Step 1: Run web scraping and data ingestion"
    )
    steps_group.add_argument(
        "--preprocess", action="store_true", help="Step 2: Compile & standardize master databases"
    )
    steps_group.add_argument(
        "--impute", action="store_true", help="Step 3: Run rules-based expert imputation"
    )
    steps_group.add_argument(
        "--parse", action="store_true", help="Step 4: Run advanced recipe NLP parsing"
    )
    steps_group.add_argument(
        "--eda", action="store_true", help="Step 5: Run Exploratory Data Analysis & quality checks"
    )
    
    # Legacy flags / baselines
    baselines_group = parser.add_argument_group("Legacy/Baseline Steps")
    baselines_group.add_argument(
        "--impute-knn", action="store_true", help="Run legacy KNN imputation baseline"
    )
    
    # Combined triggers
    parser.add_argument(
        "--all", action="store_true", help="Run the entire production pipeline (Steps 1 through 5)"
    )
    
    args = parser.parse_args()
    
    # If no arguments provided, show help
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(1)
        
    # Sequence of scripts for pipeline
    if args.all:
        print("🚀 Executing entire Nara AI-Engine production pipeline ...")
        steps = [
            ("ingestion", "src/ingestion/scraping.py"),
            ("preprocessing (allergen)", "src/preprocessing/build_master_allergen.py"),
            ("preprocessing (allergen standardization)", "src/preprocessing/standardize_allergen.py"),
            ("preprocessing (nutrition)", "src/preprocessing/build_master_nutrition.py"),
            ("preprocessing (recipe)", "src/preprocessing/build_master_recipe.py"),
            ("imputation (expert rules)", "src/imputation/impute_expert.py"),
            ("nlp recipe parsing", "src/parsing/recipe_advanced_parser.py"),
            ("eda analysis", "src/analysis/run_eda.py"),
            ("eda report converter", "src/analysis/convert_report.py"),
        ]
        
        for name, script in steps:
            print(f"\n⚡ Starting pipeline stage: {name}")
            success = run_script(script)
            if not success:
                print(f"\n❌ Pipeline aborted due to failure in stage: {name}")
                sys.exit(1)
                
        print("\n🎉 End-to-end Nara AI-Engine pipeline completed successfully!")
        sys.exit(0)

    # Individual steps
    if args.ingest:
        run_script("src/ingestion/scraping.py")
        
    if args.preprocess:
        print("🛠️  Running database preprocessing and merging ...")
        run_script("src/preprocessing/build_master_allergen.py")
        run_script("src/preprocessing/standardize_allergen.py")
        run_script("src/preprocessing/build_master_nutrition.py")
        run_script("src/preprocessing/build_master_recipe.py")
        
    if args.impute:
        run_script("src/imputation/impute_expert.py")
        
    if args.impute_knn:
        run_script("src/imputation/impute_nutrition.py")
        
    if args.parse:
        run_script("src/parsing/recipe_advanced_parser.py")
        
    if args.eda:
        run_script("src/analysis/run_eda.py")
        run_script("src/analysis/convert_report.py")

if __name__ == "__main__":
    main()
