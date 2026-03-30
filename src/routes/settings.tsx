import { Navigate, type RouteObject } from "react-router-dom";
import { ProtectedMainLayout } from "@/components/layout/ProtectedMainLayout";
import {
  Settings,
  GeneralSettings,
  AppearanceSettings,
  ProvidersLayout,
  InstalledProviders,
  ProviderMarket,
  ModelSettings,
  AccountSettings,
  AboutSettings,
} from "@/pages/settings";

export const settingsRoutes: RouteObject[] = [
  {
    path: "/settings",
    element: (
      <ProtectedMainLayout>
        <Settings />
      </ProtectedMainLayout>
    ),
    children: [
      { index: true, element: <Navigate to="general" replace /> },
      { path: "general", element: <GeneralSettings /> },
      { path: "appearance", element: <AppearanceSettings /> },
      {
        path: "providers",
        element: <ProvidersLayout />,
        children: [
          { index: true, element: <Navigate to="market" replace /> },
          { path: "installed", element: <InstalledProviders /> },
          { path: "market", element: <ProviderMarket /> },
        ],
      },
      { path: "models", element: <ModelSettings /> },
      { path: "account", element: <AccountSettings /> },
      { path: "about", element: <AboutSettings /> },
    ],
  },
];
