"use client";

import { AuthGuard } from "@/components/auth-guard";
import { MealLog } from "@/components/meal-log";
import { UserMenu } from "@/components/user-menu";

export default function LogPage() {
	return (
		<AuthGuard>
			<div className="min-h-screen bg-background">
				<header className="border-b">
					<div className="container mx-auto px-4 py-4 flex justify-between items-center">
						<h1 className="text-2xl font-bold">Daily Meal Tracker</h1>
						<UserMenu />
					</div>
				</header>
				<main className="container mx-auto px-4 py-8">
					<MealLog />
				</main>
			</div>
		</AuthGuard>
	);
}
