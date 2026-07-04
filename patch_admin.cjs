const fs = require('fs');
let code = fs.readFileSync('src/AdminModal.tsx', 'utf8');

code = code.replace(/interface AdminModalProps \{/, 'interface AdminModalProps {\n  isOpen: boolean;');
code = code.replace(/export const AdminModal: React\.FC<AdminModalProps> = \(\{ onClose \}\) => \{/, 'export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {');

code = code.replace(/<AnimatePresence>\s*<motion\.div\s*initial=\{\{ opacity: 0 \}\}\s*animate=\{\{ opacity: 1 \}\}\s*exit=\{\{ opacity: 0 \}\}\s*className="fixed inset-0 bg-black\/95 z-\[99999\] flex flex-col font-sans"\s*>/g, 
`<AnimatePresence>
      {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 z-[99999] flex flex-col font-sans"
      >`);

code = code.replace(/<\/motion\.div>\s*<\/AnimatePresence>/g, 
`      </motion.div>
      )}
    </AnimatePresence>`);

fs.writeFileSync('src/AdminModal.tsx', code);

// Now update App.tsx to pass isOpen to AdminModal and render it always.
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/\{isAdminOpen && <AdminModal onClose=\{\(\) => setIsAdminOpen\(false\)\} \/>\}/, 
`<AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />`);
fs.writeFileSync('src/App.tsx', appCode);

