const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<\/div>\n\s*<\/motion\.div>\n\s*\);\n\s*\}\)\(\)\}/, 
`</div>
          </motion.div>
        );
      })()}`);

fs.writeFileSync('src/App.tsx', code);
