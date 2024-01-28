// Heavily inspired by anvil.js https://github.com/wevm/anvil.js
import { createAnvil, type CreateAnvilOptions } from "@viem/anvil";
import type { ExecaChildProcess } from "execa";
import { EventEmitter } from "node:events";
import { Writable } from "node:stream";
import {
  RundlerCreationOptionsSchema,
  type Rundler,
  type RundlerCreationOptions,
} from "./types.js";

export function createRundler(opts?: {
  rundlerOptions?: RundlerCreationOptions;
  anvilOptions?: CreateAnvilOptions;
}): Rundler {
  const {
    rpc: { host, port },
    binaryPath,
    ...rundlerOptions
  } = RundlerCreationOptionsSchema.parse(opts?.rundlerOptions ?? {});

  const anvil = createAnvil(opts?.anvilOptions);
  let controller: AbortController | undefined;
  let rundler: ExecaChildProcess | undefined;
  const emitter = new EventEmitter();
  const logs: string[] = [];

  emitter.on("message", (message: string) => {
    logs.push(message);

    if (logs.length > 20) {
      logs.shift();
    }
  });

  const stdout = new Writable({
    write(message, _, callback) {
      try {
        emitter.emit("message", message);
        emitter.emit("stdout", message);
        callback();
      } catch (error) {
        callback(
          error instanceof Error
            ? error
            : new Error(typeof error === "string" ? error : undefined)
        );
      }
    },
  });

  const stderr = new Writable({
    write(message, _, callback) {
      try {
        emitter.emit("message", message);
        emitter.emit("stderr", message);
        callback();
      } catch (error) {
        callback(
          error instanceof Error
            ? error
            : new Error(typeof error === "string" ? error : undefined)
        );
      }
    },
  });

  const start = async () => {
    await anvil.start();

    const { execa } = await import("execa");
    controller = new AbortController();
    rundler = execa(
      binaryPath,
      [
        "node",
        "--entry_points",
        rundlerOptions.entry_points.join(","),
        "--chain_id",
        rundlerOptions.chain_id.toString(),
        "--node_http",
        `http://${anvil.host}:${anvil.port}`,
        "--max_verification_gas",
        rundlerOptions.max_verification_gas.toString(),
        "--builder.private_key",
        rundlerOptions.builder.private_key,
      ],
      { cleanup: true, signal: controller.signal, env: { RUST_LOG: "verbose" } }
    );

    rundler.pipeStdout!(stdout);
    rundler.pipeStderr!(stderr);
  };

  const stop = async () => {
    try {
      if (controller !== undefined && !controller?.signal.aborted) {
        controller.abort();
      }

      await rundler;
    } catch {
    } finally {
      await anvil.stop();
    }
    controller = undefined;
  };

  anvil.on("exit", stop);
  anvil.on("closed", stop);

  return {
    start,
    stop,
    anvil,
    host,
    port,
    logs,
  };
}
