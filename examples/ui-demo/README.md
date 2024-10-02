This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Getting Started

## Setup your Environment

1. Ensure you have the right node version corresponding to the `/aa-sdk/.nvmrc` file.
2. Go to Alchemy's Dashboard, and set up an [account config](https://dashboard.alchemy.com/accounts/config/create).
   1. For local development set the configuration with a redirect url to http://localhost:3000.

## Install Dependencies

_In the root `/aa-sdk/` directory_

```bash
yarn install
```

## Build the aa-sdk Libraries

_In the root `/aa-sdk/` directory_

```bash
yarn build
```

## Start the Server

_In the ui-demo `/aa-sdk/examples/ui-demo` directory_

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
