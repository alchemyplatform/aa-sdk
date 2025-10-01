import { Alchemy } from "alchemy-sdk";
import z from "zod";

export const AlchemySdkClientSchema = z.instanceof(Alchemy);
