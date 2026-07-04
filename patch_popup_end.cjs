const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<\/style>\s*<\/div>\s*\}\)\(\)\}\s*<\/AnimatePresence>/, ''); // remove my broken fix if it was there? No wait, my broken fix didn't match.

code = code.replace(/          `\}\} \/>\n        <\/div>\n      \)\}\n    <\/div>\n  \);\n\}/g, 
`          \`}} />
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}`);

fs.writeFileSync('src/App.tsx', code);
