const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{popupMsg && \(\s*<div className="fixed inset-0 z-\[100000\] flex items-center justify-center p-4">/g, 
`<AnimatePresence>
      {popupMsg && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
        >`);

code = code.replace(/<div \s*className="absolute inset-0 bg-black\/95 backdrop-blur-sm transition-opacity duration-300" \s*onClick=\{\(\) => setPopupMsg\(null\)\}\s*><\/div>\s*<div/g, 
`<div 
            className="absolute inset-0 bg-black/95 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setPopupMsg(null)}
          ></div>
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}`);

code = code.replace(/<\/p>\s*<\/div>\s*<\/div>\s*\)\}\s*\{selectedSeedId !== null && \(/g, 
`</p>
              </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {selectedSeedId !== null && (`);

if (!code.includes("import { motion, AnimatePresence } from 'motion/react';")) {
  code = code.replace(/import \{ Search, User/g, "import { motion, AnimatePresence } from 'motion/react';\nimport { Search, User");
}

fs.writeFileSync('src/App.tsx', code);
