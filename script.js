document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const crFilter = document.getElementById("crFilter");
    const monsterContainer = document.getElementById("monsterContainer");
    let allMonsters = []; // Store all monsters for autocomplete

    // Fetch all monsters on page load for autocomplete
    fetch(`http://127.0.0.1:8080/api/monsters`)
        .then(response => response.json())
        .then(data => {
            allMonsters = data; // Store all monsters
            initializeAutocomplete(); // Initialize autocomplete
        })
        .catch(error => {
            console.error("Error fetching monsters:", error);
        });

    // Initialize autocomplete
    function initializeAutocomplete() {
        new Awesomplete(searchInput, {
            list: allMonsters.map(monster => monster.name), // Use monster names for autocomplete
            minChars: 1, // Show suggestions after 1 character is typed
            autoFirst: true, // Automatically select the first suggestion
            filter: function (text, input) {
                return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
            },
            item: function (text, input) {
                return Awesomplete.ITEM(text, input.match(/[^,]*$/)[0]);
            },
            replace: function (text) {
                this.input.value = text; // Replace input with selected suggestion
                fetchMonsters(); // Fetch monsters when a suggestion is selected
            }
        });
    }

    // Fetch monsters based on search and filters
    function fetchMonsters() {
        const query = searchInput.value.trim(); // Define query here
        const selectedCR = crFilter.value;

        // Fetch monsters from the API
        fetch(`http://127.0.0.1:8080/api/monsters?search=${query}`)
            .then(response => response.json())
            .then(data => {
                // Filter monsters based on Challenge Rating
                const filteredMonsters = data.filter(monster => 
                    selectedCR === "" || monster.challenge_rating == selectedCR
                );
                renderMonsters(filteredMonsters); // Render the filtered monsters
            })
            .catch(error => {
                console.error("Error fetching monsters:", error);
            });
    }

    // Render monsters to the page
    function renderMonsters(monsters) {
        monsterContainer.innerHTML = "";
        monsters.forEach(monster => {
            const monsterClass = monster.type && monster.type.toLowerCase().includes("beast") ? "beast" : "huge";
            const monsterCard = `
                <div class="col-md-4">
                    <div class="card mb-3 ${monsterClass}">
                        <div class="card-body">
                            <h5 class="card-title">${monster.name}</h5>
                            <p class="card-text creature-subtitle"><span class="text-highlight">Tipo:</span> ${monster.type}</p>
                            <p class="card-text"><span class="text-highlight">GS:</span> ${monster.challenge_rating}</p>
                            <div class="stats-container">                
                                <div class="stat-line"><dt>Armor Class:<dt>Classe Armatura</dt><dd> ${monster.armor_class}</dd></div>
                                <div class="stat-line"><dt>Punti Ferita:</dt> <dd>${monster.hit_points}</dd></div>
                                <div class="stat-line"><dt>Velocità:</dt> <dd>${monster.speed}</dd></div>
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
    }

    // Event listeners
    searchInput.addEventListener("input", () => {
        // Only show autocomplete suggestions, don't fetch monsters yet
        Awesomplete.$input.dispatchEvent(new Event("input"));
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            fetchMonsters(); // Fetch monsters when Enter is pressed
        }
    });

    crFilter.addEventListener("change", fetchMonsters); // Fetch monsters when filter is applied
});