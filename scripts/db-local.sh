#!/usr/bin/env bash
# 本地开发用 Postgres（Docker，带持久化卷）。
# 用法：
#   bash scripts/db-local.sh up      启动数据库（数据持久化到命名卷 pickprint-pgdata）
#   bash scripts/db-local.sh down     停止数据库（数据保留）
#   bash scripts/db-local.sh psql     进入 psql 交互
#   bash scripts/db-local.sh reset    删除容器和卷（清空所有数据，慎用）
set -euo pipefail

CONTAINER=pickprint-pg
VOLUME=pickprint-pgdata
IMAGE=postgres:16

cmd="${1:-up}"

case "$cmd" in
  up)
    docker volume inspect "$VOLUME" >/dev/null 2>&1 || docker volume create "$VOLUME"
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
      docker start "$CONTAINER"
    else
      docker run -d --name "$CONTAINER" --restart unless-stopped \
        -e POSTGRES_USER=pickprint \
        -e POSTGRES_PASSWORD=pickprint \
        -e POSTGRES_DB=pickprint \
        -p 5432:5432 \
        -v "${VOLUME}:/var/lib/postgresql/data" \
        "$IMAGE"
    fi
    echo "Postgres 启动中… 连接串：postgresql://pickprint:pickprint@localhost:5432/pickprint"
    echo "首次使用记得跑：npm run db:migrate"
    ;;
  down)
    docker stop "$CONTAINER"
    ;;
  psql)
    docker exec -it "$CONTAINER" psql -U pickprint -d pickprint
    ;;
  reset)
    docker rm -f "$CONTAINER" 2>/dev/null || true
    docker volume rm "$VOLUME" 2>/dev/null || true
    echo "已删除容器和数据卷。"
    ;;
  *)
    echo "未知命令：$cmd（可用：up | down | psql | reset）"
    exit 1
    ;;
esac
