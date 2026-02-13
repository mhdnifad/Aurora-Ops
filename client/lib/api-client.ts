


import axios, { AxiosInstance } from 'axios';

// Resolve API base URL - use the value as-is since it should already include /api
const resolveApiBaseUrl = () => {
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // In browser, use NEXT_PUBLIC_API_URL which should be /api for proxy or full URL
    return process.env.NEXT_PUBLIC_API_URL || '/api';
  } else {
    // On server (SSR), use internal backend service URL
    return process.env.API_SERVER_URL || 'http://localhost:5000/api';
  }
};

const API_BASE_URL = resolveApiBaseUrl();

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  // Upload user avatar
  async uploadUserAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file); // Must match backend field name
    return this.request<any>('POST', '/api/user/profile/avatar', formData);
  }
  // Remove user avatar
  async removeUserAvatar() {
    return this.request<any>('DELETE', '/api/user/profile/avatar');
  }
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load tokens from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
      }
    }

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      // Always check localStorage first to ensure we have the latest token
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('auth_tokens');
        if (stored) {
          const tokens = JSON.parse(stored);
          this.accessToken = tokens.accessToken;
          this.refreshToken = tokens.refreshToken;
        }
        
        // Add organization ID to headers if available
        const orgStored = localStorage.getItem('currentOrganization');
        if (orgStored) {
          try {
            const org = JSON.parse(orgStored);
            if (org._id) {
              config.headers['x-organization-id'] = org._id;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
      
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const isRefreshRequest = typeof originalRequest?.url === 'string' && originalRequest.url.includes('auth/refresh-token');

        // If 401 and not a refresh attempt, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
          originalRequest._retry = true;

          // If we don't have a refresh token, just clear state and throw error
          if (!this.refreshToken) {
            this.clearTokens();
            return Promise.reject(error);
          }

          try {
            const response = await this.client.post('/api/auth/refresh-token', {
              refreshToken: this.refreshToken,
            });

            const { accessToken, refreshToken } = response.data.data;
            this.setTokens(accessToken, refreshToken || this.refreshToken!);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (err: any) {
            // Refresh failed: clear tokens so the app can redirect to login
            if (err.response) {
              this.clearTokens();
            }
            return Promise.reject(err);
          }
        }

        // If the refresh endpoint itself fails, clear tokens to prevent loops
        if (isRefreshRequest && error.response) {
          this.clearTokens();
        }

        return Promise.reject(error);
      }
    );
  }

  private notifyAuthChange(hasTokens: boolean) {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(
      new CustomEvent('auth:tokens', {
        detail: { hasTokens },
      })
    );
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_tokens', JSON.stringify({ accessToken, refreshToken }));
    }

    this.notifyAuthChange(true);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_tokens');
    }

    this.notifyAuthChange(false);
  }

  async request<T>(method: string, url: string, data?: any): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const response = await this.client.request<{ success: boolean; data: T }>({
      method,
      url,
      data,
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });

    // Extract the actual data from the API response structure
    return response.data.data as T;
  }

  async get<T = any>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  // Auth endpoints
  async register(firstName: string, lastName: string, email: string, password: string, passwordConfirm: string) {
    return this.request<{
      user: any;
      tokens: AuthTokens;
    }>('POST', '/api/auth/register', { firstName, lastName, email, password, passwordConfirm });
  }

  async login(email: string, password: string) {
    return this.request<{
      user: any;
      tokens: AuthTokens;
    }>('POST', '/api/auth/login', { email, password });
  }

  async logout() {
    await this.request('POST', '/api/auth/logout');
    this.clearTokens();
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('GET', '/api/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request('POST', '/api/auth/forgot-password', { email });
  }

  async resetPassword(userId: string, resetToken: string, password: string, passwordConfirm: string) {
    return this.request('POST', '/api/auth/reset-password', {
      userId,
      resetToken,
      password,
      passwordConfirm,
    });
  }

  async changePassword(currentPassword: string, newPassword: string, newPasswordConfirm?: string) {
    return this.request('POST', '/api/auth/change-password', {
      currentPassword,
      newPassword,
      newPasswordConfirm: newPasswordConfirm || newPassword,
    });
  }

  // User Profile endpoints
  async getProfile() {
    return this.request<any>('GET', '/api/user/profile');
  }

  async updateProfile(data: any) {
    return this.request<any>('PUT', '/api/user/profile', data);
  }

  // Organization endpoints
  async createOrganization(name: string, description: string) {
    return this.request<any>('POST', '/api/organizations', { name, description });
  }

  async getOrganizations(page: number = 1, limit: number = 10) {
    return this.request<any>('GET', `/api/organizations?page=${page}&limit=${limit}`);
  }

  async getOrganization(id: string) {
    return this.request<any>('GET', `/api/organizations/${id}`);
  }

  async updateOrganization(id: string, name: string, description: string) {
    return this.request<any>('PUT', `/api/organizations/${id}`, { name, description });
  }

  // API Keys endpoints
  async listApiKeys() {
    return this.request<any[]>('GET', '/api/user/api-keys');
  }

  async createApiKey(label: string) {
    return this.request<any>('POST', '/api/user/api-keys', { label });
  }

  async revokeApiKey(id: string) {
    return this.request<any>('DELETE', `/api/user/api-keys/${id}`);
  }

  async deleteOrganization(id: string) {
    return this.request('DELETE', `/api/organizations/${id}`);
  }

  async getOrganizationMembers(id: string, page: number = 1, limit: number = 20) {
    return this.request<any>('GET', `/api/organizations/${id}/members?page=${page}&limit=${limit}`);
  }

  async inviteOrganizationMember(id: string, email: string, role: string) {
    return this.request<any>('POST', `/api/organizations/${id}/members/invite`, { email, role });
  }

  async updateOrganizationMemberRole(orgId: string, memberId: string, role: string) {
    return this.request<any>('PUT', `/api/organizations/${orgId}/members/${memberId}`, { role });
  }

  async removeOrganizationMember(orgId: string, memberId: string) {
    return this.request('DELETE', `/api/organizations/${orgId}/members/${memberId}`);
  }

  async leaveOrganization(id: string) {
    return this.request('POST', `/api/organizations/${id}/leave`);
  }

  // Project endpoints
  async createProject(name: string, description: string, icon: string, color: string, organizationId?: string) {
    return this.request<any>('POST', '/api/projects', { name, description, icon, color, organizationId });
  }

  async getProjects(page: number = 1, limit: number = 20, archived: boolean = false) {
    return this.request<any>('GET', `/api/projects?page=${page}&limit=${limit}&archived=${archived}`);
  }

  async getProject(id: string) {
    return this.request<any>('GET', `/api/projects/${id}`);
  }

  async updateProject(id: string, name: string, description: string, icon: string, color: string) {
    return this.request<any>('PUT', `/api/projects/${id}`, { name, description, icon, color });
  }

  async archiveProject(id: string) {
    return this.request<any>('POST', `/api/projects/${id}/archive`);
  }

  async unarchiveProject(id: string) {
    return this.request<any>('POST', `/api/projects/${id}/unarchive`);
  }

  async deleteProject(id: string) {
    return this.request('DELETE', `/api/projects/${id}`);
  }

  async getProjectStats(id: string) {
    return this.request<any>('GET', `/api/projects/${id}/stats`);
  }

  async inviteMember(projectId: string, email: string, role: string) {
    return this.request<any>('POST', `/api/projects/${projectId}/members/invite`, { email, role });
  }

  async getProjectMembers(projectId: string, page: number = 1, limit: number = 20) {
    return this.request<any>('GET', `/api/projects/${projectId}/members?page=${page}&limit=${limit}`);
  }

  async removeMember(projectId: string, memberId: string) {
    return this.request('DELETE', `/api/projects/${projectId}/members/${memberId}`);
  }

  async updateMemberRole(projectId: string, memberId: string, role: string) {
    return this.request<any>('PUT', `/api/projects/${projectId}/members/${memberId}`, { role });
  }

  // Task endpoints
  async createTask(
    projectId: string,
    title: string,
    description: string,
    priority: string,
    status: string,
    dueDate?: string,
    assigneeId?: string
  ) {
    return this.request<any>('POST', '/api/tasks', {
      projectId,
      title,
      description,
      priority,
      status,
      dueDate,
      assigneeId,
    });
  }

  async getProjectTasks(
    projectId: string,
    page: number = 1,
    limit: number = 50,
    status?: string,
    priority?: string,
    assigneeId?: string
  ) {
    let url = `/api/tasks/project/${projectId}?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    if (assigneeId) url += `&assigneeId=${assigneeId}`;
    return this.request<any>('GET', url);
  }

  async getMyTasks(page: number = 1, limit: number = 50, status?: string, priority?: string) {
    let url = `/api/tasks/my/tasks?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    return this.request<any>('GET', url);
  }

  async getTask(id: string) {
    return this.request<any>('GET', `/api/tasks/${id}`);
  }

  async updateTask(
    id: string,
    title: string,
    description: string,
    priority: string,
    status: string,
    dueDate?: string,
    assigneeId?: string
  ) {
    return this.request<any>('PUT', `/api/tasks/${id}`, {
      title,
      description,
      priority,
      status,
      dueDate,
      assigneeId,
    });
  }

  async deleteTask(id: string) {
    return this.request('DELETE', `/api/tasks/${id}`);
  }

  // Comment endpoints
  async createComment(taskId: string, content: string) {
    return this.request<any>('POST', `/api/tasks/${taskId}/comments`, { content });
  }

  async getTaskComments(taskId: string, page: number = 1, limit: number = 50) {
    return this.request<any>('GET', `/api/tasks/${taskId}/comments?page=${page}&limit=${limit}`);
  }

  async updateComment(taskId: string, commentId: string, content: string) {
    return this.request<any>('PUT', `/api/tasks/${taskId}/comments/${commentId}`, { content });
  }

  async deleteComment(taskId: string, commentId: string) {
    return this.request('DELETE', `/api/tasks/${taskId}/comments/${commentId}`);
  }

  // Task attachments
  async uploadTaskAttachment(taskId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    // Use axios directly to preserve multipart headers
    const response = await this.client.post<{ success: boolean; data: any }>(`/api/tasks/${taskId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }

  async deleteTaskAttachment(taskId: string, attachmentId: string) {
    return this.request<any>('DELETE', `/api/tasks/${taskId}/attachments/${attachmentId}`);
  }

  // AI endpoints
  async getAIStatus() {
    return this.request<any>('GET', '/api/ai/status');
  }

  async getPlatformStatus() {
    return this.request<any>('GET', 'status');
  }

  async generateTaskSummary(taskTitle: string, taskDescription: string) {
    return this.request<any>('POST', 'ai/task-summary', { taskTitle, taskDescription });
  }

  async generateTaskTitle(description: string) {
    return this.request<any>('POST', 'ai/generate-task-title', { description });
  }

  async analyzeTeamPerformance() {
    return this.request<any>('POST', 'ai/team-performance');
  }

  async generateBusinessInsights() {
    return this.request<any>('POST', 'ai/business-insights');
  }

  async generateProjectRecommendations(projectId: string) {
    return this.request<any>('POST', 'ai/project-recommendations', { projectId });
  }

  // Billing endpoints
  async getPlans() {
    return this.request<any>('GET', '/api/billing/plans');
  }

  async getSubscription(organizationId: string) {
    return this.request<any>('GET', `/api/billing/subscriptions/${organizationId}`);
  }

  async createCheckoutSession(organizationId: string, plan: 'pro' | 'enterprise', billingPeriod: 'monthly' | 'annual' = 'monthly') {
    return this.request<any>('POST', '/api/billing/checkout', { organizationId, plan, billingPeriod });
  }

  async getInvoices(organizationId: string, page: number = 1, limit: number = 10) {
    return this.request<any>('GET', `/api/billing/invoices/${organizationId}?page=${page}&limit=${limit}`);
  }

  async cancelSubscription(organizationId: string) {
    return this.request<any>('POST', `/api/billing/subscriptions/${organizationId}/cancel`);
  }

  async downloadInvoice(invoiceId: string) {
    return this.request<any>('GET', `/api/billing/invoices/${invoiceId}/download`);
  }

  async getBillingUsage(organizationId: string) {
    return this.request<any>('GET', `/api/billing/usage/${organizationId}`);
  }

  async updateBillingInfo(
    organizationId: string,
    billingName: string,
    billingEmail: string,
    billingAddress: string
  ) {
    return this.request<any>('PUT', `/api/billing/billing-info/${organizationId}`, {
      billingName,
      billingEmail,
      billingAddress,
    });
  }

  // User endpoints
  async getUserProfile() {
    return this.request<any>('GET', '/api/user/profile');
  }

  async updateUserProfile(firstName: string, lastName: string, bio: string, phone: string) {
    return this.request<any>('PUT', '/api/user/profile', { firstName, lastName, bio, phone });
  }

  async getUserPreferences() {
    return this.request<any>('GET', '/api/user/preferences');
  }

  async updateUserPreferences(theme: string, notifications: any, language: string, timezone: string, emailDigest?: string) {
    return this.request<any>('PUT', '/api/user/preferences', { theme, notifications, language, timezone, emailDigest });
  }

  async getUserActivity(page: number = 1, limit: number = 20) {
    return this.request<any>('GET', `users/activity?page=${page}&limit=${limit}`);
  }

  async getUserSessions() {
    return this.request<any>('GET', 'user/sessions');
  }

  async logoutFromSession(sessionId: string) {
    return this.request('DELETE', `user/sessions/${sessionId}`);
  }

  async logoutFromAllSessions() {
    return this.request('POST', 'user/sessions/logout-all');
  }

  async getUserStats() {
    // Return mock stats since endpoint doesn't exist yet
    return Promise.resolve({
      tasksCompleted: 24,
      projectsActive: 5,
      teamMembers: 12,
      upcomingDeadlines: 3,
    });
  }

  // Admin endpoints
  async getAllUsers(page: number = 1, limit: number = 50, search?: string) {
    let url = `admin/users?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    return this.request<any>('GET', url);
  }

  async getAllOrganizations(page: number = 1, limit: number = 50, search?: string) {
    let url = `admin/organizations?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    return this.request<any>('GET', url);
  }

  async getSystemStats() {
    return this.request<any>('GET', 'admin/system/stats');
  }

  async getAuditLogs(page: number = 1, limit: number = 50, action?: string, resourceType?: string) {
    let url = `admin/audit-logs?page=${page}&limit=${limit}`;
    if (action) url += `&action=${action}`;
    if (resourceType) url += `&resourceType=${resourceType}`;
    return this.request<any>('GET', url);
  }

  async deactivateUser(userId: string) {
    return this.request<any>('POST', `admin/users/${userId}/deactivate`);
  }

  async activateUser(userId: string) {
    return this.request<any>('POST', `admin/users/${userId}/activate`);
  }

  async deleteUser(userId: string) {
    return this.request('DELETE', `admin/users/${userId}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
