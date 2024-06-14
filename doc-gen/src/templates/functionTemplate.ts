import dedent from "dedent";
import ts from "typescript";

export function functionTemplate(
    functionName: string,
    packageName: string,
    node: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression,
    jsDocCommentAndTags: readonly (ts.JSDoc | ts.JSDocTag)[],
) {
    const comment = jsDocCommentAndTags.find(x => x.kind === ts.SyntaxKind.JSDoc) as ts.JSDoc;
    const exampleTag = comment.tags?.find(x => 
        x.kind === ts.SyntaxKind.JSDocTag && x.tagName.escapedText === "example"
    );

    const parameterTags = comment.tags?.filter(x => x.kind === ts.SyntaxKind.JSDocParameterTag) as ts.JSDocParameterTag[];
    const parameters = parameterTags.map(tag => {
        const type = tag.typeExpression?.type;
        return {
            name: tag.name.getText(),
            type: type?.getText(),
            description: tag.comment,
        }
    });

    const parameterSection = parameters ? dedent`

    ## Parameters
    ${parameters.map((param) => dedent`
    ### ${param.name}
    \`${param.type}\`
    ${param.description}
    `).join("\n\n")}
    \n
    ` : "";

    const returnTag = comment.tags?.find(x => x.kind === ts.SyntaxKind.JSDocReturnTag);
    const returnType = node.type ? node.type.getFullText() : undefined;
    const returnSection = returnType ? dedent`
    ## Returns
    \`${returnType.trim()}\`
    ${(returnTag && ts.getTextOfJSDocComment(returnTag?.comment)) ?? ""}
    ` : "";

    return dedent`
    ---
    title: ${functionName}
    description: Overview of the ${functionName} method
    ---

    # ${functionName}
    ${ts.getTextOfJSDocComment(comment?.comment)}

    ## Import
    \`\`\`ts
    import { ${functionName} } from "${packageName}";
    \`\`\`
    ${exampleTag ? dedent`

    ## Usage
    ${ts.getTextOfJSDocComment(exampleTag.comment)}

    ` : ""}
    ${parameterSection}
    ${returnSection}
    `;
}