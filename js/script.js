class Type {
    constructor(typeData) {
        this.name = typeData.type.name;
        this.image = typeData.type.url;
        this.color = this.getColorHexa();
    }

    getColorHexa() {
        const colours = {
            normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', 
            electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6',
            fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65',
            flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
            rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
            dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
            stellar: '#9E5252', shadow: '#4a46466f'
        };

        return colours[this.name] || 'grey';
    }
}

class Pokemon {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.image = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;
        this.apiTypes = data.types;
        const getStat = (statName) => data.stats.find(s => s.stat.name === statName).base_stat;
        this.hp = getStat("hp");
        this.attack = getStat("attack");
        this.defense = getStat("defense");
        this.special_attack = getStat("special-attack");
        this.speed = getStat("speed");
        this.arrTypes = this.apiTypes.map(t => new Type(t));
    }

    displayCard() {
        const article = document.createElement('article');
        const mainColor = this.arrTypes.length > 0 ? this.arrTypes[0].color : "gray";
        const typesHtml = this.arrTypes.map(t => `<span class="types" style="background-color: ${t.color};">${t.name}</span>`).join(' ');

        article.innerHTML = `
            <figure>
                <picture>
                    <img src="${this.image}" alt="${this.name}" />
                </picture>
                <figcaption>
                    ${typesHtml}
                    <h2>${this.name}</h2>
                    <ol>
                        <li>points de vie : ${this.hp}</li>
                        <li>attaque : ${this.attack}</li>
                        <li>défense : ${this.defense}</li>
                        <li>attaque spéciale : ${this.special_attack}</li>
                        <li>vitesse : ${this.speed}</li>
                    </ol>
                </figcaption>
            </figure>`;

        article.style.backgroundColor = mainColor;
        article.style.borderColor = mainColor;

        return article;
    }

}

async function loadTypes(type) {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type');
        const data = await response.json();
        const types = data.results;

        const typesContainer = document.getElementById('types');
        typesContainer.innerHTML= '';

        types.forEach( type => {
            const typeButton = document.createElement('div');
            typeButton.classList.add('type-button');
            typeButton.dataset.type = type.name;
            typeButton.innerHTML = `
                <p>${type.name}</p>
            `;
            typesContainer.appendChild(typeButton);
        });

    } catch (error) {
        console.error('erreur lors du chargement des types: ', error);
    }
}

async function loadPoke(generation, selectedType, selectedCritere) {
    try {
        const response = await fetch (`https://pokeapi.co/api/v2/generation/${generation}`);
        const genData = await response.json();

        const detailedPromises = genData.pokemon_species.map(species => {
            const urlParts = species.url.split('/');
            const id = urlParts[urlParts.length - 2]; 
    
        return fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json());
});

        let data = await Promise.all(detailedPromises);

        if (selectedType) {
            data = data.filter(pokemon => pokemon.types.some(t => t.type.name === selectedType));
        }

        if(selectedCritere && selectedCritere !== "0") {
            const getStat = (poke, statName) => poke.stats.find(s => s.stat.name === statName).base_stat;
            data = data.sort((a, b) => {
                switch(selectedCritere) {
                    case "Nom":
                        return a.name.localeCompare(b.name);
                    case "PV":
                        return getStat(b, "hp") - getStat(a, "hp");
                    case "Attaque":
                        return getStat(b, "attack") - getStat(a, "attack");
                    case "Défense":
                        return getStat(b, "defense") - getStat(a, "defense");
                    case "Attaque spéciale":
                        return getStat(b, "special-attack") - getStat(a, "special-attack");
                    case "Vitesse":
                        return getStat(b, "speed") - getStat(a, "speed");
                    default:
                        return 0;
                }
            });
        }

        const mainElement = document.querySelector('main');
        mainElement.innerHTML = '';

        data.forEach(pokemonData => { 
            const pokemon = new Pokemon(pokemonData);
            const article = pokemon.displayCard();
            mainElement.appendChild(article);
        });

    } catch (error) {
        alert("erreur: " +error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const generationSelect = document.querySelector('#filtre select');
    const typesContainer = document.getElementById('types');
    const critereSelect = document.querySelector('#tri select');

    let selectedGeneration = generationSelect.value;
    let selectedType = null;
    let selectedCritere = critereSelect.value;

    generationSelect.addEventListener('change', (event) => {
        selectedGeneration = event.target.value;
        console.log('génération sélectionnée:', selectedGeneration);
        loadPoke(selectedGeneration, selectedType, selectedCritere);
    });

    critereSelect.addEventListener('change', (event) => {
        selectedCritere = event.target.value;
        console.log('critère sélectionné :', selectedCritere);
        loadPoke(selectedGeneration, selectedType, selectedCritere);
    });

    const typeButtons = document.querySelectorAll('.type-button');

    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('selected')) button.classList.remove('selected');
            else button.classList.add('selected');
        });
    });

    function toggleSelection(typeButton) {
        typeButton.classList.toggle('selected');
        if (typeButton.classList.contains('selected')) console.log(`Type ${typeButton.dataset.type} sélectionné`);
        else console.log(`Type ${typeButton.dataset.type} désélectionné`);
    }

    typesContainer.addEventListener('click', (event) => {
        const typeButton = event.target.closest('.type-button');
        if (typeButton) {
            toggleSelection(typeButton);
            selectedType = typeButton.classList.contains('selected') ? typeButton.dataset.type : null;
            console.log('type sélectionné:', selectedType);
            loadPoke(selectedGeneration, selectedType, selectedCritere);
        }
    });

    loadTypes();
    loadPoke(1,null,null);
})