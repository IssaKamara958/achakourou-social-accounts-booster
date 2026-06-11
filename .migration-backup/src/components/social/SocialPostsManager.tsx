// Composant pour gérer les publications sociales
import { useState } from "react";
import { useSocialPosts } from "@/hooks/use-social-accounts";
import { SocialPostsService } from "@/lib/social/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Check, Clock } from "lucide-react";

interface SocialPostsManagerProps {
  accountId: string;
}

export function SocialPostsManager({ accountId }: SocialPostsManagerProps) {
  const { posts, isLoading, isCreating, isDeleting, createPost, deletePost, publishPost } =
    useSocialPosts(accountId);
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [status, setStatus] = useState<"draft" | "scheduled">("draft");
  const [scheduledDate, setScheduledDate] = useState("");

  const handleCreatePost = async () => {
    if (!caption.trim()) return;

    const postData = {
      account_id: accountId,
      caption: caption.trim(),
      hashtags: hashtags
        .split(/[\s,]+/)
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)),
      media_urls: [],
      media_types: [],
      status,
      scheduled_at: status === "scheduled" ? scheduledDate : undefined,
      cross_posted: false,
      cross_posted_platforms: [],
      platform: "tiktok" as const,
      analytics: {},
      metadata: {},
    };

    await createPost(postData);
    setCaption("");
    setHashtags("");
    setStatus("draft");
    setScheduledDate("");
    setIsOpen(false);
  };

  const statusColors = {
    draft: "bg-gray-500",
    scheduled: "bg-yellow-500",
    published: "bg-green-500",
    failed: "bg-red-500",
  };

  const statusIcons = {
    draft: null,
    scheduled: <Clock className="h-4 w-4" />,
    published: <Check className="h-4 w-4" />,
    failed: null,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Mes Publications</CardTitle>
            <CardDescription>Gérez vos contenus sociaux</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Publication
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une Publication</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle publication pour votre compte
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Contenu</label>
                  <Textarea
                    placeholder="Écrivez votre contenu..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Hashtags</label>
                  <Input
                    placeholder="#tag1 #tag2 #tag3"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "draft" | "scheduled")}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="scheduled">Programmé</option>
                  </select>
                </div>

                {status === "scheduled" && (
                  <div>
                    <label className="text-sm font-medium">Date & Heure</label>
                    <Input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}

                <Button onClick={handleCreatePost} disabled={isCreating} className="w-full">
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune publication</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-foreground">{post.caption}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[post.status]}>
                          {statusIcons[post.status] && (
                            <span className="mr-1">{statusIcons[post.status]}</span>
                          )}
                          {post.status}
                        </Badge>
                        {post.hashtags.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {post.hashtags.join(" ")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SocialPostsManager;
