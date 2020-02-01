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


def getSignature(secret, uuid, tokenId):
    return hmac.HMAC(
        secret,
        (tokenId.encode("ascii") + b":" + uuid.encode("ascii")),
        hashlib.sha256
    ).hexdigest()

def getTokenSecret(secret, token):
    return hmac.HMAC(secret, token.encode("ascii"), hashlib.sha256).hexdigest()


class Authenticator:

    def __init__(self, secret):
        assert type(secret) == bytes and len(secret) >= 16 
        self.secret = secret

    def verifyToken(self, token):
        """Verify a token. Returns (tokenId, uuid, tokenSecret) on success,
        and None if not.
        
        It may be up to server logic, to blacklist a given tokenId or uuid,
        that's however out of scope for this function.
        """
        try:
            assert type(token) == str
            parts = token.split(":")
            assert parts[0] == "token"
            tokenId, tokenSignature, uuid = parts[1:4]
        except:
            return None
        shouldSignature = getSignature(self.secret, uuid, tokenId)
        if shouldSignature != tokenSignature: return None
        return (tokenId, uuid, getTokenSecret(self.secret, token))

    def issueToken(self, uuid):
        """Issue a token for given uuid.

        A token is a pair of (token, tokenSecret). The first is attached for
        HTTP authentication, just like an ID for that user. It carries a
        signature, therefore allowing a server to identify any user without
        maintaining a database. Also the service owner may issue tokens
        offline, without updating the server.
        
        The tokenSecret is secretly derived from ID (with the parameter only
        known to server, and used to encrypt actual data transmission."""

        tokenId = lowerBase32(os.urandom(16))[:20]
        signature = getSignature(self.secret, uuid, tokenId)
        
        token = "token:%s:%s:%s" % (tokenId, signature, uuid)
        tokenSecret = getTokenSecret(self.secret, token)

        return (token, tokenSecret)


if __name__ == "__main__":
    auth = Authenticator(b"deadbeefdeadbeef")

    print(auth.verifyToken(auth.issueToken("uuid")[0]))





