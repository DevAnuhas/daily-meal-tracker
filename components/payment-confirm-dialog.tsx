"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/meal-utils";

interface PaymentConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	unpaidMeals: number;
	totalAmount: number;
	onConfirm: () => void;
}

export function PaymentConfirmDialog({
	open,
	onOpenChange,
	unpaidMeals,
	totalAmount,
	onConfirm,
}: PaymentConfirmDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Confirm Payment</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to mark all unpaid meals as paid?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="py-4">
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span>Unpaid meals:</span>
							<span className="font-medium">{unpaidMeals}</span>
						</div>
						<div className="flex justify-between">
							<span>Rate per meal:</span>
							<span className="font-medium">Rs.250</span>
						</div>
						<div className="border-t pt-2 flex justify-between font-semibold">
							<span>Total amount:</span>
							<span className="text-green-600">
								{formatCurrency(totalAmount)}
							</span>
						</div>
					</div>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							onConfirm();
							onOpenChange(false);
						}}
						className="bg-green-600 hover:bg-green-700"
					>
						Confirm Payment
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
