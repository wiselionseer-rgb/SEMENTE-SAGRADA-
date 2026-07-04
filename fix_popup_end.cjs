const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /          `\}\} \/>\n        <\/div>\n      \)\}\n    <\/div>\n  \);\n\}/g;

code = code.replace(regex, 
`          \`}} />
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}`);

fs.writeFileSync('src/App.tsx', code);
