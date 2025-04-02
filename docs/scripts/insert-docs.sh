# Define the comments to find/replace
COMPONENTS_PLACEHOLDER="# Account Kit components are auto-generated here"
DOCS_PLACEHOLDER="# Account Kit docs are auto-generated here"

# Extract mdx-components section and remove the first line (experimental:)
sed -n '/^  mdx-components:/,/^[^ ]/p' docs/docs.yml | sed '1d;$d' | \
  sed -i.bak \
    "/$COMPONENTS_PLACEHOLDER/r /dev/stdin" \
    docs-site/fern/docs.yml && \
  sed -i.bak \
    "/$COMPONENTS_PLACEHOLDER/d" \
    docs-site/fern/docs.yml && \

# Extract navigation section and remove the first line (navigation:)
sed -n '/^navigation:/,/^[^ ]/p' docs/docs.yml | sed '1d;$d' | \
  sed -i.bak \
    "/$DOCS_PLACEHOLDER/r /dev/stdin" \
    docs-site/fern/docs.yml && \
  sed -i.bak \
    "/$DOCS_PLACEHOLDER/d" \
    docs-site/fern/docs.yml && \
  rm docs-site/fern/docs.yml.bak
