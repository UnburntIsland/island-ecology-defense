import {mkdir,copyFile,writeFile} from 'node:fs/promises';
// A strict publish allowlist. Never deploy private records, QA exports or tools.
await mkdir('_site',{recursive:true});
for(const file of ['index.html','leaderboard.json'])await copyFile(file,'_site/'+file);
await writeFile('_site/.nojekyll','');
