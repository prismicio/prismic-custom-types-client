# Custom Types

This examples shows how to use `@prismicio/custom-types-client` to interact with [Custom Type models](https://prismic.io/docs/core-concepts/custom-types). The client allows for fetching models, updating them, and removing them.

**Note**: This example is written for Node.js. If you plan to use this code for the browser, you can remove `node-fetch` from the example.

```diff
   import * as prismic from '@prismicio/custom-types-client'
-  import fetch from 'node-fetch'
```

## How to run the example

**Note**: This example requires a Custom Types API secret token to run. Running this example requires updating the repository name and secret token.

```sh
# Clone the repository to your computer
git clone https://github.com/prismicio/prismic-custom-types-client.git
cd prismic-custom-types-client/examples/custom-types

# Install the dependencies
npm install

# Run the example
node --loader ts-node/esm index.ts
```
