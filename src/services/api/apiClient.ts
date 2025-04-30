// src/services/api/apiClient.ts

const API_BASE_URL = 'http://220.158.78.114:8081';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

export class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  setAuthToken(token: string): void {
    this.headers = {
      ...this.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  clearAuthToken(): void {
    delete this.headers['Authorization']; // Remove the Authorization header directly
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = MAX_RETRIES
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        if (response.status === 500) {
          console.warn(`Server returned 500 Internal Server Error`);
          if (retries <= 0) {
            throw new Error(`API error: ${response.status} Internal Server Error`);
          }
          await this.delay(RETRY_DELAY * 2);
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      return response;
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }

      console.warn(`Request failed, retrying (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      await this.delay(RETRY_DELAY);
      return this.fetchWithRetry(url, options, retries - 1);
    }
  }

  async get<T>(path: string, queryParams?: Record<string, string>): Promise<T> {
    let url = `${this.baseUrl}${path}`;

    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, value);
      });
      url += `?${params.toString()}`;
    }

    const response = await this.fetchWithRetry(url, {
      method: 'GET',
      headers: this.headers,
    });

    return await response.json();
  }

  async post<T>(path: string, data: Record<string, unknown>): Promise<T | null> {
    const preparedData = this.prepareDataForPost(path, data);

    const response = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(preparedData),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        console.warn("Empty JSON response body");
        return null;
      }
    }

    return null;
  }

  private prepareDataForPost(path: string, data: Record<string, unknown>): Record<string, unknown> {
    const preparedData = { ...data };

    if (path.includes('/userlist')) {
      if (!preparedData.username) preparedData.username = `user_${Date.now()}`;
      if (!preparedData.email) preparedData.email = `${preparedData.username}@example.com`;
      if (!preparedData.full_name) preparedData.full_name = preparedData.username;
      if (preparedData.password_hash === undefined) preparedData.password_hash = 'defaultpassword';
    }

    if (!preparedData.created_at) {
      preparedData.created_at = new Date().toISOString();
    }

    if (!preparedData.updated_at) {
      preparedData.updated_at = new Date().toISOString();
    }

    return preparedData;
  }

  async put<T>(path: string, data: Record<string, unknown>): Promise<T> {
    const response = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    });

    return await response.json();
  }

  async delete<T>(path: string): Promise<T> {
    const response = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    return await response.json();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health-check`, {
        method: 'GET',
        headers: this.headers,
        signal: AbortSignal.timeout(3000),
      });

      return response.ok;
    } catch {
      console.error("Health check failed");
      return false;
    }
  }
}

export const apiClient = new ApiClient();