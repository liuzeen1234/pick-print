import { env } from "./env";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * 通用 fetch 封装：自动拼接 baseURL、JSON 序列化、错误处理。
 * 用法：const data = await apiFetch<User>("/users/1")
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const url = path.startsWith("http") ? path : `${env.apiBaseUrl}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new ApiError(res.status, `请求失败：${res.status} ${res.statusText}`);
  }

  // 204 无内容
  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
