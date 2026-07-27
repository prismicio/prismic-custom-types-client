import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		setupFiles: ["./test/__setup__.ts"],
		typecheck: {
			enabled: true,
		},
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
			include: ["src"],
		},
	},
})
