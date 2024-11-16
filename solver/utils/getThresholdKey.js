require("dotenv").config();
const shamir = require("shamir-secret-sharing");

function hexToUint8Array(hexString) {
  return new Uint8Array(
    hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
}

const getThresholdKey = async (INDEX, TOTAL_NODES, MIN_NODES) => {
  //   const privateKeyBytes = hexToUint8Array(
  //     "c046d14283279fcd3244e8511616a9d22ada9e09f97312e38bfc15af472f26dc"
  //   );
  // Split the private key into shares using Shamir's Secret Sharing
  //   const shares = await shamir.split(privateKeyBytes, TOTAL_NODES, MIN_NODES);
  if (TOTAL_NODES == 5 && MIN_NODES == 3) {
    const shares = [
      [
        4, 174, 254, 236, 29, 153, 75, 43, 195, 252, 2, 104, 149, 186, 109, 79,
        101, 10, 43, 68, 227, 45, 123, 95, 17, 53, 237, 135, 179, 239, 108, 165,
        40,
      ],
      [
        246, 179, 73, 74, 60, 226, 169, 29, 30, 202, 131, 48, 35, 91, 254, 213,
        64, 69, 121, 113, 96, 188, 96, 151, 205, 61, 212, 65, 217, 5, 102, 155,
        38,
      ],
      [
        52, 138, 120, 178, 153, 67, 204, 170, 205, 90, 58, 52, 199, 28, 73, 44,
        36, 200, 153, 151, 100, 181, 164, 43, 64, 181, 243, 185, 155, 113, 161,
        180, 44,
      ],
      [
        209, 234, 175, 186, 48, 13, 39, 17, 88, 41, 68, 232, 4, 255, 203, 89,
        200, 9, 0, 212, 95, 162, 120, 99, 171, 227, 25, 13, 22, 170, 254, 60,
        91,
      ],
      [
        89, 69, 94, 184, 154, 222, 162, 220, 151, 120, 132, 43, 209, 21, 46, 28,
        36, 247, 26, 161, 231, 51, 219, 158, 90, 43, 244, 240, 158, 181, 171,
        121, 120,
      ],
    ];

    return shares[INDEX];
  }
  //   console.log(shares);
};

// getThresholdKey(1, 5, 3);

module.exports = { getThresholdKey };
