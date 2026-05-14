import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
// @ts-ignore - Ce fichier est généré automatiquement par TanStack Router
import { routeTree } from './src/routeTree.gen'; // Assurez-vous que ce chemin est correct

// Initialisation du QueryClient pour TanStack Query
const queryClient = new QueryClient();

// Création de l'instance du routeur
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

// Enregistrement du routeur pour le support de l'auto-complétion (TypeScript)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;