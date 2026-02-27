import dedent from "dedent";

export const jsonRpcSchemaTemplate = () => dedent`
// Once you've defined this schema, import it into the schema.ts file found in the root alchemy package
export type TODO_MyRpcSchema = [
  {
    Method: "TODO_MyMethod";
    Parameters: [{ param1: string; param2: number }, string];
    ReturnType: { success: boolean };
  },
];
`;
