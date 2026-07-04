const fs = require('fs');
let code = fs.readFileSync('src/CouponPopup.tsx', 'utf8');

if (!code.includes("import { motion, AnimatePresence } from 'motion/react';")) {
  code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';");
}

code = code.replace(/if \(!visible \|\| coupons\.length === 0\) return null;/, "");
code = code.replace(/const currentCoupon = coupons\[currentCouponIndex\];\n  if \(!currentCoupon\) return null;/, "const currentCoupon = coupons[currentCouponIndex];");

code = code.replace(/return \(\s*<div className="fixed bottom-24 right-4 z-\[9999\] bg-\[#111\] border-2 border-\[#00ffff\] rounded-xl p-4 shadow-\[0_0_20px_rgba\(0,255,255,0\.4\)\] max-w-\[280px\] transition-all duration-500 ease-in-out transform translate-y-0 opacity-100">/g, 
`return (
    <AnimatePresence>
      {(visible && coupons.length > 0 && currentCoupon) && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-24 right-4 z-[9999] bg-[#111] border-2 border-[#00ffff] rounded-xl p-4 shadow-[0_0_20px_rgba(0,255,255,0.4)] max-w-[280px]"
        >`);

code = code.replace(/<\/div>\s*<\/div>\s*\);\s*\};/g, 
`      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};`);

fs.writeFileSync('src/CouponPopup.tsx', code);
