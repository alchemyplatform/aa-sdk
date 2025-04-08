# Move images docs/images dir to docs-site/fern/images/account-kit/account-kit so they can referenced by Fern
mkdir -p fern/images/account-kit/account-kit && \
mv fern/docs/account-kit/images/account-kit/* fern/images/account-kit/account-kit/

# Takes the contents of docs/docs.yml and inserts its contents into the right places in docs-site/fern/docs.yml
COMPONENTS_PLACEHOLDER="# Account Kit components are auto-generated here"
DOCS_PLACEHOLDER="# Account Kit docs are auto-generated here"

# Extract mdx-components section and insert it into the docs.yml file
sed -n '/^  mdx-components:/,/^[^ ]/p' fern/docs/account-kit/docs.yml | sed '1d;$d' | \
  sed -i.bak \
    "/$COMPONENTS_PLACEHOLDER/r /dev/stdin" \
    fern/docs.yml && \
  sed -i.bak \
    "/$COMPONENTS_PLACEHOLDER/d" \
    fern/docs.yml && \

# Extract navigation section and insert it into the docs.yml file
sed -n '/^navigation:/,/^[^ ]/p' fern/docs/account-kit/docs.yml | sed '1d;$d' | \
  sed -i.bak \
    "/$DOCS_PLACEHOLDER/r /dev/stdin" \
    fern/docs.yml && \
  sed -i.bak \
    "/$DOCS_PLACEHOLDER/d" \
    fern/docs.yml && \
  rm fern/docs.yml.bak
