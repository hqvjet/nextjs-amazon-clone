import { get } from "./api-client";
import { createUrl } from "./api-client";
import { ProductType } from "@/utils/types";

export const getSellerProductsByEmail = async (
  email: string
): Promise<ProductType[]> => {
  const res = await get(
    createUrl(`/api/sellers/${encodeURIComponent(email)}/products`)
  );
  return res.data ?? [];
};
