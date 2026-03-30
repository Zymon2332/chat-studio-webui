import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { Login } from "@/pages/Login";
import { mainRoutes } from "./chat";

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <ProtectedRoute requireAuth={false}>
        <Login />
      </ProtectedRoute>
    ),
  },
  ...mainRoutes,
];
