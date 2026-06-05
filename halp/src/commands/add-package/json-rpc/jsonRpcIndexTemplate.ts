import dedent from "dedent";

export const jsonRpcIndexTemplate = () => dedent`
// actions
export type * from "./actions/dummyAction.js";
export { dummyAction } from "./actions/dummyAction.js";

// decorator
export type * from "./decorator.js";
export { TODO_myActions } from "./decorator.js";

// schema
export type * from "./schema.js";
`;
