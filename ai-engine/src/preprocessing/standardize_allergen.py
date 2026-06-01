import pandas as pd

def standardize_allergen_format():
    file_path = 'datasets/master/master_allergen_dictionary.csv'
    print(f"🧹 Merapikan format di {file_path}...")
    
    df = pd.read_csv(file_path)

    # Fungsi untuk membersihkan karakter [ ] ' "
    def clean_allergen_text(text):
        text = str(text)
        # Hapus karakter list python
        for char in ["[", "]", "'", '"']:
            text = text.replace(char, "")
        text = text.strip()
        
        # Jika kosong (tadinya []), ubah jadi 'none'
        if text == "" or text.lower() == "nan":
            return "none"
        return text

    df['allergens'] = df['allergens'].apply(clean_allergen_text)
    
    # Simpan kembali
    df.to_csv(file_path, index=False)
    print("✨ Selesai! Format sekarang konsisten (teks murni).")
    print("Contoh: '[]' telah berubah menjadi 'none'.")

if __name__ == "__main__":
    standardize_allergen_format()
