const os = require("os");
const path = require("path");
const QRCode = require("qrcode");

const UPI = "SGTIN-DEMO-000000000001";

/**
 * Get the machine's LAN IPv4 address.
 * Falls back to 127.0.0.1 if none is found.
 */
function getLanIp() {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
        for (const network of interfaces[name] || []) {
            if (
                network.family === "IPv4" &&
                !network.internal
            ) {
                return network.address;
            }
        }
    }

    return "127.0.0.1";
}


/**
 * Parse command-line arguments.
 *
 * Supported:
 * --base-url http://192.168.1.20:8000
 * --output sample_product_qr.png
 */
function parseArgs() {
    const args = process.argv.slice(2);

    let baseUrl = null;
    let output = "sample_product_qr.png";

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--base-url") {
            baseUrl = args[i + 1];
            i++;
        }

        else if (args[i] === "--output") {
            output = args[i + 1];
            i++;
        }
    }

    return {
        baseUrl,
        output
    };
}


async function main() {
    const args = parseArgs();

    const baseUrl = (
        args.baseUrl ||
        `http://${getLanIp()}:8000`
    ).replace(/\/+$/, "");

    const url =
        `${baseUrl}/dpp/${UPI}`;

    await QRCode.toFile(
        args.output,
        url
    );

    console.log(
        "QR target:",
        url
    );

    console.log(
        "QR saved to:",
        path.resolve(args.output)
    );
}


main().catch((error) => {
    console.error(
        "Error generating QR code:",
        error
    );

    process.exit(1);
});