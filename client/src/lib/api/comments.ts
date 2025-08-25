import { get, post, axiosDelete } from "./api-client";
import { createUrl } from "./api-client";

export type Comment = {
  id: string;
  productId: string;
  userId: string;
  username?: string | null;
  userDisplayName?: string | null;
  content: string;
  createdAt: string;
};

export const listProductComments = async (productId: string): Promise<Comment[]> => {
  // Prefer public endpoint under products; falls back to comments router if needed
  try {
    const res = await get(createUrl(`/api/products/${productId}/comments`));
    return res.data ?? [];
  } catch (e) {
    const res = await get(createUrl(`/api/comments/product/${productId}`));
    return res.data ?? [];
  }
};

export const addComment = async (productId: string, content: string): Promise<Comment> => {
  const res = await post(createUrl(`/api/comments`), { productId, content });
  return res.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await axiosDelete(createUrl(`/api/comments/${commentId}`));
};
