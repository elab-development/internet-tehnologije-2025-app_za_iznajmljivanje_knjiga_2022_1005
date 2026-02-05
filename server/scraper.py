import requests
import mysql.connector
import time

BAZA = "citaonica"

QUERY = "informacioni sistemi"
URL = f"https://www.googleapis.com/books/v1/volumes?q={QUERY}&langRestrict=sr&printType=books&maxResults=20"

try:
    db = mysql.connector.connect(host="localhost", user="root", password="", database=BAZA)
    cursor = db.cursor()

    print(f"Pretražujem bazu stručne literature (Tema: {QUERY})...")
    response = requests.get(URL)
    podaci = response.json()

    uvezeno = 0
    if "items" in podaci:
        for item in podaci["items"]:
            info = item.get("volumeInfo", {})
            naslov = info.get("title")
            autori = info.get("authors", ["Katedra za IT"])
            autor = autori[0]
            
            
            identifikatori = info.get("industryIdentifiers", [])
            isbn = identifikatori[0].get("identifier") if identifikatori else f"ISBN-{int(time.time()) + uvezeno}"

            
            if naslov and len(naslov) > 5:
                sql = """INSERT INTO publikacijas (naziv, autor, isbn, stanje, createdAt, updatedAt) 
                         VALUES (%s, %s, %s, %s, NOW(), NOW())"""
                cursor.execute(sql, (naslov, autor, isbn, 15))
                uvezeno += 1
                print(f"{uvezeno}. DODATA KNJIGA: {naslov} ({autor})")

    db.commit()
    print(f"\n dopunjena sa {uvezeno} novih knjiga.")

except Exception as e:
    print(f"Greška: {e}")
finally:
    if 'db' in locals() and db.is_connected():
        cursor.close()
        db.close()