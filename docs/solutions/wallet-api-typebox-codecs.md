---
title: Wallet API TypeBox Codecs
date: 2026-05-06
tags:
  - wallet-apis
  - typebox
  - errors
area: wallet-apis
---

# Wallet API TypeBox Codecs

## Problem

Changing Wallet API RPC validation can accidentally leak raw TypeBox errors or
lose useful schema path messages.

## Root Cause

`packages/wallet-apis/src/utils/schema.ts` wraps `Value.Encode` and
`Value.Decode`, catches `EncodeError` and `DecodeError`, formats the first
schema error, and rethrows `@alchemy/common` `BaseError`.

## Solution

Use the local `encode` and `decode` wrappers for Wallet API request/response
codecs. If validation behavior changes, update tests and preserve SDK-facing
`BaseError` wrapping unless the public error contract is intentionally changing.
