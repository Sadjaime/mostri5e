from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from flask_compress import Compress

app = Flask(__name__)
CORS(app)  # 🔥 Abilita CORS per tutte le richieste
Compress(app)
def fetch_monster_data_from_db():
    try:
        conn = sqlite3.connect('./database/monsters.db')
        conn.row_factory = sqlite3.Row  # Facilita l'accesso ai risultati come dizionari
        cursor = conn.cursor()

        cursor.execute("SELECT id, name, type, challenge_rating, armor_class, armor_class_notes, hit_points, hit_points_notes, speed, source FROM monsters")
        monster_base_data = [dict(row) for row in cursor.fetchall()] # Converti Row objects in dicts

        all_monsters_data = []
        for monster in monster_base_data:
            monster_id = monster["id"]

            # Recupera Traits
            cursor.execute("SELECT name, content FROM traits WHERE monster_id = ?", (monster_id,))
            traits_data = [dict(row) for row in cursor.fetchall()]

            # Recupera Actions
            cursor.execute("SELECT name, content FROM actions WHERE monster_id = ?", (monster_id,))
            actions_data = [dict(row) for row in cursor.fetchall()]

            # Recupera Abilities
            cursor.execute("SELECT strength, dexterity, constitution, intelligence, wisdom, charisma FROM abilities WHERE monster_id = ?", (monster_id,))
            abilities_row = cursor.fetchone() # Expecting only one row per monster for abilities
            abilities_data = {} # Initialize as dictionary
            if abilities_row: # Check if abilities data exists for the monster
                abilities_data = {
                    "STR": abilities_row[0],
                    "DEX": abilities_row[1],
                    "CON": abilities_row[2],
                    "INT": abilities_row[3],
                    "WIS": abilities_row[4],
                    "CHA": abilities_row[5],
                }

            # Assembla tutti i dati del mostro
            full_monster_data = monster.copy() # Copia i dati base
            full_monster_data["type"] = monster["type"]
            full_monster_data["traits"] = traits_data if traits_data else []  # Assicurati che sia una lista vuota se non ci sono tratti
            full_monster_data["actions"] = actions_data if actions_data else []  # Assicurati che sia una lista vuota se non ci sono azioni
            full_monster_data["abilities"] = abilities_data  # Può essere una lista vuota o un dizionario vuoto
            all_monsters_data.append(full_monster_data)

    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
    return all_monsters_data

@app.route('/api/monsters', methods=['GET'])
def get_monsters():
    search_query = request.args.get('search', '').lower()
    all_monsters = fetch_monster_data_from_db() # Usa la funzione aggiornata
    filtered_monsters = [
        monster for monster in all_monsters
        if search_query in monster["name"].lower()
    ]
    return jsonify(filtered_monsters)
@app.route('/api/autocomplete', methods=['GET'])
def autocomplete():
    search_query = request.args.get('query', '').lower()
    limit = int(request.args.get('limit', 10))  # Limita il numero di risultati

    conn = sqlite3.connect('./database/monsters.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute(
        "SELECT name FROM monsters WHERE name LIKE ? LIMIT ?", (f"%{search_query}%", limit)
    )
    results = [row['name'] for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)
