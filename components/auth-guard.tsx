"use client";

import type React from "react";

import { useAuth } from "@/lib/auth-context";
import { LoginPage } from "./login-page";

interface AuthGuardProps {
	children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return <LoginPage />;
	}

	return <>{children}</>;
}
