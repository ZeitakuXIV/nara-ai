import pandas as pd
import os

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
    output_path = os.path.join(master_dir, 'master_recipe_database.csv')
    if not os.path.exists(master_dir):
        os.makedirs(master_dir)

    all_recipes = []

    # 1. Processing datasets/recipe/recipes.csv
    recipes_csv_path = 'datasets/recipe/recipes.csv'
    if os.path.exists(recipes_csv_path):
        print(f"📦 Processing {recipes_csv_path}...")
        df1 = pd.read_csv(recipes_csv_path)
        df1_mapped = pd.DataFrame({
            'title': df1['recipe_name'],
            'ingredients': df1['ingredients'],
            'instructions': df1['directions'],
            'source': 'allrecipes',
            'image_url': df1['img_src']
        })
        all_recipes.append(df1_mapped)
    else:
        print(f"⚠️ {recipes_csv_path} is missing.")

    # 2. Processing datasets/recipe/indonesian_recipes.csv
    indo_recipes_path = 'datasets/recipe/indonesian_recipes.csv'
    if os.path.exists(indo_recipes_path):
        print(f"📦 Processing {indo_recipes_path}...")
        df_indo = pd.read_csv(indo_recipes_path)
        df_indo_mapped = pd.DataFrame({
            'title': df_indo['recipe_name'],
            'ingredients': df_indo['ingredients'],
            'instructions': df_indo['directions'],
            'source': 'indonesian_local',
            'image_url': df_indo['img_src']
        })
        all_recipes.append(df_indo_mapped)
    else:
        print(f"⚠️ {indo_recipes_path} is missing.")

    # 2.5. Processing datasets/recipe/Indonesian_Food_Recipes.csv (Cookpad)
    cookpad_recipes_path = 'datasets/recipe/Indonesian_Food_Recipes.csv'
    if os.path.exists(cookpad_recipes_path):
        print(f"📦 Processing {cookpad_recipes_path}...")
        df_cookpad = pd.read_csv(cookpad_recipes_path)
        
        # Convert '--' to ', ' and strip trailing separators
        df_cookpad['Ingredients_clean'] = df_cookpad['Ingredients'].astype(str).str.replace('--', ', ', regex=False)
        df_cookpad['Ingredients_clean'] = df_cookpad['Ingredients_clean'].str.strip(', ')
        
        df_cookpad_mapped = pd.DataFrame({
            'title': df_cookpad['Title'],
            'ingredients': df_cookpad['Ingredients_clean'],
            'instructions': df_cookpad['Steps'],
            'source': 'indonesian_local',
            'image_url': None
        })
        all_recipes.append(df_cookpad_mapped)
    else:
        print(f"⚠️ {cookpad_recipes_path} is missing.")

    # 3. Processing datasets/recipe2/food_recipes.csv
    recipe2_path = 'datasets/recipe2/food_recipes.csv'
    if os.path.exists(recipe2_path):
        print(f"📦 Processing {recipe2_path}...")
        df2 = pd.read_csv(recipe2_path)
        df2['ingredients'] = df2['ingredients'].str.replace('|', ', ', regex=False)
        df2_mapped = pd.DataFrame({
            'title': df2['recipe_title'],
            'ingredients': df2['ingredients'],
            'instructions': df2['instructions'],
            'source': 'archanaskitchen',
            'image_url': None
        })
        all_recipes.append(df2_mapped)
    else:
        print(f"⚠️ {recipe2_path} is missing (gitignored).")

    # 4. Processing datasets/recipe4/dataset/full_dataset.csv
    recipe4_path = 'datasets/recipe4/dataset/full_dataset.csv'
    if os.path.exists(recipe4_path):
        print(f"📦 Processing {recipe4_path} (Sampling 10,000 rows)...")
        df4 = pd.read_csv(recipe4_path, nrows=10000)
        df4_mapped = pd.DataFrame({
            'title': df4['title'],
            'ingredients': df4['ingredients'],
            'instructions': df4['directions'],
            'source': 'gathered',
            'image_url': None
        })
        all_recipes.append(df4_mapped)
    else:
        print(f"⚠️ {recipe4_path} is missing (gitignored).")

    if not all_recipes:
        raise FileNotFoundError("No raw recipe files found to build the Master Recipe Database.")

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
