"use client";

import { AuthGuard } from "@/components/auth-guard";
import { MealLog } from "@/components/meal-log";

export default function LogPage() {
	return (
		<AuthGuard>
			<div className="min-h-screen bg-background">
				<main className="container mx-auto px-4 py-8">
					<MealLog />
				</main>
			</div>
		</AuthGuard>
	);
}
