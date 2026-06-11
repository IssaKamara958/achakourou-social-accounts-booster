// Composant pour connecter/afficher les comptes sociaux
import { useState } from "react";
import { useSocialAccounts } from "@/hooks/use-social-accounts";
import { OAuthService } from "@/lib/social/oauth";
import { SocialAccountsService } from "@/lib/social/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export function SocialAccountsManager() {
  const { accounts, isLoading, isDeleting, deleteAccount } = useSocialAccounts();
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const handleConnect = async (platform: "facebook" | "instagram" | "tiktok") => {
    try {
      setConnectingPlatform(platform);
      const authUrl = OAuthService.getAuthUrl(platform);
      window.location.href = authUrl;
    } catch (error) {
      console.error(`Erreur connexion ${platform}:`, error);
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  const platformColors = {
    facebook: "bg-blue-600",
    instagram: "bg-gradient-to-r from-purple-600 to-pink-600",
    tiktok: "bg-black",
  };

  const platformLabels = {
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comptes Sociaux Connectés</CardTitle>
          <CardDescription>Gérez vos connexions aux réseaux sociaux</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun compte connecté</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                    {account.profile_picture && (
                      <img
                        src={account.profile_picture}
                        alt={account.account_name}
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{account.account_name}</p>
                      <p className="text-xs text-muted-foreground">{account.account_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={platformColors[account.platform]}>
                      {platformLabels[account.platform]}
                    </Badge>
                    {account.connected && <Badge variant="outline">Connecté</Badge>}
                    {account.followers_count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {account.followers_count.toLocaleString()} followers
                      </span>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isDeleting}>
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Déconnecter"
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Déconnecter le compte</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir déconnecter {account.account_name}? Cette action
                          ne peut pas être annulée.
                        </AlertDialogDescription>
                        <div className="flex justify-end gap-2">
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDisconnect(account.id)}>
                            Déconnecter
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter des Comptes</CardTitle>
          <CardDescription>Connectez vos comptes réseaux sociaux à ACAB</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Button
              onClick={() => handleConnect("facebook")}
              disabled={connectingPlatform === "facebook"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connectingPlatform === "facebook" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Connecter Facebook
            </Button>

            <Button
              onClick={() => handleConnect("instagram")}
              disabled={connectingPlatform === "instagram"}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {connectingPlatform === "instagram" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Connecter Instagram
            </Button>

            <Button
              onClick={() => handleConnect("tiktok")}
              disabled={connectingPlatform === "tiktok"}
              className="bg-black hover:bg-gray-900"
            >
              {connectingPlatform === "tiktok" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connecter TikTok
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SocialAccountsManager;
