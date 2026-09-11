import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./validation";

describe("registerSchema", () => {
  const valid = {
    username: "alice_01",
    phone: "13800138000",
    password: "secret123",
  };

  it("接受合法的注册输入", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("拒绝过短的账号名", () => {
    const result = registerSchema.safeParse({ ...valid, username: "ab" });
    expect(result.success).toBe(false);
  });

  it("拒绝含非法字符的账号名", () => {
    const result = registerSchema.safeParse({ ...valid, username: "bad name!" });
    expect(result.success).toBe(false);
  });

  it("拒绝非法手机号", () => {
    expect(registerSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(
      false,
    );
    expect(
      registerSchema.safeParse({ ...valid, phone: "22800138000" }).success,
    ).toBe(false);
  });

  it("拒绝过短的密码", () => {
    const result = registerSchema.safeParse({ ...valid, password: "123" });
    expect(result.success).toBe(false);
  });

  it("去除账号名与手机号首尾空白", () => {
    const parsed = registerSchema.parse({
      username: "  bob_2  ",
      phone: " 13900139000 ",
      password: "secret123",
    });
    expect(parsed.username).toBe("bob_2");
    expect(parsed.phone).toBe("13900139000");
  });
});

describe("loginSchema", () => {
  it("接受合法的登录输入", () => {
    const result = loginSchema.safeParse({
      username: "alice_01",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("拒绝缺少密码的输入", () => {
    const result = loginSchema.safeParse({ username: "alice_01" });
    expect(result.success).toBe(false);
  });
});
