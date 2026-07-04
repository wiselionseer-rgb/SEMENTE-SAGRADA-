const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

const regexEmail = /(request\.auth\.token\.email == 'lucasdanieltrader@gmail\.com' \|\| request\.auth\.token\.email == 'wiselionseer@gmail\.com' \|\| request\.auth\.token\.email == 'wiselisonseer@gmail\.com' \|\| request\.auth\.token\.email == 'lucasdanielneres10@gmail\.com')/g;
const replaceEmail = "(request.auth.token.email.matches('(?i)^lucasdanieltrader@gmail\\\\.com$') || request.auth.token.email.matches('(?i)^wiselionseer@gmail\\\\.com$') || request.auth.token.email.matches('(?i)^wiselisonseer@gmail\\\\.com$') || request.auth.token.email.matches('(?i)^lucasdanielneres10@gmail\\\\.com$'))";

code = code.replace(regexEmail, replaceEmail);
fs.writeFileSync('firestore.rules', code);
