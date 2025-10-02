"use client"

import { useEffect, useState } from "react";

export default function ChangeMode() {
	const [theme, setTheme] = useState<string>(
		typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") || "fantasy" : "fantasy"
	);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "fantasy" ? "night" : "fantasy"));
	};

	return (
		<button className="btn btn-primary btn-soft btn-sm rounded-lg" onClick={toggleTheme}>
		 mode {theme === "fantasy" ? "night" : "fantasy"}
		</button>
	);
}
