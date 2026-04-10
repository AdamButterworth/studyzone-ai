"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileFetchedFor = useRef<string | null>(null);

  const supabase = createClient();

  const loadProfile = useCallback(async (userId: string) => {
    // Deduplicate: skip if we already fetched/are fetching for this user
    if (profileFetchedFor.current === userId) return;
    profileFetchedFor.current = userId;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error.code, error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Profile fetch exception:", err);
      setProfile(null);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // getSession() reads from cookies — instant, no network call
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Auth bootstrap error:", sessionError.message);
        }

        const sessionUser = session?.user ?? null;

        if (mounted) {
          setUser(sessionUser);
          setLoading(false); // Unblock data fetches immediately

          // Fetch profile in background (non-blocking)
          if (sessionUser) {
            loadProfile(sessionUser.id);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (mounted) setLoading(false);
      }
    };

    // Safety: if bootstrap hangs, force loading=false after 4s
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth bootstrap timeout — forcing loading=false");
        setLoading(false);
      }
    }, 4000);

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;

      if (!mounted) return;

      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Reset dedup ref on SIGNED_IN so profile re-fetches for new user
        if (event === "SIGNED_IN") {
          profileFetchedFor.current = null;
        }
        loadProfile(currentUser.id);
      } else {
        profileFetchedFor.current = null;
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    profileFetchedFor.current = null;
    try {
      await fetch("/auth/signout", { method: "POST" });
    } catch (err) {
      console.error("Sign out error:", err);
    }
    window.location.assign("/login");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
