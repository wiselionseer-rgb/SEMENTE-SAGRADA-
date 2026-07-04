const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{selectedSeedId !== null && \(\(\) => \{/g, 
`<AnimatePresence>
      {selectedSeedId !== null && (() => {`);

code = code.replace(/return \(\s*<div className="fixed inset-0 bg-black\/95 z-\[10000\] flex items-center justify-center p-2 sm:p-6 overflow-hidden font-sans" onClick=\{\(\) => setSelectedSeedId\(null\)\}>/g, 
`return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-2 sm:p-6 overflow-hidden font-sans" 
            onClick={() => setSelectedSeedId(null)}
          >`);

code = code.replace(/<div \s*className="bg-\[#0a0a0a\] border border-white\/10 rounded-\[2rem\] w-full max-w-6xl h-full sm:h-\[90vh\] relative shadow-2xl overflow-hidden flex flex-col"/g, 
`<motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-full max-w-6xl h-full sm:h-[90vh] relative shadow-2xl overflow-hidden flex flex-col"`);

code = code.replace(/<\/div>\s*\);\s*\}\)\(\)\}\s*<AuthModal/g, 
`</motion.div>
          </motion.div>
        );
      })()}
      </AnimatePresence>

      <AuthModal`);

fs.writeFileSync('src/App.tsx', code);
