const { authenticator } = require("otplib");
const QRCode = require("qrcode");

function generateSecret(email) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, "RealEstateApp", secret);
  return { secret, otpauth };
}

async function generateQRCode(otpauthUrl) {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

function verifyToken(token, secret) {
  try {
    return authenticator.verify({
      token,
      secret,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
}

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
};
