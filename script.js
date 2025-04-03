import { API_BASE_URL } from './config.js';
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    const crFilter = document.getElementById("crFilter");
    const monsterContainer = document.getElementById("monsterContainer");
    const autocompleteList = document.createElement("ul");
    autocompleteList.id = "autocompleteList";
    searchInput.parentNode.appendChild(autocompleteList);

    // Autocomplete styling (add to your CSS)
    autocompleteList.style.position = "absolute";
    autocompleteList.style.zIndex = "5";
    autocompleteList.style.backgroundColor = "white";
    autocompleteList.style.width = `${searchInput.offsetWidth}px`;
    autocompleteList.style.border = "1px solid #ced4da";
    autocompleteList.style.borderRadius = "0.375rem";
    autocompleteList.style.boxShadow = "0 0.5rem 1rem rgba(0, 0, 0, 0.15)";
    autocompleteList.style.display = "none";
    //autocompleteList.style.paddingLeft = "5px";

    let timeoutId;
    
    function fetchAutocomplete(query) {
        if (!query) {
            autocompleteList.style.display = "none";
            return;
        }
        
        fetch(`${API_BASE_URL}/autocomplete?query=${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((suggestions) => {
                autocompleteList.innerHTML = "";
                if (suggestions.length > 0) {
                    autocompleteList.style.display = "block";
                    suggestions.forEach((suggestion) => {
                        const li = document.createElement("li");
                        li.textContent = suggestion;
                        li.style.padding = "8px";
                        //li.style.cursor = "none";
                        // Inside fetchAutocomplete()
                        li.addEventListener("click", () => {
                            searchInput.value = suggestion;
                            autocompleteList.style.display = "none";
                            
                            // 🔥 Reset the GS filter to "Tutti" (all)
                            crFilter.value = "";
                            
                            // Fetch monsters (now with the filter reset)
                            fetchMonsters();
                        });
                        autocompleteList.appendChild(li);
                    });
                } else {
                    autocompleteList.style.display = "none";
                }
            });
    }

    function fetchMonsters() {
        const query = searchInput.value.trim();
        const selectedCR = crFilter.value; // Will be "" after autocomplete selection
        
        fetch(`${API_BASE_URL}/monsters?search=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                // Filter monsters (now with reset GS)
                const filteredMonsters = data.filter(monster => 
                    selectedCR === "" || monster.challenge_rating == selectedCR
                );
                renderMonsters(filteredMonsters);
            });
    }

    // Event Listeners
    searchInput.addEventListener("input", (e) => {
        clearTimeout(timeoutId);
        const query = e.target.value.trim();
        timeoutId = setTimeout(() => fetchAutocomplete(query), 300);
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            autocompleteList.style.display = "none";
            fetchMonsters();
        }
    });

    crFilter.addEventListener("change", fetchMonsters);

    // Close autocomplete when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            autocompleteList.style.display = "none";
        }
    });

    // Render monsters to the page
    function renderMonsters(monsters) {
        monsterContainer.innerHTML = "";
        monsters.forEach(monster => {
            const monsterClass = monster.type && monster.type.toLowerCase().includes("beast") ? "beast" : "huge";
            const monsterCard = `
                <div class="col-md-4">
                    <div class="card mb-3 ${monsterClass}">
                        <div class="card-body">
                            <p class="source-material">${monster.source || ""}</p>
                            <h5 class="card-title">${monster.name}</h5>
                            <p class="card-text creature-subtitle"><span class="text-highlight">Tipo</span> ${monster.type}</p>
                            <p class="card-text"><span class="text-highlight">GS</span> ${monster.challenge_rating}</p>
                            <div class="stats-container">                
                                <div class="stat-line"><dt>Classe Armatura</dt><dd> ${monster.armor_class}</dd></div>
                                <div class="stat-line"><dt>Punti Ferita</dt> <dd>${monster.hit_points}</dd></div>
                                <div class="stat-line"><dt>Velocità</dt> <dd>${monster.speed}</dd></div>
                            </div>
                            <div class="ability-scores">
                                <div class="ability-header">
                                    <span>FOR</span>  
                                    <span>DES</span>  
                                    <span>COS</span>  
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
                                <div class="trait">${monster.traits.map(trait => `<strong>${trait.name}</strong> ${trait.content}`).join("<br><br>")}</div>
                            </div>
                            <div class="actions-section">
                                <h3>Azioni</h3> 
                                <div class="action">${monster.actions.map(action => `<strong>${action.name}</strong> ${action.content}`).join("<br><br>")}</div>
                            </div>
                        </div>
                    </div>
                </div>`;
            monsterContainer.innerHTML += monsterCard;
        });
    }
});
