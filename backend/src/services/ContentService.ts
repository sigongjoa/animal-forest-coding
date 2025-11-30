import fs from 'fs';
import path from 'path';

export interface Content {
  id: string;
  character: string;
  topic: string;
  title: string;
  description: string;
  text: string;
  imageId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  contentCount: number;
  order: number;
  createdAt?: string;
}

export interface Character {
  id: string;
  name: string;
  species: string;
  description: string;
  imageUrl: string;
  voiceProfile: string;
  specialties: string[];
  createdAt?: string;
}

export class ContentService {
  private dataPath = path.join(__dirname, '../../data');
  private charactersCache: Character[] | null = null;
  private topicsCache: Topic[] | null = null;
  private contentCache: Map<string, Content> = new Map();

  getContent(character: string, topic: string): Content | null {
    const cacheKey = `${character}:${topic}`;
    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey) || null;
    }

    const validCharacters = this.getAllCharacters();
    const charObj = validCharacters.find((c) => c.id === character || c.name === character);
    if (!charObj) {
      throw new Error(`Character not found: ${character}`);
    }

    const validTopics = this.getAllTopics();
    if (!validTopics.find((t) => t.slug === topic)) {
      throw new Error(`Topic not found: ${topic}`);
    }

    const characterName = charObj.name.replace(/\s+/g, '-').toLowerCase();
    const contentFile = `${characterName}-${topic}.json`;
    const contentPath = path.join(this.dataPath, 'content', contentFile);

    try {
      if (!fs.existsSync(contentPath)) {
        return null;
      }

      const data = fs.readFileSync(contentPath, 'utf-8');
      const content: Content = JSON.parse(data);
      this.contentCache.set(cacheKey, content);
      return content;
    } catch (error) {
      console.error(`Error loading content: ${contentPath}`, error);
      return null;
    }
  }

  getAllCharacters(): Character[] {
    if (this.charactersCache) {
      return this.charactersCache;
    }

    const characterPath = path.join(this.dataPath, 'characters.json');
    try {
      const data = fs.readFileSync(characterPath, 'utf-8');
      this.charactersCache = JSON.parse(data) as Character[];
      return this.charactersCache || [];
    } catch (error) {
      console.error('Error loading characters:', error);
      return [];
    }
  }

  getAllTopics(difficulty?: string): Topic[] {
    if (this.topicsCache && !difficulty) {
      return this.topicsCache;
    }

    const topicsPath = path.join(this.dataPath, 'topics.json');
    try {
      const data = fs.readFileSync(topicsPath, 'utf-8');
      let topics: Topic[] = JSON.parse(data);

      if (difficulty) {
        topics = topics.filter((t) => t.difficulty === difficulty);
      } else {
        this.topicsCache = topics;
      }

      return topics;
    } catch (error) {
      console.error('Error loading topics:', error);
      return [];
    }
  }

  searchContent(keyword: string): Content[] {
    const results: Content[] = [];
    const contentDir = path.join(this.dataPath, 'content');

    try {
      if (!fs.existsSync(contentDir)) {
        return results;
      }

      const files = fs.readdirSync(contentDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const content = JSON.parse(
            fs.readFileSync(path.join(contentDir, file), 'utf-8')
          );

          if (
            content.title.toLowerCase().includes(keyword.toLowerCase()) ||
            content.text.toLowerCase().includes(keyword.toLowerCase())
          ) {
            results.push(content);
          }
        } catch (error) {
          console.error(`Error parsing content file: ${file}`, error);
        }
      }
    } catch (error) {
      console.error('Error searching content:', error);
    }

    return results;
  }
}
