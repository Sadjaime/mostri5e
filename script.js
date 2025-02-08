import { API_BASE_URL } from './config.js';
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const crFilter = document.getElementById("crFilter");
    const monsterContainer = document.getElementById("monsterContainer");
    const autocompleteList = document.createElement("ul");
    autocompleteList.id = "autocompleteList";
    autocompleteList.style.position = "absolute";
    autocompleteList.style.zIndex = "1000";
    autocompleteList.style.backgroundColor = "#fff";
    autocompleteList.style.border = "1px solid #ccc";
    autocompleteList.style.listStyleType = "none";
    autocompleteList.style.margin = "0";
    autocompleteList.style.padding = "0";
    autocompleteList.style.width = `${searchInput.offsetWidth}px`;
    document.body.appendChild(autocompleteList);

    let debounceTimeout;
    let currentOffset = 0; // Offset per la paginazione
    const limit = 10; // Numero di mostri da caricare per richiesta

    // Funzione per ottenere i mostri dall'API
    function fetchMonsters(reset = false) {
        const query = searchInput.value.trim();
        const selectedCR = crFilter.value; // Ottiene il valore selezionato
        const url = `https://mostri5e-production.up.railway.app:8080/api/monsters?search=${query}&limit=${limit}&offset=${currentOffset}`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (reset) monsterContainer.innerHTML = ""; // Resetta i mostri solo se necessario

                // Filtra i mostri in base al CR selezionato
                const filteredMonsters = data.filter(
                    (monster) => selectedCR === "" || monster.challenge_rating == selectedCR
                );

                filteredMonsters.forEach((monster) => {
                    const monsterClass = monster.type && monster.type.toLowerCase().includes("beast") ? "beast" : "huge";
                    const monsterCard = `<div class="col-md-4">
                        <div class="card mb-3 ${monsterClass}">
                            <div class="card-body">
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
                                    <div class="trait">${monster.traits.map(trait => `<strong>${trait.name}.</strong> ${trait.content}`).join("<br>")}</div>
                                </div>
                                <div class="actions-section">
                                    <h3>Azioni</h3> 
                                    <div class="action">${monster.actions.map(action => `<strong>${action.name}.</strong> ${action.content}`).join("<br>")}</div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    monsterContainer.innerHTML += monsterCard;
                });

                // Incrementa l'offset per la prossima pagina
                currentOffset += limit;
            });
    }

    // Funzione per mostrare l'autocomplete
    function fetchAutocomplete(query) {
        fetch(`https://mostri5e-production.up.railway.app:8080/api/autocomplete?query=${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((suggestions) => {
                autocompleteList.innerHTML = ""; // Resetta la lista
                suggestions.forEach((suggestion) => {
                    const li = document.createElement("li");
                    li.textContent = suggestion;
                    li.style.padding = "8px";
                    li.style.cursor = "pointer";
                    li.addEventListener("click", () => {
                        searchInput.value = suggestion;
                        autocompleteList.innerHTML = ""; // Chiudi la lista
                        fetchMonsters(true); // Mostra i mostri corrispondenti
                    });
                    autocompleteList.appendChild(li);
                });
            });
    }

    // Event listener per aggiornare i mostri con debouncing
    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.trim();
        clearTimeout(debounceTimeout);
        if (query.length > 0) {
            debounceTimeout = setTimeout(() => {
                fetchAutocomplete(query);
                currentOffset = 0; // Resetta l'offset
                fetchMonsters(true); // Ricarica i mostri
            }, 300); // Ritardo di 300ms
        } else {
            autocompleteList.innerHTML = ""; // Pulisci la lista se l'input è vuoto
            currentOffset = 0; // Resetta l'offset
            fetchMonsters(true);
        }
    });

    // Event listener per il filtro CR
    crFilter.addEventListener("change", () => {
        currentOffset = 0; // Resetta l'offset
        fetchMonsters(true); // Ricarica i mostri
    });

    // Chiudi l'autocomplete se l'utente clicca fuori
    document.addEventListener("click", (event) => {
        if (!autocompleteList.contains(event.target) && event.target !== searchInput) {
            autocompleteList.innerHTML = "";
        }
    });

    // Inizializza la pagina caricando solo i primi 10 mostri
    fetchMonsters(true);
});
