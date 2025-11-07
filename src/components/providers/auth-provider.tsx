"use client";

import { createContext, useContext, useMemo, useState } from "react";
import useSWR from "swr";
import type { ReactNode } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
  department: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => void;
  setUser: (user: AuthUser | null) => void;
}

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }
    return response.json();
  });

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: AuthUser | null;
}) => {
  const [localUser, setLocalUser] = useState<AuthUser | null>(initialUser);
  const { data, isLoading, mutate } = useSWR<{ user: AuthUser | null }>(
    "/api/me",
    fetcher,
    {
      revalidateOnFocus: false,
      fallbackData: { user: initialUser },
    },
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data?.user ?? localUser ?? null,
      loading: isLoading,
      refresh: () => {
        void mutate();
      },
      setUser: (user: AuthUser | null) => {
        setLocalUser(user);
        void mutate({ user }, false);
      },
    }),
    [data?.user, isLoading, localUser, mutate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
