import requests
import pandas as pd
import os


def scrape_panganku():
    print("--- MEMULAI PROSES ---")
    url = "https://www.panganku.org/id-ID/semua_nutrisi/get_data"
    params = {"draw": 1, "start": 0, "length": -1}
    headers = {"User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest"}

    try:
        print(f"Sedang mencoba menghubungi: {url} ...")
        response = requests.get(url, params=params, headers=headers, timeout=10)

        if response.status_code == 200:
            print("Koneksi Berhasil! Sedang memproses data...")
            data_json = response.json()
            raw_data = data_json.get('data', [])

            df = pd.DataFrame(raw_data)
            output_file = "pangan_lokal.csv"
            df.to_csv(output_file, index=False)
            print(f"SUKSES! File tersimpan di: {os.path.abspath(output_file)}")
        else:
            print(f"GAGAL: Server merespon dengan status {response.status_code}")
            print("Saran: Website ini mungkin memblokir akses otomatis. Gunakan dataset Kaggle.")

    except Exception as e:
        print(f"ERROR TERJADI: {e}")


if __name__ == "__main__":
    scrape_panganku()
