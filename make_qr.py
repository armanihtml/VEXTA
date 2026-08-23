import argparse
import socket
from pathlib import Path

import qrcode


UPI = "SGTIN-DEMO-000000000001"


def get_lan_ip():

    sock = socket.socket(
        socket.AF_INET,
        socket.SOCK_DGRAM
    )

    try:

        sock.connect(
            ("8.8.8.8", 80)
        )

        return sock.getsockname()[0]

    except Exception:

        return "127.0.0.1"

    finally:

        sock.close()


parser = argparse.ArgumentParser(
    description=
    "Generate Textile DPP QR code."
)


parser.add_argument(

    "--base-url",

    help=
    "Example: http://192.168.1.20:8000"

)


parser.add_argument(

    "--output",

    default=
    "sample_product_qr.png"

)


args = parser.parse_args()


base_url = (

    args.base_url

    or

    f"http://{get_lan_ip()}:8000"

).rstrip("/")


url = (

    f"{base_url}"
    f"/dpp/{UPI}"

)


qr = qrcode.make(
    url
)


qr.save(
    args.output
)


print(
    "QR target:",
    url
)


print(
    "QR saved to:",
    Path(
        args.output
    ).resolve()
)
