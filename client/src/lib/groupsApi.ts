
import { apiRequest } from "./api";

export const groupsApi = {
  create: (data: { name: string; description?: string; memberIds: string[]; avatar?: string }) =>
    apiRequest("/groups/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => apiRequest("/groups/list"),

  addMembers: (groupId: string, memberIds: string[]) =>
    apiRequest(`/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify({ memberIds }),
    }),

  removeMember: (groupId: string, memberId: string) =>
    apiRequest(`/groups/${groupId}/members/${memberId}`, {
      method: "DELETE",
    }),

  updateSettings: (groupId: string, settings: any) =>
    apiRequest(`/groups/${groupId}/settings`, {
      method: "PUT",
      body: JSON.stringify({ settings }),
    }),
};

export const messagesApi = {
  search: (chatId: string, params: { query?: string; startDate?: number; endDate?: number }) =>
    apiRequest(`/messages/${chatId}/search?${new URLSearchParams(params as any)}`),

  getMessages: (chatId: string, params: { limit?: number; before?: number }) =>
    apiRequest(`/messages/${chatId}/messages?${new URLSearchParams(params as any)}`),
};

export const notificationsApi = {
  registerToken: (fcmToken: string, platform: string) =>
    apiRequest("/notifications/register-token", {
      method: "POST",
      body: JSON.stringify({ fcmToken, platform }),
    }),

  updatePreferences: (preferences: {
    enablePush?: boolean;
    enableInApp?: boolean;
    enableEmail?: boolean;
    muteUntil?: string;
    mutedChats?: string[];
  }) =>
    apiRequest("/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    }),
};
