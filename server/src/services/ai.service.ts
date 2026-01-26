import OpenAI from 'openai';
import logger from '../utils/logger';

class AIService {
  private openai: OpenAI | null = null;
  private enabled: boolean = false;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey && apiKey !== 'your_openai_api_key') {
      this.openai = new OpenAI({ apiKey });
      this.enabled = true;
      logger.info('✅ OpenAI Service initialized');
    } else {
      logger.warn('⚠️  OpenAI API key not configured - AI features disabled');
    }
  }

  /**
   * Check if AI service is available
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Generate task summary from description
   */
  async generateTaskSummary(taskDescription: string, taskTitle: string): Promise<string> {
    if (!this.enabled || !this.openai) {
      return 'AI service not configured';
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise task summaries for project management.',
          },
          {
            role: 'user',
            content: `Create a brief, actionable summary (2-3 sentences) for this task:\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Unable to generate summary';
    } catch (error) {
      logger.error('Error generating task summary:', error);
      throw new Error('Failed to generate AI summary');
    }
  }

  /**
   * Generate business insights from project/organization data
   */
  async generateBusinessInsights(data: {
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    activeProjects: number;
    teamSize: number;
    avgTaskCompletionDays: number;
  }): Promise<string> {
    if (!this.enabled || !this.openai) {
      return 'AI service not configured';
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a business intelligence analyst providing actionable insights.',
          },
          {
            role: 'user',
            content: `Analyze this business data and provide 3 key insights with recommendations:
            
Metrics:
- Completed Tasks: ${data.completedTasks}
- Pending Tasks: ${data.pendingTasks}
- Overdue Tasks: ${data.overdueTasks}
- Active Projects: ${data.activeProjects}
- Team Size: ${data.teamSize}
- Avg Task Completion: ${data.avgTaskCompletionDays} days`,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      return response.choices[0]?.message?.content || 'Unable to generate insights';
    } catch (error) {
      logger.error('Error generating business insights:', error);
      throw new Error('Failed to generate business insights');
    }
  }

  /**
   * Analyze team performance
   */
  async analyzeTeamPerformance(teamData: {
    members: Array<{
      name: string;
      tasksCompleted: number;
      avgCompletionTime: number;
      overdueCount: number;
    }>;
  }): Promise<string> {
    if (!this.enabled || !this.openai) {
      return 'AI service not configured';
    }

    try {
      const memberSummary = teamData.members.map(
        m => `${m.name}: ${m.tasksCompleted} tasks, ${m.avgCompletionTime}d avg, ${m.overdueCount} overdue`
      ).join('\n');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a team performance analyst providing constructive feedback.',
          },
          {
            role: 'user',
            content: `Analyze this team performance data and provide insights:\n\n${memberSummary}\n\nProvide balanced feedback highlighting strengths and areas for improvement.`,
          },
        ],
        max_tokens: 250,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Unable to analyze performance';
    } catch (error) {
      logger.error('Error analyzing team performance:', error);
      throw new Error('Failed to analyze team performance');
    }
  }

  /**
   * Generate project recommendations
   */
  async generateProjectRecommendations(projectData: {
    name: string;
    description: string;
    tasksCount: number;
    teamSize: number;
    startDate: Date;
    deadline?: Date;
  }): Promise<string[]> {
    if (!this.enabled || !this.openai) {
      return ['AI service not configured'];
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a project management consultant providing practical recommendations.',
          },
          {
            role: 'user',
            content: `Provide 3-5 actionable recommendations for this project:

Project: ${projectData.name}
Description: ${projectData.description}
Tasks: ${projectData.tasksCount}
Team Size: ${projectData.teamSize}
${projectData.deadline ? `Deadline: ${projectData.deadline.toLocaleDateString()}` : 'No deadline set'}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';
      return content.split('\n').filter(line => line.trim().length > 0);
    } catch (error) {
      logger.error('Error generating project recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  /**
   * Generate smart task title from description
   */
  async generateTaskTitle(description: string): Promise<string> {
    if (!this.enabled || !this.openai) {
      return 'AI service not configured';
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate a concise, actionable task title (max 8 words) from the description.',
          },
          {
            role: 'user',
            content: description,
          },
        ],
        max_tokens: 30,
        temperature: 0.6,
      });

      return response.choices[0]?.message?.content?.trim() || 'New Task';
    } catch (error) {
      logger.error('Error generating task title:', error);
      throw new Error('Failed to generate task title');
    }
  }
}

export default new AIService();
