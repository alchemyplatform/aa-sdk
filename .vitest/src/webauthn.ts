import * as cbor from "cbor";
import * as crypto from "crypto";
import { createHash, createSign, generateKeyPairSync } from "crypto";

export class SoftWebauthnDevice {
  credentialId: Buffer | null = null;
  privateKey: crypto.KeyObject | null = null;
  publicKey: crypto.KeyObject | null = null;
  rpId: string | null = null;
  userHandle: Buffer | null = null;
  signCount = 0;
  aaguid = Buffer.alloc(16); // 16 zero bytes

  async credInit(rpId: string, userHandle: Buffer) {
    this.credentialId = Buffer.from(crypto.randomBytes(32));
    const { privateKey, publicKey } = generateKeyPairSync("ec", {
      namedCurve: "prime256v1",
    });
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.rpId = rpId;
    this.userHandle = userHandle;
  }

  async create(options: any, origin: string) {
    if (
      !options.publicKey.pubKeyCredParams.some(
        (p: any) => p.alg === -7 && p.type === "public-key",
      )
    ) {
      throw new Error(
        "Requested pubKeyCredParams does not contain supported type",
      );
    }

    if (
      options.publicKey.attestation &&
      options.publicKey.attestation !== "none"
    ) {
      throw new Error('Only "none" attestation supported');
    }

    await this.credInit(
      options.publicKey.rp.id,
      Buffer.from(options.publicKey.user.id),
    );

    const clientData = {
      type: "webauthn.create",
      challenge: this.base64urlEncode(Buffer.from(options.publicKey.challenge)),
      origin,
    };

    const rpIdHash = this.sha256(Buffer.from(this.rpId!, "ascii"));
    const flags = Buffer.from([0x41]); // attested_data + user_present
    const signCount = this.packUInt32BE(this.signCount);
    const credentialId = this.credentialId!;
    const credentialIdLength = Buffer.alloc(2);
    credentialIdLength.writeUInt16BE(credentialId.length, 0);

    const coseKey = this.buildCosePublicKey();

    const authData = Buffer.concat([
      rpIdHash,
      flags,
      signCount,
      this.aaguid,
      credentialIdLength,
      credentialId,
      coseKey,
    ]);

    const attestationObject = {
      fmt: "none",
      attStmt: {},
      authData,
    };

    return {
      id: this.base64urlEncode(credentialId),
      rawId: credentialId,
      response: {
        clientDataJSON: Buffer.from(JSON.stringify(clientData), "utf-8"),
        attestationObject: cbor.encode(attestationObject),
      },
      type: "public-key",
      getClientExtensionResults: () => ({}),
    };
  }

  async get(options: any, origin: string) {
    if (this.rpId !== options.publicKey.rpId) {
      throw new Error("Requested rpID does not match current credential");
    }

    this.signCount += 1;

    const clientData = JSON.stringify({
      type: "webauthn.get",
      challenge: this.base64urlEncode(Buffer.from(options.publicKey.challenge)),
      origin,
    });
    const clientDataBuffer = Buffer.from(clientData, "utf-8");
    const clientDataHash = this.sha256(clientDataBuffer);

    const rpIdHash = this.sha256(Buffer.from(this.rpId!, "ascii"));
    const flags = Buffer.from([0x01]);
    const signCount = this.packUInt32BE(this.signCount);
    const authenticatorData = Buffer.concat([rpIdHash, flags, signCount]);

    const sign = createSign("SHA256");
    sign.update(Buffer.concat([authenticatorData, clientDataHash]));
    const signature = sign.sign(this.privateKey!);

    return {
      id: this.base64urlEncode(this.credentialId!),
      rawId: this.credentialId!,
      response: {
        authenticatorData,
        clientDataJSON: clientDataBuffer,
        signature,
        userHandle: this.userHandle,
      },
      type: "public-key",
      getClientExtensionResults: () => ({}),
    };
  }

  private base64urlEncode(buf: Buffer): string {
    return buf
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  private sha256(data: Buffer): Buffer {
    return createHash("sha256").update(data).digest();
  }

  private packUInt32BE(value: number): Buffer {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(value, 0);
    return buf;
  }

  private buildCosePublicKey(): Buffer {
    // Extract x and y from the public key
    const spki = this.publicKey!.export({
      type: "spki",
      format: "der",
    }) as Buffer;

    // P-256 public key x and y coordinates are in the BIT STRING at the end of the DER
    const pubKeyBytes = spki.slice(-65); // 0x04 + 32 bytes x + 32 bytes y
    const x = pubKeyBytes.slice(1, 33);
    const y = pubKeyBytes.slice(33, 65);

    const coseKey = new Map<number, any>([
      [1, 2], // kty: EC2
      [3, -7], // alg: ES256
      [-1, 1], // crv: P-256
      [-2, x], // x
      [-3, y], // y
    ]);

    return Buffer.from(cbor.encode(coseKey));
  }
}
