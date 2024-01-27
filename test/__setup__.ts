import { afterAll, beforeAll } from "vitest";

import { server } from "./__testutils__/server";

beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
	server.close();
});
