"use client";

import { AuthGuard } from "@/components/auth-guard";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
	return (
		<AuthGuard>
			<div className="min-h-screen bg-background">
				<main className="container mx-auto px-4 py-8">
					<Dashboard />
				</main>
			</div>
		</AuthGuard>
	);
}
