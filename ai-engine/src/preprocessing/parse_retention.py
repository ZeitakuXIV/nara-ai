#!/usr/bin/env python3
"""
parse_retention.py — Parses the raw caret-delimited USDA Table of Nutrient Retention Factors
(Release 6) and compiles it into a clean, structured master CSV.
"""

import os
import csv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_TXT_PATH = os.path.join(BASE_DIR, "datasets/retention/retn06.txt")
OUTPUT_CSV_PATH = os.path.join(BASE_DIR, "datasets/master/master_retention_factors.csv")

def parse_usda_retention():
    print("🚀 memproses USDA Nutrient Retention Factors Release 6 ...")
    
    if not os.path.exists(RAW_TXT_PATH):
        raise FileNotFoundError(f"Raw USDA file not found at {RAW_TXT_PATH}")
        
    master_dir = os.path.dirname(OUTPUT_CSV_PATH)
    if not os.path.exists(master_dir):
        os.makedirs(master_dir)
        
    parsed_rows = []
    
    with open(RAW_TXT_PATH, "r", encoding="utf-8") as infile:
        for idx, line in enumerate(infile):
            line = line.strip()
            if not line:
                continue
                
            # Split by caret '^'
            parts = line.split("^")
            if len(parts) < 6:
                print(f"⚠️ Skipping line {idx + 1} (invalid structure): {line}")
                continue
                
            # Clean fields by removing tildes '~'
            retn_code = parts[0].replace("~", "").strip()
            fdgrp_cd = parts[1].replace("~", "").strip()
            retn_desc = parts[2].replace("~", "").strip()
            nutr_no = parts[3].replace("~", "").strip()
            nutr_desc = parts[4].replace("~", "").strip()
            
            # Convert retention factor percentage to decimal multiplier
            try:
                raw_factor = float(parts[5].replace("~", "").strip())
                retn_factor = round(raw_factor / 100.0, 3)
            except ValueError:
                retn_factor = 1.0  # Default fallback if parsing fails
                
            parsed_rows.append({
                "retn_code": retn_code,
                "fdgrp_cd": fdgrp_cd,
                "retn_desc": retn_desc,
                "nutr_no": nutr_no,
                "nutr_desc": nutr_desc,
                "retn_factor": retn_factor
            })
            
    # Write to master CSV
    headers = ["retn_code", "fdgrp_cd", "retn_desc", "nutr_no", "nutr_desc", "retn_factor"]
    with open(OUTPUT_CSV_PATH, "w", encoding="utf-8", newline="") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=headers)
        writer.writeheader()
        writer.writerows(parsed_rows)
        
    print("=" * 50)
    print("🏆 USDA NUTRIENT RETENTION SELESAI!")
    print(f"📍 Lokasi: {OUTPUT_CSV_PATH}")
    print(f"📊 Total Rows Parsed: {len(parsed_rows)}")
    print("=" * 50)

if __name__ == "__main__":
    parse_usda_retention()
