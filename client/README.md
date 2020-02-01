Enigmabox Client Library
========================

Usage
-----

```javascript
const enigmabox = require("enigmabox")({
    privateKey: "...", // private key corresponding to cert
    password: "...", // password to private key, user supplied

    config: {
        "storage": localStorage,
        "tencent-cloud": true,
    },
});

// local id
const localId = enigmabox.id;

// send message
await engimabox.send("receiver id", "hello");

// check new messages
await enigmabox.receive();

```



Protocol
--------

Engima utilizes NaCl-generated public keys for identity authentication and
encryption. Each user is identified on this network by its 32-bytes public key,
which can be assigned locally by another user with a human-friendly name.

A user posts every month 1 or 2 codebooks onto the server. Each codebook
contains a long list of ephemeral public keys for a given natural month. For
communication, each ephemeral key is valid for 30 minutes, and everyday 48 keys
are used. It's validity period is given by a sequence ID within the codebook,
which equals `floor(UNIX timestamp / 1800)`.

By dividing UNIX timestamps into 30-minute **time pieces**, a sender should
always use receiver's ephemeral key valid for current and next time piece for
encrypting a message. We assume this encrypted message reaching the server and
be sorted into delivery within 30 minutes. 

The receiver, after receiving all messages for a given time piece, may destroy
the private ephemeral key for this time piece. This will render all ciphertext
for this time piece, even though been recorded by a 3rd party, undecryptable,
as both the sender and receiver have dropped their private keys. This can be
done in practice by generating a codebook using a hashed chain of private keys,
e.g. `ephemeral private key (n+1) = hash(ephemeral private key(n))`, so that
only the current private key requires storage.








EnigmaBox-Codebook Format
----------------------

An Enigma-Codebook is a signed file by a given user identity. The file consists
of:

1. four bytes head: `EBv1`
2. a NaCl generated signature on an SHA-512 hash of following payloads, 128
   bytes in total.
3. start time piece, corresponding to the 1st ephemeral key, 4 bytes
4. 1488 x (28~31) = (41664~46128) bytes of payload. Payload length varies due
   to different natural days within a month.

A EnigmaBox-Codebook has therefore `4 + 128 + 4 + (41664~46128) =
(41800~46264)` bytes.
