/**
 * Updates or creates a comment on a GitHub pull request with a documentation preview link
 * Typescript not supported in actions/github-script@v7
 *
 * @param {object} params - The parameters object
 * @param {object} params.github - The GitHub API client instance
 * @param {object} params.context - The GitHub Actions context object
 * @param {string} params.previewUrl - The URL of the documentation preview
 */
const updatePreviewComment = async ({ github, context, previewUrl }) => {
  const { repo, issue } = context;
  const commentTitle = "🌿 Documentation Preview";
  const timeUTC = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const commentBody = `## ${commentTitle}\n\n| Name | Preview | Updated (UTC) |\n| :--- | :------ | :------ |\n| **Alchemy Docs** | [🔗 Visit Preview](${previewUrl}) | ${timeUTC} |\n\n>`;

  const allComments = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  });

  const existingComment = allComments.data.find((comment) =>
    comment.body.includes(commentTitle)
  );

  if (existingComment) {
    await github.rest.issues.updateComment({
      owner: repo.owner,
      repo: repo.repo,
      comment_id: existingComment.id,
      body: commentBody,
    });
  } else {
    await github.rest.issues.createComment({
      owner: repo.owner,
      repo: repo.repo,
      issue_number: issue.number,
      body: commentBody,
    });
  }
};

export { updatePreviewComment };
