import dedent from "dedent";

export const restApiSchemaTemplate = () => dedent`
// Once you've defined this schema, import it into the schema.ts file found in the root alchemy package
export type TODO_MyHttpSchema = [
  {
    Route: "TODO_MyRoute";
    Method: "POST";
    Body: {
      param1: string;
      param2: number;
    };
    Response: {
      success: boolean;
    };
  },
];
`;
