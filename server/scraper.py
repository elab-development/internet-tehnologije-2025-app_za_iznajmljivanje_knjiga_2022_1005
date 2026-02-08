import requests
import mysql.connector
import time

BAZA = "citaonica"
USER = "root"
PASSWORD = "itehhh"  
HOST = "db"  
PORT = 3306

QUERY = "memorija"
URL = f"https://openlibrary.org/search.json?q={QUERY.replace(' ', '+')}+language:srp&limit=20"

try:
    db = mysql.connector.connect(
        host=HOST,
        user=USER,
        password=PASSWORD,
        database=BAZA,
        port=PORT
    )
    cursor = db.cursor()

    cursor.execute("INSERT IGNORE INTO Kategorijas (id, naziv) VALUES (1, 'Opšta')")
    db.commit()

    response = requests.get(URL)
    if response.status_code == 200:
        podaci = response.json()
        knjige = podaci.get("docs", [])
        
        uvezeno = 0
        for item in knjige:
            naslov = item.get("title")
            autori = item.get("author_name", ["Nepoznat autor"])
            autor = autori[0]
            isbn_list = item.get("isbn", [])
            isbn = isbn_list[0] if isbn_list else f"ISBN-{int(time.time()) + uvezeno}"

            sql = "INSERT INTO Publikacijas (naziv, autor, isbn, stanje, kategorijaId) VALUES (%s, %s, %s, %s, %s)"
            
            try:
                cursor.execute(sql, (naslov, autor, isbn, 10, 1))
                uvezeno += 1
                print(f"{uvezeno}. {naslov}")
            except Exception:
                continue

        db.commit()
        print(f"Uvezeno na srpskom: {uvezeno}")

except Exception as e:
    print(f"Greska: {e}")
finally:
    if 'db' in locals() and db.is_connected():
        cursor.close()
        db.close()