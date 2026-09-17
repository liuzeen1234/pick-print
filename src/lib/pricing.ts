export const STARTING_PRICE_CENTS = 200;
export const PRICE_PER_GRAM_CENTS = 30;

export interface OrderEstimateInput {
  /** 模型标准尺寸、单件的预估耗材重量（g）。 */
  baseWeightGrams: number;
  quantity: number;
}

export interface OrderEstimate {
  estimatedWeightGrams: number;
  priceCents: number;
}

/** 按模型标准尺寸与数量计算预估重量和报价。 */
export function calculateOrderEstimate({
  baseWeightGrams,
  quantity,
}: OrderEstimateInput): OrderEstimate {
  const estimatedWeightGrams = Math.ceil(baseWeightGrams * quantity);
  const materialPriceCents =
    estimatedWeightGrams * PRICE_PER_GRAM_CENTS;

  return {
    estimatedWeightGrams,
    priceCents: Math.max(STARTING_PRICE_CENTS, materialPriceCents),
  };
}

export function formatPrice(priceCents: number) {
  return `¥${(priceCents / 100).toFixed(2)}`;
}
