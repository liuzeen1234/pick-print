"use client";

import { useState } from "react";

interface AdminUser {
  id: string;
  username: string;
  phone: string;
  opLevel: number;
  createdAt: string;
}

interface Props {
  initialUsers: AdminUser[];
  currentUserId: string;
  adminOpLevel: number;
}

const OP_LEVELS = [1, 2, 3, 4] as const;

export function UserOpLevelTable({ initialUsers, currentUserId, adminOpLevel }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function updateOpLevel(user: AdminUser, opLevel: number) {
    if (opLevel === user.opLevel) return;
    setError(null);
    setNotice(null);
    setSavingId(user.id);

    // 乐观更新，失败时回滚
    const previous = user.opLevel;
    setUsers((list) =>
      list.map((u) => (u.id === user.id ? { ...u, opLevel } : u)),
    );

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, opLevel }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        setError(data?.message ?? "更新失败，请稍后重试");
        setUsers((list) =>
          list.map((u) => (u.id === user.id ? { ...u, opLevel: previous } : u)),
        );
        return;
      }

      setNotice(`已将 ${user.username} 的 op 等级更新为 ${opLevel}`);
    } catch {
      setError("网络错误，请稍后重试");
      setUsers((list) =>
        list.map((u) => (u.id === user.id ? { ...u, opLevel: previous } : u)),
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-green-600">
          {notice}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 font-medium">账号名</th>
              <th className="px-4 py-3 font-medium">手机号</th>
              <th className="px-4 py-3 font-medium">注册时间</th>
              <th className="px-4 py-3 font-medium">op 等级</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                >
                  <td className="px-4 py-3 font-medium">
                    {user.username}
                    {isSelf && (
                      <span className="ml-2 text-xs text-gray-400">（我）</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.phone}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleString("zh-CN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`op-${user.id}`}>
                      {user.username} 的 op 等级
                    </label>
                    <select
                      id={`op-${user.id}`}
                      value={user.opLevel}
                      disabled={savingId === user.id}
                      onChange={(e) =>
                        updateOpLevel(user, Number(e.target.value))
                      }
                      className="rounded-md border border-gray-300 bg-transparent px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 dark:border-gray-700"
                    >
                      {OP_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                          {level >= adminOpLevel ? "（管理员）" : ""}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
