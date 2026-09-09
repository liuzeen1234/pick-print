/**
 * 环境变量集中读取，带默认值与类型。
 * 避免在业务代码里散落 process.env.XXX，方便统一管理和校验。
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`缺少必需的环境变量：${name}`);
  }
  return value;
}

export const env = {
  // 客户端可见（NEXT_PUBLIC_ 前缀）
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // 服务端专用
  apiBaseUrl: process.env.API_BASE_URL ?? "",
  isProd: process.env.NODE_ENV === "production",
};

export { required };
