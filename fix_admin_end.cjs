const fs = require('fs');
let code = fs.readFileSync('src/AdminModal.tsx', 'utf8');

code = code.replace(/          \)}\n        <\/div>\n            <\/motion\.div>\n      \)\}\n    <\/AnimatePresence>/g, 
`          )}
        </div>
      </div>
    </motion.div>
      )}
    </AnimatePresence>`);

fs.writeFileSync('src/AdminModal.tsx', code);
