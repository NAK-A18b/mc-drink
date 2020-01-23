#!/bin/sh

# --batch to prevent interactive command --yes to assume "yes" for questions
gpg --quiet --batch --yes --decrypt --passphrase="$PASSPHRASE" \
--output secrets/secrets.yml secrets/secrets.yml.gpg