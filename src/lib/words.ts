export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_CONFIG: Record<Difficulty, { lives: number; pointsBase: number }> = {
  easy: { lives: 6, pointsBase: 10 },
  medium: { lives: 6, pointsBase: 20 },
  hard: { lives: 4, pointsBase: 40 },
};

const WORDS: Record<Difficulty, { word: string; clue: string }[]> = {
  easy: [
    { word: "CAT", clue: "A small furry pet that purrs." },
    { word: "SUN", clue: "Bright star at the center of our solar system." },
    { word: "BOOK", clue: "You read it." },
    { word: "TREE", clue: "Has leaves and branches." },
    { word: "FISH", clue: "Lives in water and has fins." },
    { word: "MOON", clue: "Glows in the night sky." },
    { word: "CAKE", clue: "Sweet birthday treat." },
    { word: "BIRD", clue: "It can fly with wings." },
    { word: "FROG", clue: "Green animal that hops." },
    { word: "RAIN", clue: "Water falling from clouds." },
    { word: "LEAF", clue: "Part of a plant that turns green." },
    { word: "FIRE", clue: "It provides warmth and light." },
    { word: "WIND", clue: "Moving air you can feel." },
    { word: "SNOW", clue: "White frozen rain." },
    { word: "PARK", clue: "Outdoor place to play." },
    { word: "DUCK", clue: "Bird that says quack." },
    { word: "MILK", clue: "White drink from cows." },
    { word: "BEAR", clue: "Large furry forest animal." },
    { word: "APPLE", clue: "A common red or green fruit." },
    { word: "HOUSE", clue: "A building where people live." },
    { word: "TABLE", clue: "A piece of furniture with a flat top." },
    { word: "BALL", clue: "Round object used in sports." },
    { word: "STAR", clue: "Twinkles in the night sky." },
    { word: "SHIP", clue: "Large boat on the sea." },
    { word: "LAMP", clue: "Used to light up a room." },
    { word: "BIKE", clue: "Vehicle with two wheels." },
    { word: "DESK", clue: "Where you sit to study." },
    { word: "ROAD", clue: "Path for cars to drive on." },
    { word: "DOOR", clue: "Used to enter a room." },
    { word: "HAND", clue: "Part of your arm." },
    { word: "FOOD", clue: "What you eat when hungry." },
    { word: "SHOE", clue: "Worn on your feet." },
    { word: "BLUE", clue: "The color of the sky." },
    { word: "PINK", clue: "A light red color." },
    { word: "COLD", clue: "Opposite of hot." },
    { word: "FAST", clue: "Opposite of slow." },
  ],
  medium: [
    { word: "PYTHON", clue: "A programming language widely used for web development." },
    { word: "GUITAR", clue: "A six-stringed musical instrument." },
    { word: "PLANET", clue: "Earth is one of these." },
    { word: "ROCKET", clue: "Launches into space." },
    { word: "JUNGLE", clue: "Dense tropical forest." },
    { word: "CASTLE", clue: "Medieval fortified building." },
    { word: "DRAGON", clue: "Legendary fire-breathing creature." },
    { word: "ISLAND", clue: "Land surrounded by water." },
    { word: "FOREST", clue: "Large area covered with trees." },
    { word: "DESERT", clue: "Very dry, sandy land." },
    { word: "OCEAN", clue: "Huge body of salt water." },
    { word: "VALLEY", clue: "Low land between mountains." },
    { word: "GALAXY", clue: "System of millions of stars." },
    { word: "CANYON", clue: "Deep valley with steep sides." },
    { word: "LANTERN", clue: "Portable light source." },
    { word: "HARVEST", clue: "Gathering of ripened crops." },
    { word: "WHALE", clue: "Largest animal in the ocean." },
    { word: "PANDA", clue: "Black and white bamboo eater." },
    { word: "BRIDGE", clue: "Structure over a river." },
    { word: "WEATHER", clue: "Sun, rain, or snow state." },
    { word: "KITCHEN", clue: "Room for cooking food." },
    { word: "GARDEN", clue: "Outdoor area with plants." },
    { word: "POCKET", clue: "Small bag in clothing." },
    { word: "MIRROR", clue: "Shows your reflection." },
    { word: "WINDOW", clue: "Glass opening in a wall." },
    { word: "HAMMER", clue: "Tool for hitting nails." },
    { word: "SCHOOL", clue: "Place where learning happens." },
    { word: "COFFEE", clue: "Popular morning drink." },
    { word: "SILVER", clue: "Shiny gray metal." },
    { word: "ORANGE", clue: "A citrus fruit and a color." },
    { word: "TURTLE", clue: "Slow animal with a shell." },
    { word: "TIGER", clue: "Large striped cat." },
    { word: "SPIDER", clue: "Eight-legged web spinner." },
    { word: "DIARY", clue: "Book for private thoughts." },
    { word: "DANGER", clue: "Risk of harm or injury." },
    { word: "PUZZLE", clue: "Game that tests your brain." },
  ],
  hard: [
    { word: "ALGORITHM", clue: "Step-by-step problem solving procedure." },
    { word: "QUARTZ", clue: "Common crystalline mineral." },
    { word: "JAZZED", clue: "Excited and enthusiastic." },
    { word: "ZEPHYR", clue: "A gentle west wind." },
    { word: "WHISKEY", clue: "Distilled alcoholic drink." },
    { word: "PYRAMID", clue: "Ancient Egyptian structure." },
    { word: "OXYGEN", clue: "Element you breathe." },
    { word: "VOYAGE", clue: "A long journey, usually by sea." },
    { word: "ECLIPSE", clue: "When the moon covers the sun." },
    { word: "GLACIER", clue: "Slow-moving mass of ice." },
    { word: "TSUNAMI", clue: "Huge wave caused by earthquake." },
    { word: "DIAMOND", clue: "Hardest natural substance." },
    { word: "VOLCANO", clue: "Mountain that erupts with lava." },
    { word: "HORIZON", clue: "Where the sky meets the earth." },
    { word: "ORCHESTRA", clue: "Large group of musicians." },
    { word: "PHARAOH", clue: "Ruler of ancient Egypt." },
    { word: "SYMPHONY", clue: "Long musical composition." },
    { word: "LABYRINTH", clue: "Complex maze of paths." },
    { word: "RHYTHM", clue: "Strong, regular repeated pattern." },
    { word: "SYZYGY", clue: "Alignment of celestial bodies." },
    { word: "CRYPTIC", clue: "Having a mysterious meaning." },
    { word: "SPHINX", clue: "Mythical creature with lion body." },
    { word: "OBLIVION", clue: "State of being forgotten." },
    { word: "PARADOX", clue: "Self-contradictory statement." },
    { word: "NIGHTMARE", clue: "A very scary dream." },
    { word: "PHANTOM", clue: "Ghost or figment of imagination." },
    { word: "QUIVER", clue: "To tremble or shake slightly." },
    { word: "UNKNOWN", clue: "Not familiar or recognized." },
    { word: "XENON", clue: "Noble gas used in lights." },
    { word: "YACHT", clue: "Expensive private boat." },
    { word: "ZENITH", clue: "The highest point reached." },
    { word: "BLIZZARD", clue: "Severe snowstorm with wind." },
    { word: "CHAMELEON", clue: "Lizard that changes color." },
    { word: "DYNASTY", clue: "Line of hereditary rulers." },
    { word: "ECHO", clue: "Sound reflected back to you." },
    { word: "FALCON", clue: "Fast bird of prey." },
  ],
};

export function pickWord(difficulty: Difficulty) {
  const list = WORDS[difficulty];
  
  // Get recently used words from localStorage to prevent immediate repeats
  let recent: string[] = [];
  try {
    const stored = localStorage.getItem(`recent_words_${difficulty}`);
    if (stored) recent = JSON.parse(stored);
  } catch (e) {}

  // Filter out recent words if possible (only if we have enough words left to pick from)
  const available = list.filter(w => !recent.includes(w.word));
  const pool = available.length > 0 ? available : list;
  
  const selected = pool[Math.floor(Math.random() * pool.length)];

  // Update recent list (keep last 10)
  const nextRecent = [selected.word, ...recent.filter(w => w !== selected.word)].slice(0, 10);
  localStorage.setItem(`recent_words_${difficulty}`, JSON.stringify(nextRecent));

  return selected;
}