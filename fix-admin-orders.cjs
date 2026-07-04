const fs = require('fs');
let code = fs.readFileSync('src/AdminModal.tsx', 'utf-8');

code = code.replace(
  /const qOrders = query\(collectionGroup\(db, 'orders'\)\);\s*const querySnapshot = await getDocs\(qOrders\);\s*const fetchedOrders: any\[\] = \[\];\s*querySnapshot\.forEach\(\(docSnap\) => \{\s*const data = docSnap\.data\(\);\s*const parentPath = docSnap\.ref\.parent\.path;\s*const userId = parentPath\.split\('\/'\)\[1\];\s*fetchedOrders\.push\(\{ id: docSnap\.id, userId, \.\.\.data \}\);\s*\}\);/m,
  `const fetchedOrders: any[] = [];
        const usersSnap = await getDocs(collection(db, 'users'));
        for (const userDoc of usersSnap.docs) {
          const userOrdersSnap = await getDocs(collection(db, \`users/\${userDoc.id}/orders\`));
          userOrdersSnap.forEach((docSnap) => {
            fetchedOrders.push({ id: docSnap.id, userId: userDoc.id, ...docSnap.data() });
          });
        }`
);
fs.writeFileSync('src/AdminModal.tsx', code);
