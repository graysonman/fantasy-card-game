// scripts/generate-cards.mjs
import fs from 'fs/promises';

const rarities = {
  Common: { weight: 45, stats: { min: 10, max: 30 } },
  Uncommon: { weight: 30, stats: { min: 25, max: 50 } },
  Rare: { weight: 15, stats: { min: 45, max: 75 } },
  'Super Rare': { weight: 7, stats: { min: 70, max: 100 } },
  Legendary: { weight: 3, stats: { min: 90, max: 130 } },
};

const types = ['Strength', 'Finesse', 'Speed'];

const nameParts = {
  adjectives: ['Stone', 'Iron', 'Flame', 'Shadow', 'Wind', 'Forest', 'River', 'Mountain', 'Glimmering', 'Silent', 'Ancient', 'Young', 'Feral', 'Crystal', 'Void', 'Starfall'],
  creatures: ['Goblin', 'Orc', 'Elf', 'Dwarf', 'Golem', 'Sprite', 'Griffin', 'Wolf', 'Bear', 'Serpent', 'Wisp', 'Knight', 'Beast', 'Hunter'],
  titles: ['Grunt', 'Scout', 'Warrior', 'Adept', 'Champion', 'Guardian', 'Stalker', 'Captain'],
  dragon_parts: ['Drake', 'Wyrm', 'Dragon', 'Hatchling', 'Wyvern'],
  wizard_titles: ['Acolyte', 'Mage', 'Sorcerer', 'Archmage', 'Enchanter', 'Chronomancer', 'Elementalist']
};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCardName(isDragon = false, isWizard = false) {
    if (isDragon) {
        const adj = getRandomElement(nameParts.adjectives);
        const dragon = getRandomElement(nameParts.dragon_parts);
        return `${adj} ${dragon}`;
    }
    if (isWizard) {
        const adj = getRandomElement(nameParts.adjectives);
        const title = getRandomElement(nameParts.wizard_titles);
        return `${adj} ${title}`;
    }
    const adj = getRandomElement(nameParts.adjectives);
    const creature = getRandomElement(nameParts.creatures);
    const title = getRandomElement(nameParts.titles);
    if (Math.random() > 0.5) {
        return `${adj} ${creature}`;
    }
    return `${creature} ${title}`;
}

function generateRandomStat(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateLore(cardName, rarity, type, isDragon = false, isWizard = false) {
    if (isDragon) {
        const templates = [
            `The ${cardName}, a ${rarity} dragon of immense power, commands the skies. Its scales shimmer with raw ${type}, and its roar is said to shake the very foundations of the world.`,
            `From the volcanic heart of Mount Cinder, the ${cardName} emerges. This ${rarity} beast is a living embodiment of ${type}, its breath a torrent of pure energy.`,
        ];
        return getRandomElement(templates);
    }
    if (isWizard) {
        const templates = [
            `A ${rarity} master of the arcane, the ${cardName} weaves spells of pure ${type}. From a hidden tower, they study the cosmos, bending reality to their will.`,
            `The ${cardName} is a reclusive ${rarity} spellcaster, whose knowledge of ${type} is unparalleled. They are a keeper of ancient secrets, rarely meddling in the affairs of mortals.`,
        ];
        return getRandomElement(templates);
    }
    const templates = [
        `The ${cardName} is a creature of ${rarity} power, known for its incredible ${type}. Legends say it roams the ancient forests, a silent guardian of its domain.`,
        `Hailing from the sun-scorched deserts, the ${cardName} is a fearsome sight. Its ${type} is matched only by its cunning, a trait that makes it a ${rarity} adversary.`,
    ];
    return getRandomElement(templates);
}


async function generateSeedFile() {
  const numTotalCards = 150;
  const numThemedCards = 50; // 25 dragons, 25 wizards
  const cards = [];
  const weightedRarities = Object.entries(rarities).flatMap(([rarity, { weight }]) => Array(weight).fill(rarity));
  const usedNames = new Set();

  // Generate themed cards first
  for (let i = 0; i < numThemedCards; i++) {
      const isDragon = i < 25;
      const isWizard = i >= 25;
      let name;
      do {
          name = generateCardName(isDragon, isWizard);
      } while (usedNames.has(name));
      usedNames.add(name);

      const rarity = getRandomElement(weightedRarities);
      const type = isDragon ? 'Strength' : 'Finesse'; // Assign thematic types
      const { min, max } = rarities[rarity].stats;
      
      const base_attack = generateRandomStat(min, max);
      const base_defense = generateRandomStat(min, max);
      
      const totalStats = base_attack + base_defense;
      const final_attack = Math.round(totalStats * (Math.random() * 0.4 + 0.3));
      const final_defense = totalStats - final_attack;

      const description = await generateLore(name, rarity, type, isDragon, isWizard);
      const image_url = `/cards/${name.toLowerCase().replace(/\s+/g, '_')}.png`;
      const fusible = rarity !== 'Ultra Legendary';

      cards.push({
        name,
        description,
        image_url,
        rarity,
        type,
        base_attack: final_attack,
        base_defense: final_defense,
        fusible,
      });
  }

  // Generate remaining random cards
  while(cards.length < numTotalCards) {
    let name;
    do {
        name = generateCardName();
    } while (usedNames.has(name));
    usedNames.add(name);

    const rarity = getRandomElement(weightedRarities);
    const type = getRandomElement(types);
    const { min, max } = rarities[rarity].stats;
    
    const base_attack = generateRandomStat(min, max);
    const base_defense = generateRandomStat(min, max);
    
    const totalStats = base_attack + base_defense;
    const final_attack = Math.round(totalStats * (Math.random() * 0.4 + 0.3));
    const final_defense = totalStats - final_attack;

    const description = await generateLore(name, rarity, type);
    const image_url = `/cards/${name.toLowerCase().replace(/\s+/g, '_')}.png`;
    const fusible = rarity !== 'Ultra Legendary';

    cards.push({
      name,
      description,
      image_url,
      rarity,
      type,
      base_attack: final_attack,
      base_defense: final_defense,
      fusible,
    });
  }

  let sql = `-- seed.sql
-- This file was auto-generated by scripts/generate-cards.mjs
-- Contains 150 cards: 50 themed (dragon/wizard) and 100 general fantasy.
-- Run this after applying the schema.sql definitions.

-- Clear existing card data to avoid duplicates on re-seed
DELETE FROM player_cards;
DELETE FROM cards;
ALTER SEQUENCE cards_id_seq RESTART WITH 1;

`;

  sql += "INSERT INTO cards (name, description, image_url, rarity, type, base_attack, base_defense, fusible) VALUES\n";
  
  const valueStrings = cards.map(card => 
    `('${card.name.replace(/'/g, "''")}', '${card.description.replace(/'/g, "''")}', '${card.image_url}', '${card.rarity}', '${card.type}', ${card.base_attack}, ${card.base_defense}, ${card.fusible})`
  );

  sql += valueStrings.join(',\n') + ';\n';

  try {
    await fs.writeFile('D:/github/card/fantasy-card-game-next/seed.sql', sql);
    console.log('Successfully generated new seed.sql file with 150 cards.');
  } catch (err) {
    console.error('Error writing seed.sql file:', err);
  }
}

generateSeedFile();
