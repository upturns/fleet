#!/bin/sh

MAX_ATTEMPTS=5
COUNT=0

R="$(dig @"$1" -p "$2" "$3" +noall +nocmd +answer | sed 's/\t/ /g' | rev | cut -d ' ' -f 1 | rev | tail -n 1)"

echo "!"
until [ "$R" != "+cmd" ] && [ ! -z "$R" ]; do
    printf "Waiting for [%s] (attempt %s)" "$3" "$COUNT"
    COUNT=$((COUNT+1))

    if [ ${COUNT} -gt ${MAX_ATTEMPTS} ]; then
        echo "Failed"
        exit 1
    fi

    sleep 1

    R="$(dig @"$1" -p "$2" "$3" +noall +nocmd +answer | sed 's/\t/ /g' | rev | cut -d ' ' -f 1 | rev | tail -n 1)"
done

if expr "$R" : "^[\d\.]+$" >/dev/null; then
    echo "found"
    exit 0
fi
echo "$R" | sed 's/\t/ /' | rev | cut -d ' ' -f 1 | rev
exit 0