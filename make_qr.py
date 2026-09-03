"""Generate a QR code for the demo product passport."""

import argparse
import socket
from pathlib import Path

import qrcode


UPI = "SGTIN-DEMO-000000000001"


def get_lan_ip() -> str:
    """Return the machine's LAN IPv4 address, or localhost as a fallback."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as connection:
            connection.connect(("8.8.8.8", 80))
            return connection.getsockname()[0]
    except OSError:
        return "127.0.0.1"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", help="Backend base URL")
    parser.add_argument(
        "--output",
        default="sample_product_qr.png",
        help="Output PNG path",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    base_url = (args.base_url or f"http://{get_lan_ip()}:8000").rstrip("/")
    url = f"{base_url}/dpp/{UPI}"

    qrcode.make(url).save(args.output)

    print("QR target:", url)
    print("QR saved to:", Path(args.output).resolve())


if __name__ == "__main__":
    main()