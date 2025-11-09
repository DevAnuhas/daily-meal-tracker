"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Download, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Meal } from "@/lib/supabase-client";
import {
	formatDate,
	getMealCountForDate,
	formatCurrency,
	calculateMealStats,
} from "@/lib/meal-utils";
import { useToast } from "@/hooks/use-toast";

interface ReportGeneratorProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	meals: Meal[];
}

export function ReportGenerator({
	open,
	onOpenChange,
	meals,
}: ReportGeneratorProps) {
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();
	const [generating, setGenerating] = useState(false);
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

	async function generateReport() {
		if (!startDate || !endDate) {
			toast({
				title: "Error",
				description: "Please select both start and end dates",
				variant: "destructive",
			});
			return;
		}

		if (startDate > endDate) {
			toast({
				title: "Error",
				description: "Start date must be before end date",
				variant: "destructive",
			});
			return;
		}

		setGenerating(true);

		try {
			const startDateStr = startDate.toISOString().split("T")[0];
			const endDateStr = endDate.toISOString().split("T")[0];

			// Filter meals by date range
			const filteredMeals = meals
				.filter((meal) => {
					const mealDate = new Date(meal.date);
					return mealDate >= startDate && mealDate <= endDate;
				})
				.filter((meal) => getMealCountForDate(meal) > 0); // Only include meals with count > 0

			if (filteredMeals.length === 0) {
				toast({
					title: "No data",
					description: "No meals found in the selected date range",
					variant: "destructive",
				});
				return;
			}

			const reportContent = generateTextReport(
				filteredMeals,
				startDateStr,
				endDateStr
			);

			const success = forceDownload(
				reportContent,
				`meal-report-${startDateStr}-to-${endDateStr}.txt`
			);

			if (success) {
				toast({
					title: "Success",
					description: "Report generated and downloaded successfully",
				});
				onOpenChange(false);
			} else {
				toast({
					title: "Download failed",
					description: "Please check your browser's download settings",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error generating report:", error);
			toast({
				title: "Error",
				description: "Failed to generate report",
				variant: "destructive",
			});
		} finally {
			setGenerating(false);
		}
	}

	function generateTextReport(
		filteredMeals: Meal[],
		start: string,
		end: string
	): string {
		const stats = calculateMealStats(filteredMeals);

		let reportContent = `DAILY MEAL TRACKER REPORT\n`;
		reportContent += `================================\n\n`;
		reportContent += `Report Period: ${formatDate(start)} to ${formatDate(
			end
		)}\n`;
		reportContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

		reportContent += `SUMMARY\n`;
		reportContent += `-------\n`;
		reportContent += `Meals: ${stats.totalMeals}\n`;
		reportContent += `Balance: ${formatCurrency(stats.balance)}\n\n`;

		reportContent += `DAILY BREAKDOWN\n`;
		reportContent += `---------------\n`;
		reportContent += `Date\t\tMeals\tBreakfast\tLunch\tDinner\n`;
		reportContent += `----\t\t-----\t---------\t-----\t------\n`;

		const sortedMeals = [...filteredMeals].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);

		sortedMeals.forEach((meal) => {
			const totalMeals = getMealCountForDate(meal);
			if (totalMeals === 0) return; // Skip entries with 0 meals

			const breakfast = meal.breakfast ? "Y" : "N";
			const lunch = meal.lunch ? "Y" : "N";
			const dinner = meal.dinner ? "Y" : "N";

			reportContent += `${formatDate(
				meal.date
			)}\t${totalMeals}\t${breakfast}\t\t${lunch}\t${dinner}\n`;
		});

		return reportContent;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Generate Meal Report</DialogTitle>
					<DialogDescription>
						Select a date range to generate a detailed meal report as a text
						file.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right">Start Date</Label>
						<div className="col-span-3">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn(
											"w-full justify-start text-left font-normal",
											!startDate && "text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{startDate ? (
											format(startDate, "PPP")
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={startDate}
										onSelect={setStartDate}
										autoFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-right">End Date</Label>
						<div className="col-span-3">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn(
											"w-full justify-start text-left font-normal",
											!endDate && "text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{endDate ? (
											format(endDate, "PPP")
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={endDate}
										onSelect={setEndDate}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={generateReport} disabled={generating}>
						<Download className="mr-2 h-4 w-4" />
						{generating ? "Generating..." : "Download Report"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
