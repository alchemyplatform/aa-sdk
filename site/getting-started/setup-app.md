---
outline: deep
head:
  - - meta
    - property: og:title
      content: Getting started guide
  - - meta
    - name: description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Smart Contract Account, Rundler and Gas Manager.
  - - meta
    - property: og:description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Smart Contract Account, Rundler and Gas Manager.
  - - meta
    - name: twitter:title
      content: Getting started guide
  - - meta
    - name: twitter:description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Smart Contract Account, Rundler and Gas Manager.
---

# Setup your application

This section will walk you through the steps to create your application, install the necessary dependencies, and write the boilerplate code you’ll need to integrate Embedded Accounts!

## Create your app

First, create a [NextJS React application](https://nextjs.org/docs/pages/api-reference/create-next-app) by running `npx create-next-app` from your terminal in a project directory of your choice. Select the default configuration for each question the `create-next-app` CLI.

## Install dependencies

In this newly created directory for your app, add the following dependencies:

::: code-group

```bash [npm]
npm i @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem @tanstack/react-query
```

```bash [yarn]
yarn add @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem @tanstack/react-query
```

```bash [pnpm]
pnpm i @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem @tanstack/react-query
```

:::

The three Alchemy packages - `@alchemy/aa-alchemy`, `@alchemy/aa-accounts`, and `@alchemy/aa-core` - come from the [Alchemy Account Kit](https://accountkit.alchemy.com/), and will provide the key building blocks for created Embedded Accounts.

`[viem](https://viem.sh/)` is a useful Web3 Utils library and a key dependency of Account Kit.

`[@tanstack/react-query](https://tanstack.com/query/latest)` is a popular library for managing client-side state in NextJS and React applications. You’re welcome to use another state management library or vanilla react, but the rest of this demo will use ReactQuery.

## Set up your backend

Using your code editor, open your newly created application directory to add the backend! Your application’s backend will serve as an API that your frontend will use to send requests to Alchemy’s infrastructure to sign messages, send UserOperations, and track your users’ Embedded Account activity.

From the root of NextJS project’s directory, using the NextJS concept of [route handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers), create new directory `src/app/api/rpc` and add two files: `src/app/api/rpc//[..routes]route.ts` to handle calls to the Alchemy Signer, and `src/app/api/rpc/route.ts` to handle requests to Alchemy’s infrastructure. Copy the following into those files.

::: code-group

```ts [src/app/api/route.ts]
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { routes: string[] } }
) {
  const apiUrl = "https://api.g.alchemy.com";
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (apiKey == null) {
    return NextResponse.json(
      { error: "ALCHEMY_API_KEY is not set" },
      { status: 500 }
    );
  }

  const body = await req.json();

  const res = await fetch(apiUrl + `/${params.routes.join("/")}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...req.headers,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(await res.json().catch((e) => ({})), {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}
```

```ts [src/app/api/[...routes]/route.ts]
import { optimismSepolia } from "@alchemy/aa-core";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // if you want to handle other or multiple chains, you can change this line
  const rpcUrl = optimismSepolia.rpcUrls.alchemy.http[0];
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (apiKey == null) {
    return NextResponse.json(
      { error: "ALCHEMY_API_KEY is not set" },
      { status: 500 }
    );
  }

  const body = await req.json();

  const res = await fetch(`${rpcUrl}/${apiKey}`, {
    method: "POST",
    headers: {
      ...req.headers,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(await res.json().catch((e) => ({})), {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}
```

:::

Notice that here, you’ll be using the ALCHEMY_API_KEY environment variable you set in an earlier step. Also note that the backend routes will make requests to Alchemy’s infrastructure for the Optimism Sepolia network.

## Set up your frontend

Before building your app’s UI, you’ll want configure a [NextJS router](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating) and [a ReactQuery client](https://tanstack.com/query/v4/docs/framework/react/reference/QueryClientProvider) to manage state around requests the app will make, and wrap components that use. From the root of NextJS project’s directory, create a file `src/app/providers.tsx` and initialize these providers.

Then, in the `src/app/layout.tsx` file that came with the NextJS boilerplate, wrap the `children` component in the `Providers` component you just created in `src/app/providers.tsx`.

These two files should look as follows:

::: code-group

```ts [src/app/layout.tsx]
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Embedded Accounts Getting Started",
  description: "Embedded Accounts Quickstart Guide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

```ts [src/app/providers.tsx]
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense } from "react";

export const Providers = (props: PropsWithChildren) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense>{props.children}</Suspense>
    </QueryClientProvider>
  );
};
```

:::

Now, you have all the pieces in place to build a new web application using Embedded Accounts! In the next step of this guide, you’ll integrate the Alchemy Signer to enable your app to sign users into their newly created Embedded Accounts.
