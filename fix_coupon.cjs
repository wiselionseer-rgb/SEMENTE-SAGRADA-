const fs = require('fs');
let code = fs.readFileSync('src/CheckoutPage.tsx', 'utf8');
code = code.replace(/\{\/\*\s*COUPON\s*\*\/\}.*?\{\/\*\s*SUMMARY\s*\*\/\}/s, '{/* SUMMARY */}');
fs.writeFileSync('src/CheckoutPage.tsx', code);
