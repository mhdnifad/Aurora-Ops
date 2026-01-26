declare class AIService {
    private openai;
    private enabled;
    constructor();
    /**
     * Check if AI service is available
     */
    isEnabled(): boolean;
    /**
     * Generate task summary from description
     */
    generateTaskSummary(taskDescription: string, taskTitle: string): Promise<string>;
    /**
     * Generate business insights from project/organization data
     */
    generateBusinessInsights(data: {
        completedTasks: number;
        pendingTasks: number;
        overdueTasks: number;
        activeProjects: number;
        teamSize: number;
        avgTaskCompletionDays: number;
    }): Promise<string>;
    /**
     * Analyze team performance
     */
    analyzeTeamPerformance(teamData: {
        members: Array<{
            name: string;
            tasksCompleted: number;
            avgCompletionTime: number;
            overdueCount: number;
        }>;
    }): Promise<string>;
    /**
     * Generate project recommendations
     */
    generateProjectRecommendations(projectData: {
        name: string;
        description: string;
        tasksCount: number;
        teamSize: number;
        startDate: Date;
        deadline?: Date;
    }): Promise<string[]>;
    /**
     * Generate smart task title from description
     */
    generateTaskTitle(description: string): Promise<string>;
}
declare const _default: AIService;
export default _default;
//# sourceMappingURL=ai.service.d.ts.map