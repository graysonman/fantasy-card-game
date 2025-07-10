// scripts/generate-prompts.mjs
import fs from 'fs/promises';

async function generatePrompts() {
  try {
    const sqlContent = await fs.readFile('D:/github/card/fantasy-card-game-next/seed.sql', 'utf-8');
    const lines = sqlContent.split('\n');
    
    const cardDataRegex = /^\('([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', (\d+), (\d+), (true|false)\)[,;]?$/;
    
    let markdownContent = `# Card Image Generation Prompts\n\nThis file contains a list of detailed prompts for an AI image generator to create the art for each card in the game.\n\n**Style Guide:** All images should be in a "digital fantasy illustration" style. They should be vibrant, detailed, and suitable for a modern card game. The background should be atmospheric and match the creature's description. The main character/creature should be the clear focus.\n\n---\n`;

    let cardCount = 0;
    for (const line of lines) {
      const match = line.trim().match(cardDataRegex);
      if (match) {
        cardCount++;
        const [_, name, description, image_url, rarity, type] = match;
        
        const prompt = `A beautiful, cinematic, vibrant digital fantasy illustration of a "${name}". The creature is a ${rarity} ${type} type. The scene should be inspired by its lore: "${description}". The creature is the main focus of the image.`;

        markdownContent += `### ${cardCount}. ${name}\n`;
        markdownContent += `**File:** \`/public${image_url}\`\n`;
        markdownContent += `**Prompt:** "${prompt}"\n\n`;
      }
    }

    await fs.writeFile('D:/github/card/fantasy-card-game-next/image_prompts.md', markdownContent);
    console.log(`Successfully generated ${cardCount} image prompts.`);

  } catch (error) {
    console.error('Error generating image prompts:', error);
  }
}

generatePrompts();
