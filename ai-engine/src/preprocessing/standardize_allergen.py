import pandas as pd

def standardize_allergen_format():
    file_path = 'datasets/master/master_allergen_dictionary.csv'
    df = pd.read_csv(file_path)
    def clean(t):
        s = str(t).replace("[", "").replace("]", "").replace("'", "").replace('"', "").strip()
        return "none" if not s or s.lower() == "nan" else s
    df['allergens'] = df['allergens'].apply(clean)
    df.to_csv(file_path, index=False)
    print(f"Standardized {file_path}")

if __name__ == "__main__":
    standardize_allergen_format()
