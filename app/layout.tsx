import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
	title: "Daily Meal Tracker",
	description: "Track your daily meals and payments",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={GeistSans.className}>
				<AuthProvider>
					<Header />
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
