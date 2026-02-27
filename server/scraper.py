import requests
import mysql.connector
import time
from urllib.parse import urlparse
import os


db_url = os.getenv('DATABASE_URL')

if db_url:
   
    url = urlparse(db_url)
   
    DB_CONFIG = {
        'host': url.hostname,
        'user': url.username,
        'password': url.password,
        'database': url.path[1:],
        'port': url.port
    }
else:
  
    db = mysql.connector.connect(
        host="db",
        user="root",
        password="itehhh",
        database="citaonica"
    )

def dovuci_knjige():
    try:
        db = mysql.connector.connect(**DB_CONFIG)
        cursor = db.cursor()
        
        
        queries = [
            'univerzitet', 'fakultet', 'udžbenik', 'skripta', 
            'nauka', 'ekonomija', 'pravo', 'inženjerstvo', 
         'programiranje', 'matematika', 'fizika', 'hemija',
        ]
        
        total_uvezeno = 0

        for query in queries:
            print(f"pretraga za: {query}...")
            
           
            api_url = f"https://openlibrary.org/search.json?q={query}+language:srp&limit=40"
            
            try:
                response = requests.get(api_url)
                data = response.json()

                if 'docs' not in data or not data['docs']:
                    print(f"Nema rez{query}")
                    continue

                for item in data.get('docs', []):
                    try:
                        jezici = item.get('language', [])
                        if not any(lang in ['srp', 'scr', 'baq'] for lang in jezici):
                            
                            continue
                        naslov = item.get('title')
                        
                        common_english_words = [' the ', ' and ', ' of ', ' volume ']
                        if any(word in naslov.lower() for word in common_english_words):
                            continue
                       
                        autori_list = item.get('author_name', ["Nepoznat autor"])
                        autori = ", ".join(autori_list)
                  
                        isbn = "Nepoznato"
                        isbns = item.get('isbn', [])
                        if isbns:
                            isbn = isbns[0]
                        else:
                 
                            isbn = item.get('key', '').split('/')[-1]

                        cover_id = item.get('cover_i')
                        if cover_id:
                            slika_url = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
                        else:
                            
                            continue
                      
                       
                        cursor.execute("SELECT id FROM Publikacijas WHERE isbn = %s OR naziv = %s", (isbn, naslov))
                        if cursor.fetchone():
                            continue

                       
                        sql = "INSERT INTO Publikacijas (naziv, autor, isbn, stanje, slika_url) VALUES (%s, %s, %s, %s, %s)"
                        cursor.execute(sql, (naslov, autori, isbn, 10, slika_url))
                        db.commit()
                        
                        print(f" uvezeno: {naslov}")
                        total_uvezeno += 1

                    except Exception as e:
                        print(f"Greška pri uvozu knjige {item.get('title', 'Nepoznato')}: {e}")
                        continue
                
                time.sleep(1) 

            except Exception as e:
                print(f"Gr {query}: {e}")

        print(f"\nkatalog je dopunjen  {total_uvezeno} novih knj")

    except Exception as e:
        print(f"greskaa {e}")
    finally:
        if 'db' in locals() and db.is_connected():
            cursor.close()
            db.close()

if __name__ == "__main__":
    dovuci_knjige()