# Offline review workflow before Claude sessions resume

This offline review module records a reviewer decision on an agent examination submission. It supports revision, rejection, or approval **for internal training only**. It does not authenticate reviewer identities or verify the law, so the metadata is not proof of a qualified professional review.

For legal cases, a qualified human reviewer must separately verify the applicable statute, amendment, commencement date, relevant tax period and exact source text against an official primary source. Do not use placeholder URLs as legal evidence.

Run `python -m unittest discover -s academy/tests -v` to exercise the offline module. Claude access and API keys are not needed.

No client information, URA credentials, tax filings or production endpoints are involved. No output can grant professional credentials or authorize deployment.
