"use client";
import React, { useEffect, useState } from "react";
import { listProductComments, addComment, deleteComment, Comment } from "@/lib/api/comments";
import { useAppStore } from "@/store/store";
import { Button, Input, CardHeader, CardBody, Card } from "@/components/ui/nextui-shim";

function timeAgo(iso: string) {
  const dt = new Date(iso);
  const diff = Date.now() - dt.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  return dt.toLocaleDateString();
}

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
    <div className="mt-12 max-w-4xl">
      <h3 className="text-2xl font-semibold mb-4">Customer comments</h3>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-base font-semibold">Write a comment</CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={userInfo ? "What do you want to share?" : "Login to write a comment"}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-primary resize-y"
              />
              <div className="flex justify-end">
                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleAdd}
                  isDisabled={!content.trim()}
                  className="px-6"
                >
                  Post
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
        <div className="flex flex-col gap-5">
          {comments.map((c) => {
            const display = c.userDisplayName || c.username || "User";
            return (
              <div key={c.id} className="flex gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {display[0]?.toUpperCase()}
                </div>
                <div className="flex-1 border-b pb-4">
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="font-semibold">{display}</span>
                    <span className="text-gray-500">• {timeAgo(c.createdAt)}</span>
                  </div>
                  <div className="mt-2 text-sm leading-relaxed whitespace-pre-line">{c.content}</div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <button className="hover:underline">Helpful</button>
                    <span>|</span>
                    {(userInfo && (userInfo.isAdmin || userInfo.id === c.userId)) && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {comments.length === 0 && <div className="text-sm text-gray-500">No comments yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
