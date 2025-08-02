import { API_BASE_URL } from '/static/config.js';
function populateTypeFilter() {
    fetch(`${API_BASE_URL}/types`)
        .then(response => response.json())
        .then(types => {
            const typeFilter = document.getElementById("typeFilter");
            typeFilter.innerHTML = '<option value="">Tutti</option>';
            types.sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' })); // Sort alphabetically, Italian locale
            types.forEach(type => {
                const option = document.createElement("option");
                option.value = type;
                option.textContent = type;
                typeFilter.appendChild(option);
            });
        });
}

document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    const crFilter = document.getElementById("crFilter");
    const monsterContainer = document.getElementById("monsterContainer");
    const autocompleteList = document.createElement("ul");
    autocompleteList.id = "autocompleteList";
    searchInput.parentNode.appendChild(autocompleteList);
    populateTypeFilter();
    // Autocomplete styling (add to your CSS)
    /* autocompleteList.style.position = "absolute";
    autocompleteList.style.zIndex = "5";
    autocompleteList.style.backgroundColor = "white";
    autocompleteList.style.width = `${searchInput.offsetWidth}px`;
    autocompleteList.style.border = "1px solid #ced4da";
    autocompleteList.style.borderRadius = "0.375rem";
    autocompleteList.style.boxShadow = "0 0.5rem 1rem rgba(0, 0, 0, 0.15)";
    autocompleteList.style.display = "none";*/
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

    function showLoader() {
    document.getElementById("loader").style.display = "block";
    }
    function hideLoader() {
        document.getElementById("loader").style.display = "none";
    }
    // Fetch monsters based on search input and filters
    function fetchMonsters() {
        showLoader();
        const query = searchInput.value.trim();
        const selectedCR = crFilter.value; // Will be "" after autocomplete selection
        const selectedType = document.getElementById("typeFilter").value;
        const url = `${API_BASE_URL}/monsters?search=${encodeURIComponent(query)}&gs=${encodeURIComponent(selectedCR)}&type=${encodeURIComponent(selectedType)}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                renderMonsters(data);
            })
        .finally(() => {
            hideLoader();
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

    //crFilter.addEventListener("change", fetchMonsters); no request sent when changin CR filter

     // Add event listener for the search button
    document.getElementById("searchButton").addEventListener("click", function() {
        fetchMonsters();
    });

    // Close autocomplete when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            autocompleteList.style.display = "none";
        }
    });

    // Render monsters to the page
    /* function renderMonsters(monsters) {
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
    } */
    function renderMonsters(monsters) {
        //console.log("Rendering monsters:", monsters); log to check response
        monsterContainer.innerHTML = "";
        monsters.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
        monsters.forEach(monster => {
            const monsterClass = monster.type && monster.type.toLowerCase().includes("beast") ? "beast" : "huge";
            const resist = monster.resistances || {};
            const abilities = monster.abilities || {};
            const monsterCard = `
                <div class="col-md-6">
                    <div class="card mb-3 ${monsterClass}">
                        <div class="card-body">
                            <h4 class="card-title">${monster.name}</h4>
                            <p class="source-material"><strong>Fonte:</strong> ${monster.source || "?"}</p>
                            <p><strong>Tipo:</strong> ${monster.type} ${monster.tags || ""}</p>
                            <p><strong>Taglia:</strong> ${monster.size} | <strong>Allineamento:</strong> ${monster.alignment}</p>
                            <p><strong>GS:</strong> ${monster.challenge_rating}</p>
                            <hr>
                            <h5>Statistiche Difensive</h5>
                            <p><strong>CA:</strong> ${monster.armor_class} (${monster.armor_class_notes || ""})</p>
                            <p><strong>PF:</strong> ${monster.hit_points} (${monster.hit_points_notes || ""})</p>
                            <p><strong>Velocità:</strong> ${monster.speed}</p>
    
                            <hr>
                            <h5>Abilità e Linguaggi</h5>
                            <p><strong>Abilità:</strong> ${monster.abilities?.skills || ""}</p>
                            <p><strong>Salvezze:</strong> ${monster.abilities?.saves || ""}</p>
                            <p><strong>Percezione Passiva:</strong> ${monster.abilities?.passive_perception}</p>
                            <p><strong>Linguaggi:</strong> ${monster.abilities?.languages || ""}</p>
                            <p><strong>Sensi:</strong> ${monster.abilities?.senses || ""}</p>
    
                            <hr>
                            <h5>Punteggi Caratteristica</h5>
                            <div class="ability-scores">
                                <div class="ability-header">
                                    <span>FOR</span><span>DES</span><span>COS</span><span>INT</span><span>SAG</span><span>CAR</span>
                                </div>
                                <div class="ability-values">
                                    <span>${abilities?.strength}</span>
                                    <span>${abilities?.dexterity}</span>
                                    <span>${abilities?.constitution}</span>
                                    <span>${abilities?.intelligence}</span>
                                    <span>${abilities?.wisdom}</span>
                                    <span>${abilities?.charisma}</span>
                                </div>
                            </div>
    
                            <hr>
                            <h5>Resistenze e Immunità</h5>
                            <p><strong>Resistenze:</strong> ${resist?.resistances || ""} (${resist?.resistances_notes || ""})</p>
                            <p><strong>Immunità:</strong> ${resist?.immunities || ""}</p>
                            <p><strong>Immunità Condizione:</strong> ${resist?.condition_immunities || ""}</p>

                            <hr>
                            <h5>Tratti</h5>
                            <div>${monster.traits.map(t => `<p><strong>${t.name}</strong>: ${t.content}</p>`).join("")}</div>
    
                            <hr>
                            <h5>Azioni</h5>
                            <div>${monster.actions.map(a => `<p><strong>${a.name}</strong>: ${a.content}</p>`).join("")}</div>
    
                            <hr>
                            <h5>Reazioni</h5>
                            <div>${monster.reactions.map(r => `<p><strong>${r.name}</strong>: ${r.content}</p>`).join("")}</div>
    
                            <hr>
                            <h5>Azioni Leggendarie</h5>
                            <div>${monster.legendary_actions.map(l => `<p><strong>${l.name}</strong>: ${l.content}</p>`).join("")}</div>
    
                            <hr>
                            <h5>Incantesimi</h5>
                            <div>${monster.spellcasting.map(s => `<p><strong>${s.name}</strong>: ${s.content}</p>`).join("")}</div>
                        </div>
                    </div>
                </div>`;
            monsterContainer.innerHTML += monsterCard;
        });
    }
        
}

);
