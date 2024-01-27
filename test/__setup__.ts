import { afterAll, beforeAll, vi } from "vitest";

import AbortController from "abort-controller";

import { server } from "./__testutils__/server";

vi.stubGlobal("AbortController", AbortController);

beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
	server.close();
});
