#!/bin/sh
set -e

# Nếu chưa có secret key thì tạo mới
if ! gpg --list-secret-keys signer@example.com >/dev/null 2>&1; then
  echo "🔑 No GPG key found, generating new key for tranhatdong1808@gmail.com ..."
  gpg --batch --generate-key <<EOF
%no-protection
Key-Type: RSA
Key-Length: 4096
Name-Real: nhatdong
Name-Email: tranhatdong1808@gmail.com
Expire-Date: 0
%commit
EOF
fi

echo "✅ GPG key ready"
exec "$@"
