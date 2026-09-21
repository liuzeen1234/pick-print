import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { decrementStock, incrementStock } from "@/lib/models-store";
import { calculateOrderEstimate } from "@/lib/pricing";
import { getSampleModel } from "@/lib/sample-models";
import { requireUser, UnauthorizedError } from "@/lib/session";
import { createOrderSchema } from "@/lib/validation";

/** 创建订单：订单归属、模型重量和报价均由服务端确定。 */
export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: "请先登录" }, { status: 401 });
    }
    console.error("读取登录状态失败", error);
    return NextResponse.json({ message: "无法确认登录状态" }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "请求体不是合法的 JSON" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const model = getSampleModel(input.modelId);
  if (!model) {
    return NextResponse.json({ message: "模型不存在" }, { status: 404 });
  }
  if (!model.commercialAllowed) {
    return NextResponse.json({ message: "该模型暂不支持下单" }, { status: 409 });
  }
  if (model.stock < input.quantity) {
    return NextResponse.json({ message: "库存不足，请减少数量或稍后再试" }, { status: 409 });
  }

  const estimate = calculateOrderEstimate({
    baseWeightGrams: model.estimatedWeightGrams,
    quantity: input.quantity,
  });

  // 先扣减库存，再写入订单；扣减失败（并发场景下库存不足）则直接拒绝，不创建订单。
  if (!decrementStock(model.id, input.quantity)) {
    return NextResponse.json({ message: "库存不足，请减少数量或稍后再试" }, { status: 409 });
  }

  try {
    const [order] = await db
      .insert(orders)
      .values({
        userId: user.id,
        modelId: model.id,
        modelTitle: model.title,
        material: input.material,
        color: input.color,
        quantity: input.quantity,
        estimatedWeightGrams: estimate.estimatedWeightGrams,
        priceCents: estimate.priceCents,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactAddress: input.contactAddress,
      })
      .returning({ id: orders.id, status: orders.status });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    // 订单写入失败，回滚已扣减的库存，避免库存被无谓占用。
    incrementStock(model.id, input.quantity);
    console.error("创建订单失败", error);
    const detail =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? `：${error.message}`
        : "";
    return NextResponse.json(
      { message: `创建订单失败，请稍后重试${detail}` },
      { status: 500 },
    );
  }
}
