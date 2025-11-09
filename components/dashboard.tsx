"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	CalendarDays,
	DollarSign,
	Loader2,
	Receipt,
	TrendingUp,
} from "lucide-react";
import { supabase, type Meal } from "@/lib/supabase-client";
import { useAuth } from "@/lib/auth-context";
import { calculateMealStats, formatCurrency } from "@/lib/meal-utils";
import { QuickReports } from "./quick-reports";

export function Dashboard() {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [todaysMeal, setTodaysMeal] = useState<Meal | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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
			setError(null);

			const { data, error } = await supabase
				.from("meals")
				.select("*")
				.eq("user_id", user?.id)
				.order("date", { ascending: false });

			if (error) {
				console.error("Supabase error:", error);
				throw error;
			}

			const mealsData = data || [];
			setMeals(mealsData);

			// Find today's meal
			const today = new Date().toISOString().split("T")[0];
			const todayMeal = mealsData.find((meal) => meal.date === today);
			setTodaysMeal(todayMeal || null);
		} catch (error) {
			console.error("Error fetching meals:", error);
			setError(error instanceof Error ? error.message : "Unknown error");
			setMeals([]);
			setTodaysMeal(null);
		} finally {
			setLoading(false);
		}
	}

	const stats = calculateMealStats(meals);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="text-center py-8">
					<Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
					<p className="mt-2 text-muted-foreground">Loading meal data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<Card className="border-red-200">
					<CardContent className="p-6">
						<div className="text-center">
							<p className="text-red-600 font-medium">Error loading data</p>
							<p className="text-sm text-muted-foreground mt-1">{error}</p>
							<Button onClick={fetchMeals} className="mt-4">
								Try Again
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-2xl font-medium">
						Welcome back,{" "}
						{user?.user_metadata?.full_name?.split(" ")[0] || "User"}
					</h2>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => router.push("/calendar")}>
						<CalendarDays className="mr-2 h-4 w-4" />
						Add/Edit Meals
					</Button>
					<Button variant="outline" onClick={() => router.push("/log")}>
						<Receipt className="mr-2 h-4 w-4" />
						View Log
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Meals</CardTitle>
						<Receipt className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalMeals}</div>
						<p className="text-xs text-muted-foreground">All time</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Due</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{formatCurrency(stats.totalDue)}
						</div>
						<p className="text-xs text-muted-foreground">
							{stats.unpaidMeals} unpaid meals
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Paid</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{formatCurrency(stats.totalPaid)}
						</div>
						<p className="text-xs text-muted-foreground">
							{stats.paidMeals} paid meals
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Balance</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(stats.balance)}
						</div>
						<p className="text-xs text-muted-foreground">Outstanding amount</p>
					</CardContent>
				</Card>
			</div>

			{/* Today's Meals */}
			<Card>
				<CardHeader>
					<CardTitle>Today's Meals</CardTitle>
				</CardHeader>
				<CardContent>
					{todaysMeal ? (
						<div className="flex flex-wrap gap-2">
							{todaysMeal.breakfast && (
								<Badge
									variant={todaysMeal.breakfast_paid ? "default" : "secondary"}
								>
									Breakfast {todaysMeal.breakfast_paid ? "(Paid)" : "(Unpaid)"}
								</Badge>
							)}
							{todaysMeal.lunch && (
								<Badge
									variant={todaysMeal.lunch_paid ? "default" : "secondary"}
								>
									Lunch {todaysMeal.lunch_paid ? "(Paid)" : "(Unpaid)"}
								</Badge>
							)}
							{todaysMeal.dinner && (
								<Badge
									variant={todaysMeal.dinner_paid ? "default" : "secondary"}
								>
									Dinner {todaysMeal.dinner_paid ? "(Paid)" : "(Unpaid)"}
								</Badge>
							)}
							{!todaysMeal.breakfast &&
								!todaysMeal.lunch &&
								!todaysMeal.dinner && (
									<p className="text-muted-foreground">No meals taken today</p>
								)}
						</div>
					) : (
						<div className="text-center py-4">
							<p className="text-muted-foreground mb-4">
								No meals recorded for today
							</p>
							<Button onClick={() => router.push("/calendar")}>
								Add Today's Meals
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Quick Reports */}
			<QuickReports meals={meals} />
		</div>
	);
}
