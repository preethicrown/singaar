// Builds /demo (the pitch demo with sample artists) from index.html. Run: node tools/make-demo.js
// /demo shares every asset with the main site; only the mode flag differs, so re-run this after editing index.html.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
let s=fs.readFileSync(path.join(root,'index.html'),'utf8');
s=s.replace('<head>','<head>\n<base href="../">');
s=s.replace(/href="#/g,'href="demo/#');
s=s.replace('<title>SINGAAR | Beauty meets you</title>','<title>SINGAAR Demo | Beauty meets you</title>\n<meta name="robots" content="noindex">');
s=s.replace('<script src="assets/vendor/supabase.js','<script src="demo/mode.js" defer></script>\n<script src="demo/samples.js" defer></script>\n<script src="assets/vendor/supabase.js');
fs.writeFileSync(path.join(root,'demo','index.html'),s);
fs.writeFileSync(path.join(root,'demo','mode.js'),"/* /demo runs on sample artists only: no real accounts, no live database. */\nwindow.SINGAAR_MODE='demo';\n");
console.log('demo/index.html written');
