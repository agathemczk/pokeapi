import { Type } from "./type.js";

export class Pokemon {
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