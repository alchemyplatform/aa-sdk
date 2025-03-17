#!/bin/sh

FULL_VERSION=$(mvn help:evaluate -Dexpression=project.version -q -DforceStdout)
echo $FULL_VERSION
if [[ "$FULL_VERSION" =~ ^([0-9]+\.[0-9]+\.[0-9]+)-([^-]+)-(.*)$ ]]; then
  version="${BASH_REMATCH[1]}"    # => 0.1.0
  qualifier="${BASH_REMATCH[2]}"  # => -alpha
  gitsha="$(git rev-parse --short HEAD)"

  echo "version:   $version"
  echo "qualifier: $qualifier"
  echo "gitsha:    $gitsha"
fi

newVersion=${version}-${qualifier}-${gitsha}
mvn versions:set -DnewVersion="$newVersion"
