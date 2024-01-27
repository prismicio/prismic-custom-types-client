import { afterAll, beforeAll, beforeEach, vi } from "vitest";

import { MockFactory, createMockFactory } from "@prismicio/mock";
import AbortController from "abort-controller";
import { SetupServerApi, setupServer } from "msw/node";

declare module "vitest" {
	export interface TestContext {
		mock: MockFactory;
		server: SetupServerApi;
	}
}

const server = setupServer();

vi.stubGlobal("AbortController", AbortController);

beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" });
});

beforeEach((ctx) => {
	ctx.mock = createMockFactory({ seed: ctx.meta.name });
	ctx.server = server;
});

afterAll(() => {
	server.close();
});
