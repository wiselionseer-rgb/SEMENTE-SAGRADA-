const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<\/motion\.div>\n\s*<\/motion\.div>\n\s*\);\n\s*\}\)\(\)\}\n\s*<\/AnimatePresence>\n\n\s*<AuthModal/g, 
`              </div>
            </motion.div>
          );
      })()}
      </AnimatePresence>

      <AuthModal`);

fs.writeFileSync('src/App.tsx', code);
