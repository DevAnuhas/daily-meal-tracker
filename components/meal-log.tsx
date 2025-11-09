"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, CreditCard, Check, X } from "lucide-react";
import { supabase, type Meal } from "@/lib/supabase-client";
import { useAuth } from "@/lib/auth-context";
import {
	calculateMealStats,
	formatCurrency,
	formatDate,
	getMealCountForDate,
	getPaidMealCountForDate,
} from "@/lib/meal-utils";
import { useToast } from "@/hooks/use-toast";
import { PaymentConfirmDialog } from "./payment-confirm-dialog";
import { ReportGenerator } from "./report-generator";

export function MealLog() {
	const [meals, setMeals] = useState<Meal[]>([]);
	const [loading, setLoading] = useState(true);
	const [showPaymentDialog, setShowPaymentDialog] = useState(false);
	const [showReportGenerator, setShowReportGenerator] = useState(false);
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

	async function markAllAsPaid() {
		try {
			const unpaidMeals = meals.filter((meal) => {
				return (
					(meal.breakfast && !meal.breakfast_paid) ||
					(meal.lunch && !meal.lunch_paid) ||
					(meal.dinner && !meal.dinner_paid)
				);
			});

			if (unpaidMeals.length === 0) {
				toast({
					title: "No unpaid meals",
					description: "All meals are already paid",
				});
				return;
			}

			const updates = unpaidMeals.map((meal) => ({
				id: meal.id,
				date: meal.date,
				user_id: meal.user_id,
				breakfast: meal.breakfast,
				lunch: meal.lunch,
				dinner: meal.dinner,
				breakfast_paid: meal.breakfast ? true : meal.breakfast_paid,
				lunch_paid: meal.lunch ? true : meal.lunch_paid,
				dinner_paid: meal.dinner ? true : meal.dinner_paid,
			}));

			const { error } = await supabase.from("meals").upsert(updates);

			if (error) {
				console.error("Supabase error:", error);
				throw error;
			}

			setMeals((prev) =>
				prev.map((meal) => {
					const update = updates.find((u) => u.id === meal.id);
					return update ? { ...meal, ...update } : meal;
				})
			);

			const stats = calculateMealStats(unpaidMeals);

			await supabase.from("payments").insert({
				user_id: user?.id,
				amount: stats.totalDue,
				meal_count: stats.unpaidMeals,
				payment_date: new Date().toISOString().split("T")[0],
				description: `Bulk payment for ${stats.unpaidMeals} meals`,
			});

			toast({
				title: "Payment successful",
				description: `Marked ${
					stats.unpaidMeals
				} meals as paid (${formatCurrency(stats.totalDue)})`,
			});
		} catch (error) {
			console.error("Error marking meals as paid:", error);
			toast({
				title: "Error",
				description: "Failed to process payment",
				variant: "destructive",
			});
		}
	}

	const stats = calculateMealStats(meals);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" disabled>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-2xl font-bold">Meal Log</h1>
				</div>
				<div className="space-y-4">
					{[...Array(5)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-6">
								<div className="space-y-2">
									<div className="h-6 bg-muted rounded w-32 animate-pulse" />
									<div className="h-4 bg-muted rounded w-48 animate-pulse" />
									<div className="h-4 bg-muted rounded w-24 animate-pulse" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						size="icon"
						onClick={() => router.push("/")}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-2xl font-bold">Meal Log</h1>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setShowReportGenerator(true)}
					>
						<Download className="mr-2 h-4 w-4" />
						Generate Report
					</Button>
					{stats.unpaidMeals > 0 && (
						<Button onClick={() => setShowPaymentDialog(true)}>
							<CreditCard className="mr-2 h-4 w-4" />
							Mark All as Paid ({formatCurrency(stats.totalDue)})
						</Button>
					)}
				</div>
			</div>

			{/* Summary */}
			<Card>
				<CardHeader>
					<CardTitle>Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
						<div>
							<div className="text-2xl font-bold">{stats.totalMeals}</div>
							<div className="text-sm text-muted-foreground">Total Meals</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-green-600">
								{stats.paidMeals}
							</div>
							<div className="text-sm text-muted-foreground">Paid Meals</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-red-600">
								{stats.unpaidMeals}
							</div>
							<div className="text-sm text-muted-foreground">Unpaid Meals</div>
						</div>
						<div>
							<div className="text-2xl font-bold">
								{formatCurrency(stats.balance)}
							</div>
							<div className="text-sm text-muted-foreground">Balance Due</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Meal Entries */}
			<div className="space-y-4">
				{meals.map((meal) => {
					const totalMeals = getMealCountForDate(meal);
					const paidMeals = getPaidMealCountForDate(meal);
					const unpaidMeals = totalMeals - paidMeals;
					const dailyDue = unpaidMeals * 250;
					const dailyPaid = paidMeals * 250;

					return (
						<Card
							key={meal.id}
							className="transition-all duration-200 hover:shadow-md"
						>
							<CardContent className="p-6">
								<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
									<div className="space-y-2">
										<h3 className="font-semibold text-lg">
											{formatDate(meal.date)}
										</h3>
										<div className="flex flex-wrap gap-2">
											{meal.breakfast && (
												<div className="flex items-center gap-1">
													<Check className="h-4 w-4 text-green-600" />
													<span className="text-sm">Breakfast</span>
													<Badge
														variant={
															meal.breakfast_paid ? "default" : "secondary"
														}
														className="text-xs"
													>
														{meal.breakfast_paid ? "Paid" : "Unpaid"}
													</Badge>
												</div>
											)}
											{meal.lunch && (
												<div className="flex items-center gap-1">
													<Check className="h-4 w-4 text-green-600" />
													<span className="text-sm">Lunch</span>
													<Badge
														variant={meal.lunch_paid ? "default" : "secondary"}
														className="text-xs"
													>
														{meal.lunch_paid ? "Paid" : "Unpaid"}
													</Badge>
												</div>
											)}
											{meal.dinner && (
												<div className="flex items-center gap-1">
													<Check className="h-4 w-4 text-green-600" />
													<span className="text-sm">Dinner</span>
													<Badge
														variant={meal.dinner_paid ? "default" : "secondary"}
														className="text-xs"
													>
														{meal.dinner_paid ? "Paid" : "Unpaid"}
													</Badge>
												</div>
											)}
											{totalMeals === 0 && (
												<div className="flex items-center gap-1">
													<X className="h-4 w-4 text-red-600" />
													<span className="text-sm text-muted-foreground">
														No meals
													</span>
												</div>
											)}
										</div>
									</div>
									<div className="text-right space-y-1">
										<div className="text-sm">
											<span className="text-green-600 font-medium">
												Paid: {formatCurrency(dailyPaid)}
											</span>
										</div>
										{dailyDue > 0 && (
											<div className="text-sm">
												<span className="text-red-600 font-medium">
													Due: {formatCurrency(dailyDue)}
												</span>
											</div>
										)}
										<div className="text-xs text-muted-foreground">
											{totalMeals} meal{totalMeals !== 1 ? "s" : ""} total
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Payment Confirmation Dialog */}
			<PaymentConfirmDialog
				open={showPaymentDialog}
				onOpenChange={setShowPaymentDialog}
				unpaidMeals={stats.unpaidMeals}
				totalAmount={stats.totalDue}
				onConfirm={markAllAsPaid}
			/>

			{/* Report Generator */}
			{showReportGenerator && (
				<ReportGenerator
					open={showReportGenerator}
					onOpenChange={setShowReportGenerator}
					meals={meals}
				/>
			)}
		</div>
	);
}
