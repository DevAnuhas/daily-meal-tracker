"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { supabase, type Meal } from "@/lib/supabase-client";
import { useAuth } from "@/lib/auth-context";
import { formatDate, getMealCountForDate } from "@/lib/meal-utils";
import { useToast } from "@/hooks/use-toast";

export function MealCalendar() {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [loading, setLoading] = useState(true);
	const [optimisticUpdates, setOptimisticUpdates] = useState<
		Record<string, Partial<Meal>>
	>({});
	const { toast } = useToast();
	const router = useRouter();
	const { user } = useAuth();

	useEffect(() => {
		if (user) {
			fetchMeals();
		}
	}, [user]);

	async function fetchMeals() {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("meals")
				.select("*")
				.eq("user_id", user?.id)
				.order("date", { ascending: false });

			if (error) {
				console.error("Supabase error:", error);
				throw error;
			}

			setMeals(data || []);
		} catch (error) {
			console.error("Error fetching meals:", error);
			toast({
				title: "Error",
				description: "Failed to fetch meals",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}

	async function updateMeal(date: string, field: keyof Meal, value: boolean) {
		// Optimistic update
		const optimisticKey = `${date}-${field}`;
		setOptimisticUpdates((prev) => ({
			...prev,
			[optimisticKey]: { [field]: value },
		}));

		// Update local state immediately
		setMeals((prev) => {
			const existing = prev.find((m) => m.date === date);
			if (existing) {
				return prev.map((m) =>
					m.date === date ? { ...m, [field]: value } : m,
				);
			} else {
				const newMeal: Meal = {
					id: crypto.randomUUID(),
					user_id: user?.id || "",
					date,
					breakfast: field === "breakfast" ? value : true,
					lunch: field === "lunch" ? value : true,
					dinner: field === "dinner" ? value : true,
					breakfast_paid: false,
					lunch_paid: false,
					dinner_paid: false,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};
				return [newMeal, ...prev].sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				);
			}
		});

		try {
			const { error } = await supabase.from("meals").upsert(
				{
					date,
					user_id: user?.id,
					[field]: value,
				},
				{
					onConflict: "user_id,date",
				},
			);

			if (error) {
				console.error("Supabase error:", error);
				throw error;
			}

			// Remove optimistic update on success
			setOptimisticUpdates((prev) => {
				const newUpdates = { ...prev };
				delete newUpdates[optimisticKey];
				return newUpdates;
			});

			toast({
				title: "Success",
				description: "Meal updated successfully",
			});
		} catch (error) {
			console.error("Error updating meal:", error);

			// Revert optimistic update on error
			setOptimisticUpdates((prev) => {
				const newUpdates = { ...prev };
				delete newUpdates[optimisticKey];
				return newUpdates;
			});

			// Revert local state
			fetchMeals();

			toast({
				title: "Error",
				description: "Failed to update meal",
				variant: "destructive",
			});
		}
	}

	// Generate dates from May 2nd to today
	function generateDates() {
		const dates = [];
		const startDate = new Date("2024-05-02");
		const today = new Date();

		for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
			dates.push(new Date(d).toISOString().split("T")[0]);
		}

		return dates.reverse(); // Show most recent first
	}

	const dates = generateDates();

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<Button variant="outline" size="icon" disabled>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="text-2xl font-bold">Daily Meal Entry</h1>
					</div>
					<div className="grid gap-4">
						{[...Array(5)].map((_, i) => (
							<Card key={i}>
								<CardHeader>
									<div className="h-6 bg-muted rounded w-32 animate-pulse" />
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{[...Array(3)].map((_, j) => (
											<div
												key={j}
												className="h-6 bg-muted rounded animate-pulse"
											/>
										))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						size="icon"
						onClick={() => router.push("/")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-2xl font-bold">Daily Meal Entry</h1>
				</div>

				{/* Calendar Grid */}
				<div className="grid gap-4">
					{dates.map((date) => {
						const meal = meals.find((m) => m.date === date);
						const mealCount = meal ? getMealCountForDate(meal) : 0;

						return (
							<Card
								key={date}
								className="transition-all duration-200 hover:shadow-md"
							>
								<CardHeader className="pb-3">
									<div className="flex justify-between items-center">
										<CardTitle className="text-lg">
											{formatDate(date)}
										</CardTitle>
										<Badge variant={mealCount > 0 ? "default" : "secondary"}>
											{mealCount} meal{mealCount !== 1 ? "s" : ""}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{/* Breakfast */}
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<Checkbox
													id={`${date}-breakfast`}
													checked={meal?.breakfast || false}
													onCheckedChange={(checked) =>
														updateMeal(date, "breakfast", checked as boolean)
													}
												/>
												<label
													htmlFor={`${date}-breakfast`}
													className="text-sm font-medium"
												>
													Breakfast
												</label>
											</div>
											{meal?.breakfast && (
												<Badge
													variant={
														meal.breakfast_paid ? "default" : "secondary"
													}
												>
													{meal.breakfast_paid ? "Paid" : "Unpaid"}
												</Badge>
											)}
										</div>

										{/* Lunch */}
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<Checkbox
													id={`${date}-lunch`}
													checked={meal?.lunch || false}
													onCheckedChange={(checked) =>
														updateMeal(date, "lunch", checked as boolean)
													}
												/>
												<label
													htmlFor={`${date}-lunch`}
													className="text-sm font-medium"
												>
													Lunch
												</label>
											</div>
											{meal?.lunch && (
												<Badge
													variant={meal.lunch_paid ? "default" : "secondary"}
												>
													{meal.lunch_paid ? "Paid" : "Unpaid"}
												</Badge>
											)}
										</div>

										{/* Dinner */}
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<Checkbox
													id={`${date}-dinner`}
													checked={meal?.dinner || false}
													onCheckedChange={(checked) =>
														updateMeal(date, "dinner", checked as boolean)
													}
												/>
												<label
													htmlFor={`${date}-dinner`}
													className="text-sm font-medium"
												>
													Dinner
												</label>
											</div>
											{meal?.dinner && (
												<Badge
													variant={meal.dinner_paid ? "default" : "secondary"}
												>
													{meal.dinner_paid ? "Paid" : "Unpaid"}
												</Badge>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		</div>
	);
}
