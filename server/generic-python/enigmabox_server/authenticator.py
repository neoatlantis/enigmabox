#!/usr/bin/env python3

"""
Authentication Service for this hub.
===================================

newSecret: Issue a new secret for server config file. Only available via CLI.
issueToken: Given a new user UUID, issue a token for that user.


"""
import os
import hashlib
import hmac
import base64

lowerBase32 = lambda i: base64.b32encode(i).decode("ascii").lower()
getSecretId = lambda i: lowerBase32( 
    hashlib.sha256(bytes.fromhex(i)).digest())[:16]


class Authenticator:

    def __init__(self, secrets):
        self.secrets = {}
        for secret in secrets:
            self.secrets[getSecretId(secret)] = bytes.fromhex(secret)


    def newSecret(self):
        return os.urandom(64).hexdigest()


    def issueToken(self, uuid, secretId=None):
        # Issue a token for given uuid, with optionally a choosen secret.
        if not secretId:
            secretId = list(self.secrets.keys())[0]
        elif secretId not in self.secrets:
            raise Exception(
                "Unknown secret, must be one of following:\n" + " \n".join(
                    self.secrets.keys()
                )
            )
        nonce = lowerBase32(os.urandom(16))[:20]
        signature = hmac.HMAC(
            self.secrets[secretId],
            (nonce.encode("ascii") + b":" + uuid.encode("ascii")),
            hashlib.sha256
        ).hexdigest()
        return "token:%s:%s:%s" % (nonce, signature, uuid)


if __name__ == "__main__":
    auth = Authenticator(secrets=[
        "deadbeef"
    ])

    print(auth.issueToken("uuid"))





