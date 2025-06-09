import dedent from "dedent";

export const jsonRpcSchemaTemplate = () => dedent`
export type TODO_MyRpcSchema = [
  {
    Method: "TODO_MyMethod";
    Parameters: [{ param1: string; param2: number }, string];
    ReturnType: { success: boolean };
  },
];
`;
