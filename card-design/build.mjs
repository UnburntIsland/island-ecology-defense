import {readFileSync,writeFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const eventConfig=JSON.parse(read('event/config.json'));
if(process.env.EVENT_ENDPOINT)eventConfig.endpoint=process.env.EVENT_ENDPOINT;
if(eventConfig.endpoint&&!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(eventConfig.endpoint))throw Error('Invalid EVENT_ENDPOINT: use the deployed Apps Script /exec URL');
const qrUrls=JSON.parse(read('event/assets/qr-urls.json'));
const eventQr={};
for(const key of ['playUrl','feedbackUrl']){
 if(qrUrls[key]!==eventConfig[key])throw Error('QR URL changed: run python event/generate-qr.py');
 eventQr[key]=read('event/assets/'+key+'.svg').replace(/<\?xml[^>]*>/,'');
}
const eventCode=`const EVENT_CONFIG=${JSON.stringify(eventConfig)};\nconst EVENT_QR=${JSON.stringify(eventQr)};\n${read('event/event.js')}`;
const shapes=read('design-previews/island-tabletop/cards-all-shapes.js').replace('export const islandMark','const islandMark').replace('export {icon};','');
const stories=read('design-previews/island-tabletop/cards-all-stories.js').replaceAll('export const','const');
const license=read('design-previews/island-tabletop/assets/fonts/OFL.txt');
const code=`/* Shared V44 card presentation. No game state or randomness. */\n/* Embedded Huninn font license:\n${license}\n*/\nconst CardDesignV44=(()=>{\n${shapes}\n${stories}\n${read('card-design/renderer.js')}\n})();`;
writeFileSync('card-design/shared.js',code);
const base=read('index.html').replace(/<style id="card-design-v44">[\s\S]*?<\/style>\n/,'').replace(/<script id="card-design-code-v44">[\s\S]*?<\/script>\n/,'');
const css=read('card-design/card.css');
const font=readFileSync('design-previews/island-tabletop/assets/fonts/jf-openhuninn-2.1.ttf').toString('base64');
const arena=readFileSync('design-previews/island-tabletop/assets/island-arena-v2.png').toString('base64');
const global=`<style id="card-design-v44">@font-face{font-family:Huninn;src:url(data:font/ttf;base64,${font}) format('truetype');font-display:swap}\n${css}\n${read('card-design/game.css')}\n${read('card-design/battlefield.css')}\n#gameScreen.v39 #v27Arena,#gameScreen.v39[data-v27-phase=deploy] #v27Arena{background-image:url(data:image/png;base64,${arena})!important}</style>`;
const js=`<script id="card-design-code-v44">\n${code}\nconst CARD_STYLE_V44=${JSON.stringify(css)};\nconst EDITOR_STYLE_V46=${JSON.stringify(read('card-design/editor.css'))};\n${read('card-design/game.js')}\n${read('card-design/battlefield.js')}\n${read('card-design/usability.js')}\n${eventCode}\n</script>`;
const embeddedStyle=global.replace('</style>',read('card-design/usability.css')+'\n'+read('event/event.css')+'\n</style>').replace(/\r\n/g,'\n');
writeFileSync('index.html',base.replace('</head>',embeddedStyle+'\n</head>').replace('</body>',js.replace(/\r\n/g,'\n')+'\n</body>'));
console.log('V44 embedded: shared card renderer, stories, font, adapters. Existing rules retained verbatim.');
