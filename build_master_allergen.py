import pandas as pd
import os

def build_master_allergen():
    print("🚀 Memulai proses pembersihan data Alergen...")
    
    # Buat folder master jika belum ada
    master_dir = 'datasets/master'
    if not os.path.exists(master_dir):
        os.makedirs(master_dir)
    
    # 1. Cleaning allergen2 (Data paling kotor)
    df2 = pd.read_csv('datasets/allergen2/food_ingredients_and_allergens.csv')
    # Hapus duplikat
    df2 = df2.drop_duplicates()
    # Hapus baris yang kolom 'Allergens' atau 'Food Product' nya kosong
    df2 = df2.dropna(subset=['Food Product', 'Allergens'])
    # Ambil kolom penting dan rename agar konsisten
    df2_clean = df2[['Food Product', 'Allergens']].rename(columns={
        'Food Product': 'ingredient',
        'Allergens': 'allergens'
    })
    print(f"✅ allergen2 dibersihkan. Sisa baris: {len(df2_clean)}")

    # 2. Cleaning allergen1
    df1 = pd.read_csv('datasets/allergen/FoodData.csv')
    # Isi data kosong dengan 'Uncategorized'
    df1 = df1.fillna('Uncategorized')
    # Ambil kolom penting dan rename
    df1_clean = df1[['Food', 'Allergy']].rename(columns={
        'Food': 'ingredient',
        'Allergy': 'allergens'
    })
    print(f"✅ allergen1 dibersihkan. Sisa baris: {len(df1_clean)}")

    # 3. Loading allergen3 (Data besar, sudah bersih)
    df3 = pd.read_csv('datasets/allergen3/allergies_10k.csv')
    df3_clean = df3[['ingredient', 'allergens']]
    print(f"✅ allergen3 dimuat. Baris: {len(df3_clean)}")

    # 4. Merging Semua Dataset
    master_df = pd.concat([df1_clean, df2_clean, df3_clean], ignore_index=True)
    
    # 5. Final Standardization
    # Kecilkan semua huruf (lowercase) dan hapus spasi berlebih
    master_df['ingredient'] = master_df['ingredient'].astype(str).str.lower().str.strip()
    master_df['allergens'] = master_df['allergens'].astype(str).str.lower().str.strip()
    
    # Hapus duplikat setelah penggabungan (jika ada bahan yang sama di antar file)
    master_df = master_df.drop_duplicates(subset=['ingredient'])
    
    # Simpan ke CSV
    output_path = os.path.join(master_dir, 'master_allergen_dictionary.csv')
    master_df.to_csv(output_path, index=False)
    
    print("="*40)
    print(f"🏆 BERHASIL! Master Allergen Dictionary diciptakan.")
    print(f"📍 Lokasi: {output_path}")
    print(f"📊 Total Database Alergi: {len(master_df)} bahan makanan unik.")
    print("="*40)

if __name__ == "__main__":
    build_master_allergen()
