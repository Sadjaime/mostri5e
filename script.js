<script>
        document.addEventListener("DOMContentLoaded", function() {
            const searchInput = document.getElementById("searchInput");
            const crFilter = document.getElementById("crFilter");
            const monsterContainer = document.getElementById("monsterContainer");
            

            function fetchMonsters() {
                const query = searchInput.value;
                const selectedCR = crFilter.value; // Ottiene il valore selezionato
                fetch(`https://mostri5e-production.up.railway.app/api/monsters?search=${query}`)
                    .then(response => response.json())
                    .then(data => {
                        monsterContainer.innerHTML = "";
                        // Filtra i mostri in base al CR selezionato
                        const filteredMonsters = data.filter(monster => 
                            selectedCR === "" || monster.challenge_rating == selectedCR
                        );

                        filteredMonsters.forEach(monster => {
                            const monsterClass = monster.type && monster.type.toLowerCase().includes("beast") ? "beast" : "huge";
                            const monsterCard = `<div class="col-md-4">
                                <div class="card mb-3 ${monsterClass}">
                                    <div class="card-body">
                                        <h5 class="card-title">${monster.name}</h5>
                                        <p class="card-text creature-subtitle"><span class="text-highlight">Tipo:</span> ${monster.type}</p>
                                        <p class="card-text"><span class="text-highlight">GS:</span> ${monster.challenge_rating}</p>
                                        <div class="stats-container">                
                                            <div class="stat-line"><dt>Armor Class:<dt>Classe Armatura</dt><dd> ${monster.armor_class}</dd>
                                                </div>
                                            <div class="stat-line"><dt>Punti Ferita:</dt> <dd>${monster.hit_points}</dd>
                                                </div>
                                            <div class="stat-line"><dt>Velocità:</dt> <dd>${monster.speed}</dd>
                                        </div>
                                        <div class="ability-scores">
                                            <div class="ability-header">
                                                <span>FOR</span>  
                                                <span>DES</span>  
                                                <span >COS</span>  
                                                <span>INT</span>  
                                                <span>SAG</span>  
                                                <span>CAR</span>
                                            </div>
                                            <div class="ability-values">
                                                <span>${monster.abilities["STR"]}</span>
                                                <span>${monster.abilities["DEX"]}</span>
                                                <span>${monster.abilities["CON"]}</span>
                                                <span>${monster.abilities["INT"]}</span>
                                                <span>${monster.abilities["WIS"]}</span>
                                                <span>${monster.abilities["CHA"]}</span>
                                            </div>
                                        </div>
                                        <div class="traits-section">
                                            <h3>Tratti</h3> 
                                            <div class="trait">${monster.traits.map(trait => `<strong>${trait.name}:</strong> ${trait.content}`).join("<br>")}</div>
                                        </div>
                                        <div class="actions-section">
                                            <h3>Azioni</h3> 
                                            <div class="action">${monster.actions.map(action => `<strong>${action.name}:</strong> ${action.content}`).join("<br>")}</div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                            monsterContainer.innerHTML += monsterCard;
                        });
                    });
            }

            // Ricarica i mostri ogni volta che cambia il filtro o la ricerca
            searchInput.addEventListener("input", fetchMonsters);
            crFilter.addEventListener("change", fetchMonsters);

            fetchMonsters();
        });
    </script>
