export default function generateReferralCode() {
    const codeLength = 8;
    let code = '';

    for (let i = 0; i < codeLength; i++) {
        const randomChar = String.fromCharCode(Math.floor(Math.random() * 62) + 48);
        if (randomChar > '9') {
            code += String.fromCharCode(randomChar.charCodeAt(0) + 7);
        } else {
            code += randomChar;
        }
    }
    return code;
}