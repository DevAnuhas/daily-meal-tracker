"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./auth";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => subscription?.unsubscribe();
	}, []);

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		setUser(null);
		setSession(null);
	};

	return (
		<AuthContext.Provider
			value={{ user, session, loading, signOut: handleSignOut }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
