const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Exercise {
  _id: string;
  Name: string;
  Page?: string;
  Machine_setup?: string;
  Exercise_move?: string;
  Function_target_muscles?: string;
  Strengthen?: string;
  Stretch?: string;
  Cues?: string;
  Modifications?: string;
  Contraindications?: string;
  Peel_backs?: string;
  Repetitions?: string;
  Level?: string;
  Image_URL?: string;
  Video_URL?: string;
  Machine_type?: string;
  Series?: string;
  order?: number;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem("token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "שגיאה בשרת",
      }));
      throw new Error(error.message || "שגיאה בשרת");
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  async getProfile(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>("/auth/users");
  }

  async createUser(
    email: string,
    password: string,
    role: string = "combined"
  ): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>("/auth/users", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/auth/users/${id}`, {
      method: "DELETE",
    });
  }

  async getExercises(): Promise<Exercise[]> {
    return this.request<Exercise[]>("/exercises");
  }

  async getExercise(id: string): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}`);
  }

  async syncExercises(): Promise<{ message: string; count: number }> {
    return this.request<{ message: string; count: number }>("/exercises/sync", {
      method: "POST",
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const apiClient = new ApiClient();
