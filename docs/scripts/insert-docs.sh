# Extract mdx-components section and remove the first line (experimental:)
sed -n '/^  mdx-components:/,/^[^ ]/p' docs/docs.yml | sed '1d;$d' | \
  sed -i.bak \
    '/# Account Kit components are auto-generated here/r /dev/stdin' \
    docs-site/fern/docs.yml && \
  sed -i.bak \
    '/# Account Kit components are auto-generated here/d' \
    docs-site/fern/docs.yml && \

# Extract navigation section and remove the first line (navigation:)
sed -n '/^navigation:/,/^[^ ]/p' docs/docs.yml | sed '1d;$d' | \
  sed -i.bak \
    '/# Account Kit docs are auto-generated here/r /dev/stdin' \
    docs-site/fern/docs.yml && \
  sed -i.bak \
    '/# Account Kit docs are auto-generated here/d' \
    docs-site/fern/docs.yml && \
  rm docs-site/fern/docs.yml.bak
