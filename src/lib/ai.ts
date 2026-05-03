import { OpenAI } from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface CommitAnalysis {
  summary: string;
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'perf';
  breaking: boolean;
  scope?: string;
}

export interface VersionSuggestion {
  version: string;
  reason: string;
  changes: {
    major: number;
    minor: number;
    patch: number;
  };
}

export async function analyzeCommit(message: string): Promise<CommitAnalysis> {
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }
    
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a commit message analyzer. Analyze the following commit message and return a JSON object with:
          - summary: A brief, human-readable summary of what changed
          - type: The conventional commit type (feat, fix, docs, style, refactor, test, chore, perf)
          - breaking: Boolean indicating if this is a breaking change
          - scope: The scope of the change if present (optional)
          
          Respond only with valid JSON, no explanations.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing commit:', error);
    // Fallback to basic parsing
    return {
      summary: message.split('\n')[0],
      type: 'chore',
      breaking: message.includes('BREAKING CHANGE'),
    };
  }
}

export async function suggestVersion(commits: CommitAnalysis[]): Promise<VersionSuggestion> {
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }
    
    const commitMessages = commits.map(c => `${c.type}: ${c.summary}`).join('\n');
    
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a semantic versioning expert. Analyze these commits and suggest the next version.
          Return JSON with:
          - version: The suggested version (e.g., "1.2.3")
          - reason: Brief explanation of why this version
          - changes: Object with major, minor, patch counts
          
          Rules:
          - Major (X.0.0): Breaking changes
          - Minor (X.Y.0): New features
          - Patch (X.Y.Z): Bug fixes
          
          Respond only with valid JSON.`
        },
        {
          role: "user",
          content: commitMessages
        }
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error suggesting version:', error);
    // Fallback logic
    const breaking = commits.filter(c => c.breaking).length;
    const features = commits.filter(c => c.type === 'feat').length;
    const fixes = commits.filter(c => c.type === 'fix').length;
    
    let version = '0.0.0';
    if (breaking > 0) {
      version = '1.0.0';
    } else if (features > 0) {
      version = '0.1.0';
    } else if (fixes > 0) {
      version = '0.0.1';
    }

    return {
      version,
      reason: `Based on ${breaking} breaking, ${features} features, ${fixes} fixes`,
      changes: { major: breaking, minor: features, patch: fixes }
    };
  }
}

export async function improveCommitMessage(message: string): Promise<string> {
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }
    
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a commit message expert. Improve the following commit message to follow conventional commits format.
          Rules:
          - Use type(scope): description format
          - Keep description under 50 characters
          - Use imperative mood
          - Include breaking changes if present
          - Add body if needed
          
          Return only the improved commit message, no explanations.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || message;
  } catch (error) {
    console.error('Error improving commit message:', error);
    return message;
  }
}
