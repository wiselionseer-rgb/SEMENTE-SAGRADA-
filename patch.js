const fs = require('fs');
let code = fs.readFileSync('src/StoreModals.tsx', 'utf8');

code = code.replace(/return \(\s*<div className="fixed inset-0 bg-black\/95 z-\[10000\] flex items-center justify-center p-4 backdrop-blur-sm" onClick=\{onClose\}>\s*<div/g, 
`return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}`);

code = code.replace(/<\/div>\s*<\/div>\s*\);\s*\}/g, 
`</motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}`);

fs.writeFileSync('src/StoreModals.tsx', code);
