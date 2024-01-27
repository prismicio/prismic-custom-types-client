import { test } from "vitest";

import * as crypto from "node:crypto";

import { CustomTypeModel, SharedSliceModel } from "@prismicio/client";
import { MockFactory, createMockFactory } from "@prismicio/mock";
import { HttpResponse, http } from "msw";
import { SetupServer } from "msw/node";

import { server } from "./server";

import { CustomTypesClient, createClient } from "../../src";

type Fixtures = {
	msw: SetupServer;
	mock: MockFactory;
	customType: CustomTypeModel;
	slice: SharedSliceModel;
	client: CustomTypesClient;
	api: {
		mock: (
			path: string | URL,
			response?: unknown,
			options?: {
				method?: keyof typeof http;
				statusCode?: number;
				requiredSearchParams?: Record<string, string>;
				requiredBody?: unknown;
				token?: string;
				repositoryName?: string;
			},
		) => void;
	};
};

export const it = test.extend<Fixtures>({
	client: async ({ task }, use) => {
		const repositoryName = crypto
			.createHash("md5")
			.update(task.name)
			.digest("hex");
		const token = crypto.createHash("md5").update(repositoryName).digest("hex");
		const endpoint = `https://${repositoryName}.example.com`;

		const client = createClient({ repositoryName, token, endpoint });

		await use(client);
	},
	msw: async ({}, use) => {
		await use(server);

		server.resetHandlers();
	},
	api: async ({ client, msw }, use) => {
		await use({
			mock: (path, response, options) => {
				const method = options?.method ?? "get";

				const handler = http[method](
					path instanceof URL
						? path.toString()
						: new URL(path, client.endpoint).toString(),
					async ({ request }) => {
						if (
							request.headers.get("Authorization") !==
								`Bearer ${options?.token ?? client.token}` ||
							request.headers.get("repository") !==
								(options?.repositoryName ?? client.repositoryName)
						) {
							return new HttpResponse(undefined, { status: 403 });
						}

						if (options?.requiredSearchParams) {
							for (const name in options.requiredSearchParams) {
								const url = new URL(request.url);

								if (
									url.searchParams.get(name) !==
									options.requiredSearchParams[name]
								) {
									return;
								}
							}
						}

						if (options?.requiredBody) {
							if (
								JSON.stringify(await request.json()) !==
								JSON.stringify(options.requiredBody)
							) {
								return;
							}
						}

						return new HttpResponse(
							typeof response === "object"
								? JSON.stringify(response)
								: response?.toString(),
							{ status: options?.statusCode },
						);
					},
				);

				msw.use(handler);
			},
		});
	},
	mock: async ({ task }, use) => {
		const mockFactory = createMockFactory({ seed: task.name });

		await use(mockFactory);
	},
	customType: async ({ mock }, use) => {
		await use(mock.model.customType());
	},
	slice: async ({ mock }, use) => {
		await use(mock.model.sharedSlice());
	},
});
