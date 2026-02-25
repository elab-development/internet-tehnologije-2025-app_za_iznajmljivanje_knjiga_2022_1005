import requests
import mysql.connector
import time

# Host je "db" za Docker
DB_CONFIG = {
    "host": "db", 
    "user": "root",
    "password": "itehhh",
    "database": "citaonica",
    "port": 3306 
}

def fetch_more_serbian_books():
    try:
        db = mysql.connector.connect(**DB_CONFIG)
        cursor = db.cursor()
        
        # Proširena lista pojmova na srpskom (opšte teme)
        queries = [
            'književnost', 'istorija', 'psihologija', 
            'nauka', 'beograd', 'filozofija', 
            'umetnost', 'zbirka', 'roman'
        ]
        
        total_uvezeno = 0

        for query in queries:
            print(f"Pretražujem Google Books za: {query}...")
            # Povećan maxResults na 20 po svakom pojmu
            api_url = f"https://www.googleapis.com/books/v1/volumes?q={query}&langRestrict=sr&maxResults=20"
            
            try:
                response = requests.get(api_url)
                data = response.json()

                if 'items' not in data:
                    print(f"Nema rezultata za: {query}")
                    continue

                for item in data.get('items', []):
                    try:
                        volume_info = item.get('volumeInfo', {})
                        naslov = volume_info.get('title')
                        
                        # Autori
                        autori_list = volume_info.get('authors', ["Nepoznat autor"])
                        autori = ", ".join(autori_list)
                        
                        # ISBN
                        isbn = "Nepoznato"
                        identifiers = volume_info.get('industryIdentifiers', [])
                        for identifier in identifiers:
                            if identifier['type'] in ['ISBN_13', 'ISBN_10']:
                                isbn = identifier['identifier']
                                break
                        
                        # Ako nema ISBN, uzimamo Google ID da ne bi preskakali knjige
                        if isbn == "Nepoznato":
                            isbn = item.get('id')

                        # Slika
                        slika_url = volume_info.get('imageLinks', {}).get('thumbnail')
                        if slika_url:
                            slika_url = slika_url.replace("http://", "https://")
                        else:
                            # Preskačemo knjige bez slike jer ti trebaju za katalog
                            continue

                        # Provera duplikata
                        cursor.execute("SELECT id FROM Publikacijas WHERE isbn = %s OR naziv = %s", (isbn, naslov))
                        if cursor.fetchone():
                            continue

                        # INSERT
                        sql = "INSERT INTO Publikacijas (naziv, autor, isbn, stanje, slika_url) VALUES (%s, %s, %s, %s, %s)"
                        cursor.execute(sql, (naslov, autori, isbn, 10, slika_url))
                        db.commit()
                        
                        print(f"✅ Uvezeno: {naslov}")
                        total_uvezeno += 1

                    except Exception as e:
                        continue
                
                time.sleep(1) # Pauza da ne preopteretimo API

            except Exception as e:
                print(f"Greška pri pretrazi za {query}: {e}")

        print(f"\nUspeh! Katalog je dopunjen sa ukupno {total_uvezeno} novih knjiga na srpskom.")

    except Exception as e:
        print(f"Glavna greška: {e}")
    finally:
        if 'db' in locals() and db.is_connected():
            cursor.close()
            db.close()

if __name__ == "__main__":
    fetch_more_serbian_books()