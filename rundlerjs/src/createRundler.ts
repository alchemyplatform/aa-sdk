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
import { downloadLatestRelease, isRundlerInstalled } from "./utils.js";

export async function createRundler(opts?: {
  rundlerOptions?: RundlerCreationOptions;
  anvilOptions?: CreateAnvilOptions;
}): Promise<Rundler> {
  const {
    rpc: { host, port },
    binaryPath,
    ...rundlerOptions
  } = RundlerCreationOptionsSchema.parse(opts?.rundlerOptions ?? {});

  if (!(await isRundlerInstalled(binaryPath))) {
    await downloadLatestRelease(binaryPath);
  }

  const anvil = createAnvil(opts?.anvilOptions);
  let controller: AbortController | undefined;
  let rundler: ExecaChildProcess | undefined;
  const emitter = new EventEmitter();
  const logs: string[] = [];

  emitter.on("message", (message: string | Buffer) => {
    logs.push(
      typeof message === "string" ? message : message.toString("utf-8")
    );

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
        "--node_http",
        `http://${anvil.host}:${anvil.port}`,
        "--network",
        "dev",
        "--max_verification_gas",
        rundlerOptions.max_verification_gas.toString(),
        "--builder.private_key",
        rundlerOptions.builder.private_key,
        // TODO: need to add support for specifying the support EP version
        // haivng more than one builder enabled means you can't pass in a private key?
        // "--entry_point_v0_7_enabled",
        // "false",
        "--unsafe",
      ],
      {
        cleanup: true,
        signal: controller.signal,
        env: { RUST_LOG: "debug", ENTRY_POINT_V0_7_ENABLED: "false" },
      }
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
