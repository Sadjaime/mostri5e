""" from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # 🔥 Abilita CORS per tutte le richieste

def fetch_monster_data_from_db():
    conn = sqlite3.connect('./database/monsters.db')
    conn.row_factory = sqlite3.Row  # Facilita l'accesso ai risultati come dizionari
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, type, tags, size, alignment, challenge_rating, armor_class, armor_class_notes, hit_points, hit_points_notes, speed, legendary_actions, source FROM monsters")
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
        cursor.execute("SELECT strength, dexterity, constitution, intelligence, wisdom, charisma, skills, passive_perception, saves, languages, senses FROM abilities WHERE monster_id = ?", (monster_id,))
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
                "skills": abilities_row[6],
                "passive_perception": abilities_row[7],
                "saves": abilities_row[8],
                "languages": abilities_row[9],
                "senses": abilities_row[10]
            }
        ## Recupera Legendary actions
        cursor.execute("SELECT name, content FROM legendary_actions WHERE monster_id = ?", (monster_id,))
        legendary_actions_data = [dict(row) for row in cursor.fetchall()]

        ## Recupera Reactions
        cursor.execute("SELECT name, content FROM reactions WHERE monster_id = ?", (monster_id,))
        reactions_data = [dict(row) for row in cursor.fetchall()]

        # Recupera Resistances
        cursor.execute("SELECT name, content FROM resistances WHERE monster_id = ?", (monster_id,))
        resistances_data = [dict(row) for row in cursor.fetchall()]

        # Recupera Spellcasting
        cursor.execute("SELECT name, content FROM spellcasting WHERE monster_id = ?", (monster_id,))
        spellcasting_data = [dict(row) for row in cursor.fetchall()]

        # Assembla tutti i dati del mostro
        full_monster_data = monster.copy() # Copia i dati base
        full_monster_data["type"] = monster["type"]
        full_monster_data["traits"] = traits_data if traits_data else []  # Assicurati che sia una lista vuota se non ci sono tratti
        full_monster_data["actions"] = actions_data if actions_data else []  # Assicurati che sia una lista vuota se non ci sono azioni
        full_monster_data["abilities"] = abilities_data  # Può essere una lista vuota o un dizionario vuoto
        full_monster_data["legendary_actions"] = legendary_actions_data if legendary_actions_data else []
        full_monster_data["reactions"] = reactions_data if reactions_data else []
        full_monster_data["resistances"] = resistances_data if resistances_data else []
        full_monster_data["spellcasting"] = spellcasting_data if spellcasting_data else []
        all_monsters_data.append(full_monster_data)

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

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
 """
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # 🔥 Abilita CORS per tutte le richieste

def fetch_monster_data_from_db():
    conn = sqlite3.connect('./database/monsters.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Dati base dei mostri
    cursor.execute("""
        SELECT id, name, type, tags, size, alignment, challenge_rating,
               armor_class, armor_class_notes, hit_points, hit_points_notes,
               speed, legendary_actions, source
        FROM monsters
    """)
    monster_base_data = [dict(row) for row in cursor.fetchall()]

    all_monsters_data = []
    for monster in monster_base_data:
        monster_id = monster["id"]

        # Traits
        cursor.execute("SELECT name, content FROM traits WHERE monster_id = ?", (monster_id,))
        traits_data = [dict(row) for row in cursor.fetchall()]

        # Actions
        cursor.execute("SELECT name, content FROM actions WHERE monster_id = ?", (monster_id,))
        actions_data = [dict(row) for row in cursor.fetchall()]

        # Abilities
        cursor.execute("""
            SELECT strength, dexterity, constitution, intelligence, wisdom, charisma,
                   skills, passive_perception, saves, languages, senses
            FROM abilities WHERE monster_id = ?
        """, (monster_id,))
        abilities_row = cursor.fetchone()
        abilities_data = {}
        if abilities_row:
            abilities_data = {
                "strength": abilities_row["strength"],
                "dexterity": abilities_row["dexterity"],
                "constitution": abilities_row["constitution"],
                "intelligence": abilities_row["intelligence"],
                "wisdom": abilities_row["wisdom"],
                "charisma": abilities_row["charisma"],
                "skills": abilities_row["skills"],
                "passive_perception": abilities_row["passive_perception"],
                "saves": abilities_row["saves"],
                "languages": abilities_row["languages"],
                "senses": abilities_row["senses"]
            }

        # Legendary Actions
        cursor.execute("SELECT name, content FROM legendary_actions WHERE monster_id = ?", (monster_id,))
        legendary_actions_data = [dict(row) for row in cursor.fetchall()]

        # Reactions
        cursor.execute("SELECT name, content FROM reactions WHERE monster_id = ?", (monster_id,))
        reactions_data = [dict(row) for row in cursor.fetchall()]

        # Resistances (con i campi corretti)
        cursor.execute("""
            SELECT resistances, resistances_notes, immunities, condition_immunities
            FROM resistances WHERE monster_id = ?
        """, (monster_id,))
        resistances_row = cursor.fetchone()
        resistances_data = {}
        if resistances_row:
            resistances_data = {
                "resistances": resistances_row["resistances"],
                "resistances_notes": resistances_row["resistances_notes"],
                "immunities": resistances_row["immunities"],
                "condition_immunities": resistances_row["condition_immunities"]
            }

        # Spellcasting
        cursor.execute("SELECT name, content FROM spellcasting WHERE monster_id = ?", (monster_id,))
        spellcasting_data = [dict(row) for row in cursor.fetchall()]

        # Composizione finale
        full_monster_data = monster.copy()
        full_monster_data["traits"] = traits_data
        full_monster_data["actions"] = actions_data
        full_monster_data["abilities"] = abilities_data
        full_monster_data["legendary_actions"] = legendary_actions_data
        full_monster_data["reactions"] = reactions_data
        full_monster_data["resistances"] = resistances_data
        full_monster_data["spellcasting"] = spellcasting_data

        all_monsters_data.append(full_monster_data)

    conn.close()
    return all_monsters_data

@app.route('/api/monsters', methods=['GET'])
def get_monsters():
    search_query = request.args.get('search', '').lower()
    gs_query = request.args.get('gs', '').strip()
    type_query = request.args.get('type', '').strip().lower()
    all_monsters = fetch_monster_data_from_db()
    filtered_monsters = [
        monster for monster in all_monsters
        if search_query in monster["name"].lower()
        and (gs_query == "" or str(monster["challenge_rating"]) == gs_query)
        and (type_query == "" or monster["type"].lower() == type_query)
    ]
    return jsonify(filtered_monsters)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/autocomplete')
def autocomplete():
    query = request.args.get('query', '').lower()
    all_monsters = fetch_monster_data_from_db()
    # Return names that match the query (case-insensitive, startswith or contains)
    suggestions = [
        monster["name"] for monster in all_monsters
        if query in monster["name"].lower()
    ][:10]  # Limit to 10 suggestions
    return jsonify(suggestions)

@app.route('/api/types', methods=['GET'])
def get_types():
    conn = sqlite3.connect('./database/monsters.db')
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT type FROM monsters ORDER BY type ASC")
    types = [row[0] for row in cursor.fetchall()]
    conn.close()
    return jsonify(types)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)

