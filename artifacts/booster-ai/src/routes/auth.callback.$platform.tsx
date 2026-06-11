// Route de callback OAuth
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { OAuthService } from "@/lib/social/oauth";
import { SocialAccountsService } from "@/lib/social/database";
import { FacebookAPI, InstagramAPI, TikTokAPI } from "@/lib/social/platforms";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/auth/callback/$platform")({
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const { platform } = Route.useParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Traitement en cours...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
          throw new Error("Code d'autorisation manquant");
        }

        if (!OAuthService.validateState(state || "")) {
          throw new Error("État invalide - sécurité compromise");
        }

        if (!user) {
          throw new Error("Utilisateur non authentifié");
        }

        // Échanger le code contre un token
        const token = await OAuthService.exchangeCodeForToken(
          platform as "facebook" | "instagram" | "tiktok",
          code,
        );

        let accountInfo: any = {};
        let accountId = "";
        let accountName = "";

        // Récupérer les infos du compte selon la plateforme
        if (platform === "facebook") {
          const api = new FacebookAPI(token.access_token);
          const profile = await api.getUserProfile();
          accountInfo = profile;
          accountId = profile.id;
          accountName = profile.name;

          // Récupérer les pages gérées
          const pages = await api.getPages();
          if (pages.length > 0) {
            accountId = pages[0].id;
            accountName = pages[0].name;
          }
        } else if (platform === "instagram") {
          const api = new InstagramAPI(token.access_token, "me"); // sera mis à jour
          const profile = await api.getUserProfile();
          accountInfo = profile;
          accountId = profile.id;
          accountName = profile.username;
        } else if (platform === "tiktok") {
          const api = new TikTokAPI(token.access_token);
          const profile = await api.getUserInfo();
          accountInfo = profile;
          accountId = profile.open_id;
          accountName = profile.display_name;
        }

        // Créer l'enregistrement du compte social
        const account = await SocialAccountsService.createAccount({
          user_id: user.id,
          platform: platform as "facebook" | "instagram" | "tiktok",
          account_name: accountName,
          account_id: accountId,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          token_expires_at: token.expires_in
            ? new Date(Date.now() + token.expires_in * 1000).toISOString()
            : undefined,
          token_type: token.token_type || "Bearer",
          scope: token.scope,
          connected: true,
          profile_picture: accountInfo.profile_picture_url || accountInfo.picture?.data?.url,
          followers_count: accountInfo.followers_count || 0,
          verified: accountInfo.is_verified || false,
          metadata: accountInfo,
        });

        setMessage(`✓ Compte ${accountName} connecté avec succès!`);
        setStatus("success");

        // Rediriger après 2 secondes
        setTimeout(() => {
          window.location.href = "/app/social";
        }, 2000);
      } catch (error: any) {
        console.error("Erreur OAuth:", error);
        setMessage(`Erreur: ${error.message}`);
        setStatus("error");
      }
    };

    if (user) {
      handleCallback();
    }
  }, [user, platform]);

  const statusIcons = {
    loading: <Loader2 className="h-12 w-12 animate-spin text-blue-500" />,
    success: <CheckCircle2 className="h-12 w-12 text-green-500" />,
    error: <XCircle className="h-12 w-12 text-red-500" />,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        {statusIcons[status]}
        <h1 className="text-2xl font-bold text-foreground">
          {status === "loading"
            ? "Connexion en cours..."
            : status === "success"
              ? "Succès!"
              : "Erreur"}
        </h1>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>
    </div>
  );
}

export default OAuthCallbackPage;
