"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Meal } from "@/lib/supabase-client";

interface DebugInfoProps {
	meals: Meal[];
}

export function DebugInfo({ meals }: DebugInfoProps) {
	if (process.env.NODE_ENV === "production") {
		return null;
	}

	return (
		<Card className="border-dashed border-orange-200">
			<CardHeader>
				<CardTitle className="text-sm text-orange-600">
					Debug Info (Dev Only)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2 text-xs">
					<div>
						<Badge variant="outline">Meals loaded: {meals.length}</Badge>
					</div>
					{meals.length > 0 && (
						<div>
							<Badge variant="outline">
								Date range: {meals[meals.length - 1]?.date} to {meals[0]?.date}
							</Badge>
						</div>
					)}
					<div>
						<Badge variant="outline">
							Storage:{" "}
							{typeof window !== "undefined" &&
							localStorage.getItem("meal-tracker-data")
								? "Available"
								: "Empty"}
						</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
