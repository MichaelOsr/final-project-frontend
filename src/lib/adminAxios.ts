import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

const ADMIN_AUTH_BASE_PATH = "/admin/auth";
const ADMIN_REFRESH_PATH = `${ADMIN_AUTH_BASE_PATH}/refresh`;

type UnauthorizedHandler = () => void;

export interface AdminAxiosRequestConfig extends AxiosRequestConfig {
  skipAdminRefresh?: boolean;
}

interface AdminRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAdminRefresh?: boolean;
}

interface CreateAdminHttpClientOptions {
  baseURL?: string;
  withCredentials?: boolean;
  refreshPath?: string;
}

function createBaseClient({ baseURL, withCredentials = true }: CreateAdminHttpClientOptions) {
  return axios.create({
    baseURL,
    withCredentials,
  });
}

function shouldAttemptRefresh(error: AxiosError, config?: AdminRequestConfig) {
  if (error.response?.status !== 401 || !config || config._retry || config.skipAdminRefresh) {
    return false;
  }

  return true;
}

function createAdminHttpClient(options: CreateAdminHttpClientOptions = {}) {
  const refreshPath = options.refreshPath ?? ADMIN_REFRESH_PATH;
  const client = createBaseClient(options);
  const refreshClient = createBaseClient(options);

  let onUnauthorized: UnauthorizedHandler | null = null;
  let refreshPromise: Promise<unknown> | null = null;

  const runRefresh = () => {
    if (!refreshPromise) {
      refreshPromise = refreshClient
        .post(refreshPath, undefined, {
          skipAdminRefresh: true,
        } as AdminAxiosRequestConfig)
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  };

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as AdminRequestConfig | undefined;

      if (!shouldAttemptRefresh(error, config)) {
        return Promise.reject(error);
      }

      if (!config) {
        return Promise.reject(error);
      }

      config._retry = true;

      try {
        await runRefresh();
        return client(config);
      } catch (refreshError) {
        onUnauthorized?.();
        return Promise.reject(refreshError);
      }
    },
  );

  return {
    client,
    setUnauthorizedHandler(handler: UnauthorizedHandler) {
      onUnauthorized = handler;
    },
  };
}

const { client: adminAxios, setUnauthorizedHandler } = createAdminHttpClient({
  baseURL: import.meta.env.VITE_API_URL,
});

export function setOnAdminUnauthorized(handler: UnauthorizedHandler) {
  setUnauthorizedHandler(handler);
}

export function withAdminRefreshBypass(config: AxiosRequestConfig = {}) {
  return {
    ...config,
    skipAdminRefresh: true,
  } as AdminAxiosRequestConfig;
}

export default adminAxios as AxiosInstance;
