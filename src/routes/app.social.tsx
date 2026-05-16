import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SocialAccountsManager } from "@/components/social/SocialAccountsManager";

export const Route = createFileRoute("/app/social")({
  component: SocialPage,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function SocialPage() {
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-black tracking-tight">Réseaux Sociaux</h1>
        <p className="text-sm text-muted-foreground mt-1">Connectez et gérez vos comptes Facebook, Instagram et TikTok.</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SocialAccountsManager />
      </motion.div>
    </motion.div>
  );
}

export default SocialPage;
