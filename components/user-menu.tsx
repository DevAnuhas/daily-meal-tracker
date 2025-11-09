"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export function UserMenu() {
	const { user, signOut } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	if (!user) return null;

	const handleSignOut = async () => {
		try {
			setLoading(true);
			await signOut();
			router.push("/");
		} catch (error) {
			console.error("Sign out error:", error);
		} finally {
			setLoading(false);
		}
	};

	const userInitials =
		user.email
			?.split("@")[0]
			.split(".")
			.map((part) => part[0].toUpperCase())
			.join("")
			.slice(0, 2) || "U";

	const userEmail = user.email || "User";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-10 w-10 rounded-full">
					<Avatar className="h-10 w-10">
						<AvatarImage
							src={user.user_metadata?.avatar_url || "/placeholder.svg"}
							alt={userEmail}
						/>
						<AvatarFallback>{userInitials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel className="flex flex-col space-y-1">
					<p className="text-sm font-medium">
						{user.user_metadata?.full_name || "User"}
					</p>
					<p className="text-xs text-muted-foreground">{userEmail}</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut} disabled={loading}>
					<LogOut className="mr-2 h-4 w-4" />
					{loading ? "Signing out..." : "Sign out"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
