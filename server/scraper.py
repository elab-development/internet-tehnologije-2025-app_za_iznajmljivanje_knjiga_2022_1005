import requests
from bs4 import BeautifulSoup
import mysql.connector
import time


BAZA = "citaonica"
USER = "user2"
PASSWORD = "iteh2"  
HOST = "127.0.0.1"  
PORT = 3306

QUERY = "cetvrti-razred-srednje-skole-oblast-88-grupa-120"

URL = f"https://www.korisnaknjiga.com/{QUERY}"

try:
    db = mysql.connector.connect(
        host=HOST, user=USER, password=PASSWORD, database=BAZA, port=PORT
    )
    cursor = db.cursor()
    
    cursor.execute("INSERT IGNORE INTO Kategorijas (id, naziv) VALUES (1, 'Opšta')")
    db.commit()
    brojac=0
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(URL, headers=headers)
    print(response.status_code)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        book_items = [a.parent.parent for a in soup.select('.Snaslov')]
        print(f"Pronađeno elemenata: {len(book_items)}")
        uvezeno = 0
        for item in book_items:
            if brojac % 2 ==0:
                try:
                    naslov_tag = item.select_one('.Snaslov')
                    if not naslov_tag:
                        continue
                    naslov = naslov_tag.get_text(strip=True)

                    a_tag = item.find_parent('a') or item.select_one('a')
                    
                

                    if not a_tag:
                        print(f"Preskačem '{naslov}' jer link nije pronađen.")
                        continue

                    link_knjige = f"https://www.korisnaknjiga.com/{a_tag['href']}"

                    autor_tag = item.select_one('.Spisac')
                    autor = autor_tag.get_text(strip=True) if autor_tag else "Nepoznat autor"

                    print(f"Pristupam stranici: {naslov}...")
                    time.sleep(1) 
                    
                    detalji_resp = requests.get(link_knjige, headers=headers)
                    detalji_soup = BeautifulSoup(detalji_resp.text, 'html.parser')
                    
            
                    isbn_tag = detalji_soup.find('p', attrs={"title": "ISBN"})
                    
                    if isbn_tag:
                        isbn = isbn_tag.get_text(strip=True)
                    else:
                        
                        isbn = f"neuspelo"

                
                    sql = "INSERT INTO Publikacijas (naziv, autor, isbn, stanje, kategorijaId) VALUES (%s, %s, %s, %s, %s)"
                    cursor.execute(sql, (naslov, autor, isbn, 10, 1))
                    db.commit()
                    
                    uvezeno += 1
                    print(f"Uvezeno: {naslov} | ISBN: {isbn}")

                except Exception as e:
                    
                    trenutni_naslov = locals().get('naslov', 'Nepoznata knjiga')
                    print(f"Greška kod '{trenutni_naslov}': {e}")
                    continue
            brojac+=1

        db.commit()
       
        print(f"\nUvezeno sa Korisne Knjige: {uvezeno}")

except Exception as e:
    print(f"Greska: {e}")
finally:
    if 'db' in locals() and db.is_connected():
        cursor.close()
        db.close()




