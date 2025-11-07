import { auth } from "./firebase";

async function getAuthHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export const usersApi = {
  createProfile: (data: { displayName: string; bio?: string; photoURL?: string }) =>
    apiRequest("/users/profile", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () => apiRequest("/users/profile"),

  updateProfile: (data: { displayName?: string; bio?: string; photoURL?: string }) =>
    apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  findByPin: (pin: string) => apiRequest(`/users/by-pin/${pin}`),
};

export const chatsApi = {
  create: (participantId: string) =>
    apiRequest("/chats/create", {
      method: "POST",
      body: JSON.stringify({ participantId }),
    }),

  list: () => apiRequest("/chats/list"),

  get: (chatId: string) => apiRequest(`/chats/${chatId}`),

  markAsRead: (chatId: string) =>
    apiRequest(`/chats/${chatId}/read`, {
      method: "PUT",
    }),
};

export const uploadApi = {
  image: async (file: File): Promise<{ url: string }> => {
    const token = await auth.currentUser?.getIdToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload/image", {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  },
};
