const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/              <\/div>\n            <\/div>\n          <\/div>\n            \n          <style dangerouslySetInnerHTML=/g, 
`              </div>
            </div>
            
          <style dangerouslySetInnerHTML=`);

fs.writeFileSync('src/App.tsx', code);
