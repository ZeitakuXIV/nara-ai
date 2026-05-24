import pandas as pd
import re
import json
import os

def get_unit_map():
    # Standard conversion to grams (approximate)
    return {
        'cup': 240,
        'cups': 240,
        'tablespoon': 15,
        'tablespoons': 15,
        'tbsp': 15,
        'teaspoon': 5,
        'teaspoons': 5,
        'tsp': 5,
        'pound': 453.6,
        'pounds': 453.6,
        'lb': 453.6,
        'lbs': 453.6,
        'ounce': 28.35,
        'ounces': 28.35,
        'oz': 28.35,
        'gram': 1,
        'grams': 1,
        'g': 1,
        'kg': 1000,
        'kilogram': 1000,
        'piece': 100, # Default for things like '1 chicken'
        'pieces': 100,
        'clove': 5,
        'cloves': 5,
        'inch': 10,
        'inches': 10
    }

def parse_ingredient_line(line_orig):
    line = line_orig.lower().strip()
    if not line:
        return None
    
    # Remove text in parentheses (often cooking instructions)
    line = re.sub(r'\(.*?\)', '', line).strip()
    
    # Regex to find quantity and unit
    # Matches: "1 1/2", "1/2", "0.5", ".5", "3"
    qty_regex = r'^(\d+\s+\d+/\d+|\d+/\d+|\d*\.\d+|\d+)'
    
    qty = 1.0 # Default
    unit = 'unit'
    item = line
    
    match_qty = re.search(qty_regex, line)
    if match_qty:
        raw_qty = match_qty.group(1).strip()
        # Handle fractions like "1 1/2" or "1/2"
        if '/' in raw_qty:
            try:
                if ' ' in raw_qty:
                    parts = raw_qty.split()
                    whole = float(parts[0])
                    frac_parts = parts[1].split('/')
                    qty = whole + (float(frac_parts[0]) / float(frac_parts[1]))
                else:
                    frac_parts = raw_qty.split('/')
                    qty = float(frac_parts[0]) / float(frac_parts[1])
            except:
                qty = 1.0
        else:
            try:
                qty = float(raw_qty)
            except:
                qty = 1.0
        
        # Remainder of the line after quantity
        remainder = line[len(match_qty.group(0)):].strip()
        
        # Check for unit
        unit_map = get_unit_map()
        found_unit = False
        # Sort units by length descending to match longest first (e.g. 'tablespoons' before 'tablespoon')
        for u in sorted(unit_map.keys(), key=len, reverse=True):
            if remainder.startswith(u + " ") or remainder == u:
                unit = u
                item = remainder[len(u):].strip()
                found_unit = True
                break
        
        if not found_unit:
            item = remainder
            
    # Unit aliases specific to 'gathered' dataset
    if unit == 'unit' and item.startswith('c. '):
        unit = 'cup'
        item = item[3:].strip()
    elif unit == 'unit' and item.startswith('tsp. '):
        unit = 'teaspoon'
        item = item[5:].strip()
    elif unit == 'unit' and item.startswith('tbsp. '):
        unit = 'tablespoon'
        item = item[6:].strip()
    elif unit == 'unit' and item.startswith('pkg. '):
        unit = 'piece'
        item = item[5:].strip()
    elif unit == 'unit' and item.startswith('pt. '):
        unit = 'cup' # Approx 2 cups in a pint
        qty *= 2
        item = item[4:].strip()

    # Clean up item (remove things like "of", "fresh", etc. if they are at the start)
    item = re.sub(r'^(of|fresh|dried|small|large|medium)\s+', '', item).strip()
    # Remove leading punctuation and quotes
    item = re.sub(r'^[\s,.:;\'\"]+', '', item).strip()
    item = re.sub(r'[\'\"]+$', '', item).strip()
    
    # Ignore instructions masked as ingredients (must be exact match or start with these words)
    invalid_keywords = ['peeled', 'quartered', 'cored', 'sliced', 'divided', 'to taste', 'optional']
    if any(item.startswith(kw) for kw in invalid_keywords) or len(item) < 2:
        return None
        
    # Convert to grams
    unit_map = get_unit_map()
    gram_weight = qty * unit_map.get(unit, 100 if unit == 'unit' else 1) # Default 100g for '1 piece'
    
    return {
        "raw": line_orig.strip(),
        "item": item if item else "unknown",
        "qty": round(qty, 2),
        "unit": unit,
        "grams": round(gram_weight, 2)
    }

def process_master_recipe():
    input_path = 'datasets/master/master_recipe_database.csv'
    output_path = 'datasets/master/master_recipe_database.csv'
    
    if not os.path.exists(input_path):
        print(f"❌ File {input_path} tidak ditemukan!")
        return

    print(f"🔬 Memulai parsing mendalam pada {input_path}...")
    df = pd.read_csv(input_path)
    
    structured_data = []
    total_resep = len(df)
    
    import ast
    
    for idx, row in df.iterrows():
        raw_ingredients = str(row['ingredients'])
        source = str(row['source'])
        
        lines = []
        if source == 'gathered':
            # It's a stringified python list
            try:
                # Safely evaluate the string to a list
                lines = ast.literal_eval(raw_ingredients)
            except:
                lines = [raw_ingredients]
        elif source == 'archanaskitchen':
             lines = raw_ingredients.split(', ')
        else:
             # allrecipes uses commas, but they can be inside parenthesis.
             # We split by comma only if it's not inside parenthesis.
             # A simple way for MVP is to remove parenthesis contents FIRST, then split.
             cleaned_raw = re.sub(r'\([^)]*\)', '', raw_ingredients)
             lines = [x.strip() for x in cleaned_raw.split(',') if x.strip()]
            
        parsed_list = []
        for line in lines:
            parsed = parse_ingredient_line(line)
            if parsed:
                parsed_list.append(parsed)
        
        structured_data.append(json.dumps(parsed_list))
        
        if (idx + 1) % 1000 == 0:
            print(f"⏳ Processed {idx + 1}/{total_resep} recipes...")

    df['structured_ingredients'] = structured_data
    
    # Save back
    df.to_csv(output_path, index=False)
    print("="*40)
    print(f"🏆 PARSING SELESAI!")
    print(f"✅ Kolom 'structured_ingredients' telah ditambahkan.")
    print(f"📊 Total Recipes Parsed: {len(df)}")
    print("="*40)

if __name__ == "__main__":
    process_master_recipe()
