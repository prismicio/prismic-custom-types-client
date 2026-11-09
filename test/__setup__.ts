import { afterAll, beforeAll } from "vitest"

import { server } from "./__testutils__/server"

beforeAll(() => {
	server.listen({ onUnhandledFrame: "error" })
})

afterAll(() => {
	server.close()
})
