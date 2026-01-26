import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { AxiosError } from 'axios';

// ============ Auth Hooks ============

export const useLogin = (options?: UseMutationOptions<any, AxiosError, { email: string; password: string }>) => {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => 
      apiClient.login(credentials.email, credentials.password),
    ...options,
  });
};

export const useRegister = (options?: UseMutationOptions<any, AxiosError, any>) => {
  return useMutation({
    mutationFn: (data: any) => 
      apiClient.register(data.firstName, data.lastName, data.email, data.password, data.passwordConfirm),
    ...options,
  });
};

export const useLogout = (options?: UseMutationOptions<void, AxiosError>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
    ...options,
  });
};

export const useGetCurrentUser = (options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
    ...options,
  } as any);
};

export const useForgotPassword = (options?: UseMutationOptions<any, AxiosError, { email: string }>) => {
  return useMutation({
    mutationFn: (data: { email: string }) => apiClient.forgotPassword(data.email),
    ...options,
  });
};

export const useResetPassword = (options?: UseMutationOptions<any, AxiosError, any>) => {
  return useMutation({
    mutationFn: (data) =>
      apiClient.resetPassword(data.userId, data.resetToken, data.password, data.passwordConfirm),
    ...options,
  });
};

export const useChangePassword = (options?: UseMutationOptions<any, AxiosError, any>) => {
  return useMutation({
    mutationFn: (data) =>
      apiClient.changePassword(data.currentPassword, data.newPassword, data.newPasswordConfirm),
    ...options,
  });
};

// ============ Organization Hooks ============

export const useCreateOrganization = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.createOrganization(data.name, data.description),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useGetOrganizations = (page: number = 1, limit: number = 10, options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['organizations', page, limit],
    queryFn: () => apiClient.getOrganizations(page, limit),
    staleTime: 5 * 60 * 1000,
    ...options,
  } as any);
};

export const useGetOrganization = (id: string, options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => apiClient.getOrganization(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  } as any);
};

export const useUpdateOrganization = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.updateOrganization(data.id, data.name, data.description),
    ...options,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['organization', data.id] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useDeleteOrganization = (options?: UseMutationOptions<any, AxiosError, string>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.deleteOrganization(id),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useGetOrganizationMembers = (
  orgId: string,
  page: number = 1,
  limit: number = 20,
  options?: UseQueryOptions<any, AxiosError>
) => {
  return useQuery({
    queryKey: ['organizationMembers', orgId, page, limit],
    queryFn: () => apiClient.getOrganizationMembers(orgId, page, limit),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    ...options,
  } as any);
};

export const useInviteOrganizationMember = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.inviteOrganizationMember(data.orgId, data.email, data.role),
    ...options,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', data.orgId] });
    },
  });
};

export const useUpdateOrganizationMemberRole = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.updateOrganizationMemberRole(data.orgId, data.memberId, data.role),
    ...options,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', data.orgId] });
    },
  });
};

export const useRemoveOrganizationMember = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.removeOrganizationMember(data.orgId, data.memberId),
    ...options,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['organizationMembers', data.orgId] });
    },
  });
};

// ============ Project Hooks ============

export const useCreateProject = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.createProject(data.name, data.description, data.icon, data.color),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useGetProjects = (page: number = 1, limit: number = 20, archived: boolean = false, options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['projects', page, limit, archived],
    queryFn: () => apiClient.getProjects(page, limit, archived),
    staleTime: 5 * 60 * 1000,
    ...options,
  } as any);
};

export const useGetProject = (id: string, options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => apiClient.getProject(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  } as any);
};

export const useUpdateProject = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.updateProject(data.id, data.name, data.description, data.icon, data.color),
    ...options,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useArchiveProject = (options?: UseMutationOptions<any, AxiosError, string>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.archiveProject(id),
    ...options,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = (options?: UseMutationOptions<any, AxiosError, string>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.deleteProject(id),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useGetProjectStats = (id: string, options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['projectStats', id],
    queryFn: () => apiClient.getProjectStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  } as any);
};

// ============ Task Hooks ============

export const useCreateTask = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      apiClient.createTask(
        data.projectId,
        data.title,
        data.description,
        data.priority,
        data.status,
        data.dueDate,
        data.assigneeId ?? data.assignee
      ),
    ...options,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
  });
};

export const useGetProjectTasks = (
  projectId: string,
  page: number = 1,
  limit: number = 50,
  filters?: { status?: string; priority?: string; assigneeId?: string; assignee?: string },
  options?: UseQueryOptions<any, AxiosError>
) => {
  return useQuery({
    queryKey: ['projectTasks', projectId, page, limit, filters],
    queryFn: () =>
      apiClient.getProjectTasks(
        projectId,
        page,
        limit,
        filters?.status,
        filters?.priority,
        filters?.assigneeId ?? filters?.assignee
      ),
    enabled: !!projectId,
    staleTime: 3 * 60 * 1000,
    ...options,
  } as any);
};

export const useGetMyTasks = (
  page: number = 1,
  limit: number = 50,
  filters?: { status?: string; priority?: string },
  options?: UseQueryOptions<any, AxiosError>
) => {
  return useQuery({
    queryKey: ['myTasks', page, limit, filters],
    queryFn: () => apiClient.getMyTasks(page, limit, filters?.status, filters?.priority),
    staleTime: 3 * 60 * 1000,
    ...options,
  } as any);
};

export const useGetTask = (id: string, options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => apiClient.getTask(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    ...options,
  } as any);
};

export const useUpdateTask = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      apiClient.updateTask(
        data.id,
        data.title,
        data.description,
        data.priority,
        data.status,
        data.dueDate,
        data.assigneeId ?? data.assignee
      ),
    ...options,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
  });
};

export const useDeleteTask = (options?: UseMutationOptions<any, AxiosError, string>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.deleteTask(id),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
  });
};

// ============ Comment Hooks ============

export const useCreateComment = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.createComment(data.taskId, data.content),
    ...options,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', data.taskId] });
    },
  });
};

export const useGetTaskComments = (
  taskId: string,
  page: number = 1,
  limit: number = 50,
  options?: UseQueryOptions<any, AxiosError>
) => {
  return useQuery({
    queryKey: ['taskComments', taskId, page, limit],
    queryFn: () => apiClient.getTaskComments(taskId, page, limit),
    enabled: !!taskId,
    staleTime: 3 * 60 * 1000,
    ...options,
  } as any);
};

export const useUpdateComment = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.updateComment(data.taskId, data.commentId, data.content),
    ...options,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', data.taskId] });
    },
  });
};

export const useDeleteComment = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.deleteComment(data.taskId, data.commentId),
    ...options,
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', data.taskId] });
    },
  });
};

// ============ User Hooks ============

export const useGetUserProfile = (options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: () => apiClient.getUserProfile(),
    staleTime: 10 * 60 * 1000,
    ...options,
  } as any);
};

export const useUpdateUserProfile = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.updateUserProfile(data.firstName, data.lastName, data.bio, data.phone),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useGetUserPreferences = (options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['userPreferences'],
    queryFn: () => apiClient.getUserPreferences(),
    staleTime: 10 * 60 * 1000,
    ...options,
  } as any);
};

export const useUpdateUserPreferences = (options?: UseMutationOptions<any, AxiosError, any>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      apiClient.updateUserPreferences(data.theme, data.notifications, data.language, data.timezone),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  });
};

export const useGetUserStats = (options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: () => apiClient.getUserStats(),
    staleTime: 5 * 60 * 1000,
    ...options,
  } as any);
};

// ============ Admin Hooks ============

export const useGetAllUsers = (
  page: number = 1,
  limit: number = 50,
  search?: string,
  options?: UseQueryOptions<any, AxiosError>
) => {
  return useQuery({
    queryKey: ['allUsers', page, limit, search],
    queryFn: () => apiClient.getAllUsers(page, limit, search),
    staleTime: 5 * 60 * 1000,
    ...options,
  } as any);
};

export const useGetSystemStats = (options?: UseQueryOptions<any, AxiosError>) => {
  return useQuery({
    queryKey: ['systemStats'],
    queryFn: () => apiClient.getSystemStats(),
    staleTime: 5 * 60 * 1000,
    ...options,
  } as any);
};

// Socket helper re-exports
export { useSocket } from './socket-context';
