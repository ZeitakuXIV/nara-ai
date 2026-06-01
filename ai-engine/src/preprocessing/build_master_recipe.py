import pandas as pd
import os
import re

def clean_text_fractions(text):
    if not isinstance(text, str):
        return text
    # Map common encoding artifacts to decimals or clean text
    replacements = {
        'Â½': '0.5',
        '½': '0.5',
        'Â¼': '0.25',
        '¼': '0.25',
        'Â¾': '0.75',
        '¾': '0.75',
        'â…“': '0.33',
        'â…”': '0.66',
        'â…›': '0.125'
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text

def build_master_recipe():
    print("🚀 Memulai pembangunan Master Recipe Database...")
    master_dir = 'datasets/master'
    if not os.path.exists(master_dir):
        os.makedirs(master_dir)

    all_recipes = []

    # 1. Processing datasets/recipe/recipes.csv
    print("📦 Processing recipe/recipes.csv...")
    df1 = pd.read_csv('datasets/recipe/recipes.csv')
    df1_mapped = pd.DataFrame({
        'title': df1['recipe_name'],
        'ingredients': df1['ingredients'],
        'instructions': df1['directions'],
        'source': 'allrecipes',
        'image_url': df1['img_src']
    })
    all_recipes.append(df1_mapped)

    # 2. Processing datasets/recipe2/food_recipes.csv
    print("📦 Processing recipe2/food_recipes.csv...")
    df2 = pd.read_csv('datasets/recipe2/food_recipes.csv')
    # Convert '|' separated ingredients to comma separated for consistency
    df2['ingredients'] = df2['ingredients'].str.replace('|', ', ', regex=False)
    df2_mapped = pd.DataFrame({
        'title': df2['recipe_title'],
        'ingredients': df2['ingredients'],
        'instructions': df2['instructions'],
        'source': 'archanaskitchen',
        'image_url': None
    })
    all_recipes.append(df2_mapped)

    # 3. Processing datasets/recipe4/dataset/full_dataset.csv (Sampling to avoid memory issues)
    print("📦 Processing recipe4 (Sampling 10,000 rows)...")
    # Reading first 10k rows of the 2.1GB file
    df4 = pd.read_csv('datasets/recipe4/dataset/full_dataset.csv', nrows=10000)
    # The 'ingredients' and 'directions' in recipe4 are stringified lists
    df4_mapped = pd.DataFrame({
        'title': df4['title'],
        'ingredients': df4['ingredients'],
        'instructions': df4['directions'],
        'source': 'gathered',
        'image_url': None
    })
    all_recipes.append(df4_mapped)

    # Combine all
    master_df = pd.concat(all_recipes, ignore_index=True)

    # 4. Final Cleaning
    print("🧹 Finalizing data cleaning...")
    master_df = master_df.dropna(subset=['title', 'ingredients', 'instructions'])
    
    # Apply fraction cleaning
    master_df['ingredients'] = master_df['ingredients'].apply(clean_text_fractions)
    master_df['instructions'] = master_df['instructions'].apply(clean_text_fractions)
    
    # Standardize casing for titles
    master_df['title'] = master_df['title'].str.strip()
    
    # Deduplicate by title
    initial_count = len(master_df)
    master_df = master_df.drop_duplicates(subset=['title'], keep='first')
    print(f"✨ Removed {initial_count - len(master_df)} duplicates.")

    # 5. Save
    output_path = os.path.join(master_dir, 'master_recipe_database.csv')
    master_df.to_csv(output_path, index=False)
    
    print("="*40)
    print(f"🏆 MASTER RECIPE DATABASE SELESAI!")
    print(f"📍 Lokasi: {output_path}")
    print(f"📊 Total Recipes: {len(master_df)}")
    print("="*40)

if __name__ == "__main__":
    build_master_recipe()
