"use client";

import { AuthGuard } from "@/components/auth-guard";
import { MealCalendar } from "@/components/meal-calendar";

export default function CalendarPage() {
	return (
		<AuthGuard>
			<div className="min-h-screen bg-background">
				<main className="container mx-auto px-4 py-8">
					<MealCalendar />
				</main>
			</div>
		</AuthGuard>
	);
}
