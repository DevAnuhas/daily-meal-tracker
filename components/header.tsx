import { formatDate } from "@/lib/meal-utils";
import { UserMenu } from "./user-menu";

function Header() {
	const today = new Date().toISOString().split("T")[0];
	return (
		<header className="border-b">
			<div className="container mx-auto px-4 py-4 flex justify-between items-center">
				<div className="">
					<h1 className="text-2xl font-bold">Daily Meal Tracker</h1>
					<p className="text-muted-foreground">Today is {formatDate(today)}</p>
				</div>

				<UserMenu />
			</div>
		</header>
	);
}

export default Header;
