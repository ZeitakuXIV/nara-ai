import pandas as pd
import os

def build_master_nutrition():
    print("🚀 Memulai pembangunan Master Nutrition Database...")
    
    master_dir = 'datasets/master'
    output_path = os.path.join(master_dir, 'master_nutrition_database.csv')
    if not os.path.exists(master_dir):
        os.makedirs(master_dir)

    # 1. Menggabungkan 5 Group Nutrition Data (Data Detail)
    group_files = [
        'datasets/nutrition/FINAL FOOD DATASET/FOOD-DATA-GROUP1.csv',
        'datasets/nutrition/FINAL FOOD DATASET/FOOD-DATA-GROUP2.csv',
        'datasets/nutrition/FINAL FOOD DATASET/FOOD-DATA-GROUP3.csv',
        'datasets/nutrition/FINAL FOOD DATASET/FOOD-DATA-GROUP4.csv',
        'datasets/nutrition/FINAL FOOD DATASET/FOOD-DATA-GROUP5.csv'
    ]
    
    missing_files = [f for f in group_files if not os.path.exists(f)]
    if missing_files:
        if os.path.exists(output_path):
            print(f"⚠️ Raw group files {missing_files} are missing (gitignored).")
            print(f"   Since the compiled database already exists at {output_path}, skipping generation.")
            print("="*40)
            return
        else:
            raise FileNotFoundError(f"Missing required raw files: {missing_files} and no pre-compiled master database exists.")
    
    group_list = []
    for f in group_files:
        temp_df = pd.read_csv(f)
        # Hapus kolom indeks sampah jika ada
        cols_to_drop = [c for c in temp_df.columns if 'Unnamed' in c]
        temp_df = temp_df.drop(columns=cols_to_drop)
        group_list.append(temp_df)
    
    df_groups = pd.concat(group_list, ignore_index=True)
    print(f"✅ 5 Group digabung. Total: {len(df_groups)} baris.")

    # 2. Memproses Data Nutrisi Lokal (datasets/recipe/nutrition.csv)
    df_local = pd.read_csv('datasets/recipe/nutrition.csv')
    
    # Mapping header agar cocok dengan data Group
    mapping = {
        'name': 'food',
        'calories': 'Caloric Value',
        'proteins': 'Protein',
        'fat': 'Fat',
        'carbohydrate': 'Carbohydrates'
    }
    df_local = df_local.rename(columns=mapping)
    
    # Ambil kolom yang kita butuhkan saja
    df_local = df_local[['food', 'Caloric Value', 'Protein', 'Fat', 'Carbohydrates', 'image']]
    print(f"✅ Data Lokal (Indonesian Food) dimuat. Total: {len(df_local)} baris.")

    # 3. Merging (Outer Join agar semua kolom dari Group tetap ada)
    # Tambahkan penanda sumber agar kita bisa membedakan penanganan data kosong
    df_groups['source'] = 'group'
    df_local['source'] = 'local'
    
    master_df = pd.concat([df_groups, df_local], ignore_index=True)
    
    # 4. Data Cleaning
    # Hapus baris yang nama makanannya kosong
    master_df = master_df.dropna(subset=['food'])
    
    # Identifikasi kolom nutrisi mikro (semua kecuali kolom kunci dan makro)
    key_cols = ['food', 'Caloric Value', 'Protein', 'Fat', 'Carbohydrates', 'image', 'source']
    micro_cols = [c for c in master_df.columns if c not in key_cols]
    
    # KHUSUS DATA LOKAL: Isi nutrisi mikro dengan -1 (artinya: Data Tidak Tersedia)
    # Bukan 0 (artinya: Nutrisi memang tidak ada)
    master_df.loc[master_df['source'] == 'local', micro_cols] = -1
    
    # Hapus Duplikat berdasarkan nama makanan
    # Kita prioritaskan baris yang punya data gizi lebih lengkap (source == 'group')
    master_df = master_df.sort_values(by=['source', 'Vitamin A'], ascending=[True, False])
    master_df = master_df.drop_duplicates(subset=['food'], keep='first')
    
    # Standardisasi Teks
    master_df['food'] = master_df['food'].astype(str).str.lower().str.strip()
    
    # Hapus kolom penanda source sebelum simpan
    master_df = master_df.drop(columns=['source'])
    
    # Pastikan angka nutrisi makro (non -1) tidak ada yang negatif
    numeric_cols = master_df.select_dtypes(include=['number']).columns
    # Kita hanya clip yang bukan -1
    for col in numeric_cols:
        master_df.loc[master_df[col] > -1, col] = master_df[col].clip(lower=0)
    
    # Isi missing values sisa (jika ada) dengan 0
    master_df = master_df.fillna(0)

    # 5. Final Export
    output_path = os.path.join(master_dir, 'master_nutrition_database.csv')
    master_df.to_csv(output_path, index=False)
    
    print("="*40)
    print(f"🏆 MASTER NUTRITION DATABASE SELESAI!")
    print(f"📍 Lokasi: {output_path}")
    print(f"📊 Total Database: {len(master_df)} bahan makanan unik.")
    print(f"🧪 Siap digunakan untuk algoritma CSP & Nutrition Scaling.")
    print("="*40)

if __name__ == "__main__":
    build_master_nutrition()
