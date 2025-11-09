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

interface QuickReportProps {
	meals: Meal[];
}

export function QuickReport({ meals }: QuickReportProps) {
	const [generating, setGenerating] = useState(false);
	const { toast } = useToast();

	function generateQuickReport(days: number) {
		setGenerating(true);

		try {
			// Get meals from the last N days
			const today = new Date();
			const startDate = new Date(today);
			startDate.setDate(today.getDate() - days + 1);

			const filteredMeals = meals.filter((meal) => {
				const mealDate = new Date(meal.date);
				return mealDate >= startDate && mealDate <= today;
			});

			if (filteredMeals.length === 0) {
				toast({
					title: "No data",
					description: `No meals found in the last ${days} days`,
					variant: "destructive",
				});
				return;
			}

			// Generate simple text report
			const stats = calculateMealStats(filteredMeals);
			const sortedMeals = [...filteredMeals].sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
			);

			let reportContent = `MEAL REPORT - LAST ${days} DAYS\n`;
			reportContent += `===============================\n\n`;
			reportContent += `Period: ${formatDate(
				sortedMeals[0]?.date || ""
			)} to ${formatDate(sortedMeals[sortedMeals.length - 1]?.date || "")}\n`;
			reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;

			reportContent += `SUMMARY:\n`;
			reportContent += `Total Meals: ${stats.totalMeals}\n`;
			reportContent += `Amount Due: ${formatCurrency(stats.totalDue)}\n`;
			reportContent += `Amount Paid: ${formatCurrency(stats.totalPaid)}\n\n`;

			reportContent += `DAILY MEAL COUNT:\n`;
			reportContent += `Date\t\tMeals\n`;
			reportContent += `----\t\t-----\n`;

			sortedMeals.forEach((meal) => {
				const totalMeals = getMealCountForDate(meal);
				reportContent += `${formatDate(meal.date)}\t${totalMeals}\n`;
			});

			reportContent += `\nRate: Rs.250 per meal\n`;

			// Download the file
			const blob = new Blob([reportContent], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `quick-meal-report-${days}days.txt`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast({
				title: "Success",
				description: `Report for last ${days} days downloaded successfully`,
			});
		} catch (error) {
			console.error("Error generating quick report:", error);
			toast({
				title: "Error",
				description: "Failed to generate report",
				variant: "destructive",
			});
		} finally {
			setGenerating(false);
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
						onClick={() => generateQuickReport(7)}
						disabled={generating}
					>
						<Download className="mr-2 h-3 w-3" />
						Last 7 Days
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => generateQuickReport(30)}
						disabled={generating}
					>
						<Download className="mr-2 h-3 w-3" />
						Last 30 Days
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => generateQuickReport(90)}
						disabled={generating}
					>
						<Download className="mr-2 h-3 w-3" />
						Last 90 Days
					</Button>
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					Generate simple text reports listing dates and meal counts
				</p>
			</CardContent>
		</Card>
	);
}
