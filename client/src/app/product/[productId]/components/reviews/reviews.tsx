"use client";
import React, { useEffect, useState } from "react";
import { listProductComments, addComment, deleteComment, Comment } from "@/lib/api/comments";
import { useAppStore } from "@/store/store";
import { Button, Input, Card, CardHeader, CardBody } from "@nextui-org/react";

const Reviews = ({ productId }: { productId: string }) => {
  const { userInfo, setToast } = useAppStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const rows = await listProductComments(productId);
    setComments(rows);
  };

  useEffect(() => {
    load();
  }, [productId]);

  const handleAdd = async () => {
    if (!userInfo) {
      setToast("Please login to comment.");
      return;
    }
    if (!content.trim()) return;
    setLoading(true);
    try {
      await addComment(productId, content.trim());
      setContent("");
      await load();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      await load();
    } catch (e) {
      setToast("Failed to delete comment");
    }
  };

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="text-lg font-semibold">Comments</CardHeader>
        <CardBody>
          <div className="flex gap-2 mb-4">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment"
            />
            <Button color="primary" isLoading={loading} onClick={handleAdd}>
              Post
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start justify-between border-b pb-2">
                <div>
                  <div className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                  <div>{c.content}</div>
                </div>
                {userInfo && (userInfo.isAdmin || userInfo.id === c.userId) && (
                  <Button size="sm" color="danger" variant="flat" onClick={() => handleDelete(c.id)}>
                    Delete
                  </Button>
                )}
              </div>
            ))}
            {comments.length === 0 && <div className="text-sm text-gray-500">No comments yet.</div>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Reviews;
