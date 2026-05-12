---
title: Wallet API Zod Codecs
date: 2026-05-12
tags:
  - wallet-apis
  - zod
  - errors
area: wallet-apis
---

# Wallet API Zod Codecs

## Problem

Changing Wallet API RPC validation can accidentally leak raw Zod errors or
lose useful error messages.

## Root Cause

`packages/wallet-apis/src/utils/schema.ts` provides `methodSchema`, `encode`,
and `decode` helpers that extract Zod schemas from RPC method definitions and
wrap validation failures in `@alchemy/common` `BaseError`.

## Solution

Use the local `encode` and `decode` wrappers for Wallet API request/response
codecs. If validation behavior changes, update tests and preserve SDK-facing
`BaseError` wrapping unless the public error contract is intentionally changing.
