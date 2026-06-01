import json

def convert_json_to_md():
    with open('eda_results.json', 'r') as f:
        data = json.load(f)

    with open('FULL_EDA_REPORT.md', 'w', encoding='utf-8') as f:
        f.write('# 📊 FULL EDA REPORT\n\n')
        f.write('Laporan ini berisi detail teknis lengkap untuk seluruh 26 file yang dianalisis.\n\n')
        
        for item in data:
            f.write(f'## 📄 File: {item["file_path"]}\n\n')
            f.write('| Kategori | Detail |\n')
            f.write('| :--- | :--- |\n')
            f.write(f'| **Jumlah Baris** | {item["rows"]} |\n')
            f.write(f'| **Jumlah Kolom** | {item["cols"]} |\n')
            f.write(f'| **Total Missing (Null)** | {item["null_total"]} |\n')
            f.write(f'| **Baris Duplikat** | {item["duplicate_rows"]} |\n\n')
            
            f.write("### 📋 Daftar Kolom:\n")
            f.write(", ".join([f"`{c}`" for c in item['columns']]) + "\n\n")
            
            if item['numeric_stats']:
                f.write("### 🔢 Statistik Numerik (Ringkasan):\n")
                f.write("| Kolom | Mean | Min | Max |\n")
                f.write("| :--- | :--- | :--- | :--- |\n")
                # Limit columns to top 10 for readability if there are too many
                count = 0
                for col, stats in item['numeric_stats'].items():
                    if count > 10: 
                        f.write("| ... | ... | ... | ... |\n")
                        break
                    mean = round(stats.get('mean', 0), 2)
                    min_val = round(stats.get('min', 0), 2)
                    max_val = round(stats.get('max', 0), 2)
                    f.write(f'| {col} | {mean} | {min_val} | {max_val} |\n')
                    count += 1
            
            f.write('\n---\n\n')

    print('Berhasil membuat FULL_EDA_REPORT.md')

if __name__ == "__main__":
    convert_json_to_md()
