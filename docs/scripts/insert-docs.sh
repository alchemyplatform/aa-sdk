# Move images wallets/images dir to docs-site/fern/images/wallets so they can be referenced by Fern
mkdir -p fern/images/wallets && \
mv fern/wallets/images/* fern/images/wallets/

# Takes the contents of docs/docs.yml and inserts its contents into the right places in docs-site/fern/docs.yml
COMPONENTS_PLACEHOLDER="# Account Kit components are auto-generated here"
DOCS_PLACEHOLDER="# Account Kit docs are auto-generated here"

# Extract mdx-components section and insert it into the docs.yml file
sed -n '/^  mdx-components:/,/^[^ ]/p' fern/wallets/docs.yml | sed '1d;$d' | \
  sed -i.bak \
    "/$COMPONENTS_PLACEHOLDER/r /dev/stdin" \
    fern/docs.yml && \
  sed -i.bak \
    "/$COMPONENTS_PLACEHOLDER/d" \
    fern/docs.yml && \

# Extract navigation section and insert it into the docs.yml file
sed -n '/^navigation:/,$p' fern/wallets/docs.yml | sed '1d' | \
  sed -i.bak \
    "/$DOCS_PLACEHOLDER/r /dev/stdin" \
    fern/docs.yml && \
  sed -i.bak \
    "/$DOCS_PLACEHOLDER/d" \
    fern/docs.yml && \
  rm fern/docs.yml.bak
