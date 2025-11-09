"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import type { Meal } from "@/lib/supabase-client";
import {
	formatDate,
	getMealCountForDate,
	formatCurrency,
	calculateMealStats,
} from "@/lib/meal-utils";
import { useToast } from "@/hooks/use-toast";

interface QuickReportsProps {
	meals: Meal[];
}

export function QuickReports({ meals }: QuickReportsProps) {
	const [generating, setGenerating] = useState<string | null>(null);
	const { toast } = useToast();

	function forceDownload(content: string, filename: string) {
		try {
			const blob = new Blob(["\ufeff" + content], {
				type: "text/plain;charset=utf-8",
			});

			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			link.style.display = "none";

			document.body.appendChild(link);
			link.click();

			setTimeout(() => {
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			}, 100);

			return true;
		} catch (error) {
			console.error("Download failed:", error);
			return false;
		}
	}

	function generateUnpaidReport() {
		setGenerating("unpaid");

		try {
			// Get all unpaid meals
			const unpaidMeals = meals
				.filter((meal) => {
					return (
						(meal.breakfast && !meal.breakfast_paid) ||
						(meal.lunch && !meal.lunch_paid) ||
						(meal.dinner && !meal.dinner_paid)
					);
				})
				.filter((meal) => getMealCountForDate(meal) > 0); // Only include meals with count > 0

			if (unpaidMeals.length === 0) {
				toast({
					title: "No data",
					description: "No unpaid meals found",
					variant: "destructive",
				});
				return;
			}

			const stats = calculateMealStats(unpaidMeals);
			const sortedMeals = [...unpaidMeals].sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
			);

			let reportContent = `UNPAID MEALS REPORT\n`;
			reportContent += `===================\n\n`;
			reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;

			reportContent += `SUMMARY\n`;
			reportContent += `-------\n`;
			reportContent += `Meals: ${stats.unpaidMeals}\n`;
			reportContent += `Balance: ${formatCurrency(stats.totalDue)}\n\n`;

			reportContent += `DAILY BREAKDOWN\n`;
			reportContent += `---------------\n`;
			reportContent += `Date\t\tMeals\tBreakfast\tLunch\tDinner\n`;
			reportContent += `----\t\t-----\t---------\t-----\t------\n`;

			sortedMeals.forEach((meal) => {
				const totalMeals = getMealCountForDate(meal);
				if (totalMeals === 0) return; // Skip entries with 0 meals

				const b =
					meal.breakfast && !meal.breakfast_paid
						? "Y"
						: meal.breakfast
						? "-"
						: "N";
				const l = meal.lunch && !meal.lunch_paid ? "Y" : meal.lunch ? "-" : "N";
				const d =
					meal.dinner && !meal.dinner_paid ? "Y" : meal.dinner ? "-" : "N";

				const unpaidCount =
					(meal.breakfast && !meal.breakfast_paid ? 1 : 0) +
					(meal.lunch && !meal.lunch_paid ? 1 : 0) +
					(meal.dinner && !meal.dinner_paid ? 1 : 0);

				if (unpaidCount > 0) {
					reportContent += `${formatDate(
						meal.date
					)}\t${unpaidCount}\t${b}\t\t${l}\t${d}\n`;
				}
			});

			const success = forceDownload(reportContent, `unpaid-meals-report.txt`);

			if (success) {
				toast({
					title: "Success",
					description: "Unpaid meals report downloaded successfully",
				});
			} else {
				toast({
					title: "Download failed",
					description: "Please check your browser's download settings",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error generating unpaid report:", error);
			toast({
				title: "Error",
				description: "Failed to generate report",
				variant: "destructive",
			});
		} finally {
			setGenerating(null);
		}
	}

	function generatePaidReport() {
		setGenerating("paid");

		try {
			// Get all paid meals
			const paidMeals = meals
				.filter((meal) => {
					return (
						(meal.breakfast && meal.breakfast_paid) ||
						(meal.lunch && meal.lunch_paid) ||
						(meal.dinner && meal.dinner_paid)
					);
				})
				.filter((meal) => {
					const paidCount =
						(meal.breakfast && meal.breakfast_paid ? 1 : 0) +
						(meal.lunch && meal.lunch_paid ? 1 : 0) +
						(meal.dinner && meal.dinner_paid ? 1 : 0);
					return paidCount > 0;
				});

			if (paidMeals.length === 0) {
				toast({
					title: "No data",
					description: "No paid meals found",
					variant: "destructive",
				});
				return;
			}

			const stats = calculateMealStats(paidMeals);
			const sortedMeals = [...paidMeals].sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
			);

			let reportContent = `PAID MEALS REPORT\n`;
			reportContent += `=================\n\n`;
			reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;

			reportContent += `SUMMARY\n`;
			reportContent += `-------\n`;
			reportContent += `Meals: ${stats.paidMeals}\n`;
			reportContent += `Amount: ${formatCurrency(stats.totalPaid)}\n\n`;

			reportContent += `DAILY BREAKDOWN\n`;
			reportContent += `---------------\n`;
			reportContent += `Date\t\tMeals\tBreakfast\tLunch\tDinner\n`;
			reportContent += `----\t\t-----\t---------\t-----\t------\n`;

			sortedMeals.forEach((meal) => {
				const b = meal.breakfast && meal.breakfast_paid ? "Y" : "N";
				const l = meal.lunch && meal.lunch_paid ? "Y" : "N";
				const d = meal.dinner && meal.dinner_paid ? "Y" : "N";

				const paidCount =
					(meal.breakfast && meal.breakfast_paid ? 1 : 0) +
					(meal.lunch && meal.lunch_paid ? 1 : 0) +
					(meal.dinner && meal.dinner_paid ? 1 : 0);

				if (paidCount > 0) {
					reportContent += `${formatDate(
						meal.date
					)}\t${paidCount}\t${b}\t\t${l}\t${d}\n`;
				}
			});

			const success = forceDownload(reportContent, `paid-meals-report.txt`);

			if (success) {
				toast({
					title: "Success",
					description: "Paid meals report downloaded successfully",
				});
			} else {
				toast({
					title: "Download failed",
					description: "Please check your browser's download settings",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error generating paid report:", error);
			toast({
				title: "Error",
				description: "Failed to generate report",
				variant: "destructive",
			});
		} finally {
			setGenerating(null);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					Quick Reports
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={generateUnpaidReport}
						disabled={generating === "unpaid"}
					>
						<Download className="mr-2 h-3 w-3" />
						{generating === "unpaid" ? "Generating..." : "Download Unpaid"}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={generatePaidReport}
						disabled={generating === "paid"}
					>
						<Download className="mr-2 h-3 w-3" />
						{generating === "paid" ? "Generating..." : "Download Paid"}
					</Button>
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					Generate reports for unpaid meals or paid meal entries
				</p>
				{meals.length === 0 && (
					<p className="text-xs text-orange-600 mt-1">
						No meal data available. Add some meals first.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
