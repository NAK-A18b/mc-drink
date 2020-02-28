#!/bin/sh

# --batch to prevent interactive command --yes to assume "yes" for questions
gpg --quiet --batch --yes --decrypt --passphrase="$PASSPHRASE" \
--output secrets/dev-secrets.yml secrets/dev-secrets.yml.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$PASSPHRASE" \
--output secrets/prod-secrets.yml secrets/prod-secrets.yml.gpg