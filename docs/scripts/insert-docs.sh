# Remove first line from docs.yml
sed '1d' docs/docs.yml | \
  sed -i.bak \
    '/# Account Kit docs are auto-generated here/r /dev/stdin' \
    docs-site/fern/docs.yml && \
  sed -i.bak \
    '/# Account Kit docs are auto-generated here/d' \
    docs-site/fern/docs.yml && \
  rm docs-site/fern/docs.yml.bak