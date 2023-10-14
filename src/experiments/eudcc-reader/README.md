# EUDCC Reader

A web-based EUDCC (aka Green Pass) reader and verifier.

## What is it?

EUDCC Reader is a web app that allows you to read and verify the content of an
EUDCC (aka Green Pass) QR code.

It was built during the COVID-19 pandemic, when the European Union decided to
introduce the EUDCC to allow people to go to certain places by certifying that
they have been vaccinated, have recovered from COVID-19, or have a negative
test result.

## How does it work?

The EUDCC is a QR code that contains information about the person it belongs
to, such as their name, surname, date of birth, and so on, plus the information
related to either the vaccines they received, the recovery from COVID-19, or
the negative test result.

The content of the QR codes is computed as follows:

- Data is encoded in JSON (JavaScript Object Notation), which is the most
  common data transfer format on the web (see [here](https://datatracker.ietf.org/doc/html/rfc8259)),
  following the schema defined in
  [this repository](https://github.com/ehn-dcc-development/eu-dcc-hcert-spec);
- The JSON is encoded to CBOR (Concise Binary Object Representation), which is
  a data format thought to be compact and fast to parse (see
  [here](https://datatracker.ietf.org/doc/html/rfc8949));
- The CBOR is signed following the COSE (CBOR Object Signing and Encryption)
  specification (see [here](https://tools.ietf.org/html/rfc8152));
- The signed document is compressed using the zlib algorithm (see
  [here](https://tools.ietf.org/html/rfc1950));
- The compressed payload is encoded into Base45, which is an encoding scheme
  that allows to encode any arbitrary binary payload into a QR code (see
  [here](https://datatracker.ietf.org/doc/rfc9285));
- The Base45 payload is finally encoded into a QR code.

The apps that check for the validity of the EUDCCs need to do the process
described above in reverse order to extract the information from the QR code
and to verify that the signature is valid.

EUDCC Reader does the first part of this process: it does each step in reverse
order and allows you to inspect the content of the QR code. As of today though,
it doesn't verify the signature yet, so it's not a valid EUDCC verifier.
