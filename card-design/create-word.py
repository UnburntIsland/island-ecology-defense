"""Place independently editable picture objects at exact physical sizes; no raster page spreads."""
from pathlib import Path
import json, zipfile, math
from docx import Document
from docx.shared import Mm, Pt
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image, ImageOps, ImageDraw

root=Path('deliverables/淮德島卡牌圖片')
records=json.loads((root/'卡牌清單.json').read_text(encoding='utf-8'))
doc=Document();sec=doc.sections[0]
sec.page_width=Mm(210);sec.page_height=Mm(297)
sec.top_margin=sec.bottom_margin=Mm(5);sec.left_margin=sec.right_margin=Mm(7.5)
normal=doc.styles['Normal'];normal.font.name='Microsoft JhengHei';normal.font.size=Pt(8)
normal.element.rPr.rFonts.set(qn('w:eastAsia'),'Microsoft JhengHei')
normal.paragraph_format.space_before=normal.paragraph_format.space_after=Pt(0)
normal.paragraph_format.line_spacing=1
doc.core_properties.title='淮德島卡牌雙面列印稿'
doc.core_properties.subject='63 × 88 mm 卡牌 A4 100% 原尺寸 長邊翻頁'

def anchored_picture(paragraph,path,x,y,descr):
    run=paragraph.add_run();shape=run.add_picture(str(path),width=Mm(63),height=Mm(88))
    inline=shape._inline
    inline.docPr.set('descr',descr)
    anchor=OxmlElement('wp:anchor')
    for k,v in {'distT':'0','distB':'0','distL':'0','distR':'0','simplePos':'0','relativeHeight':'1','behindDoc':'0','locked':'0','layoutInCell':'1','allowOverlap':'1'}.items():anchor.set(k,v)
    simple=OxmlElement('wp:simplePos');simple.set('x','0');simple.set('y','0');anchor.append(simple)
    for tag,value in [('positionH',x),('positionV',y)]:
        pos=OxmlElement('wp:'+tag);pos.set('relativeFrom','page');offset=OxmlElement('wp:posOffset');offset.text=str(int(Mm(value)));pos.append(offset);anchor.append(pos)
    anchor.append(inline.extent)
    effect=OxmlElement('wp:effectExtent')
    for k in ['l','t','r','b']:effect.set(k,'0')
    anchor.append(effect);anchor.append(OxmlElement('wp:wrapNone'));anchor.append(inline.docPr);anchor.append(inline.find(qn('wp:cNvGraphicFramePr')));anchor.append(inline.graphic)
    inline.getparent().replace(inline,anchor)

page_map=[];page=0
for base,label in [(True,'基本卡'),(False,'升星卡')]:
    group=[r for r in records if r['base']==base]
    for start in range(0,len(group),9):
        batch=group[start:start+9]
        for back in [False,True]:
            if page:doc.add_page_break()
            page+=1
            p=doc.add_paragraph()
            p.add_run(f'{label}  {start//9+1}/{math.ceil(len(group)/9)}  {"背面" if back else "正面"}     63 × 88 mm  ·  A4 100%  ·  長邊翻頁     第 {page} 頁')
            for i,r in enumerate(batch):
                row,col=divmod(i,3)
                if back:col=2-col
                anchored_picture(p,root/r['back' if back else 'front'],7.5+66*col,13.5+91*row,f"{r['name']} {r['star']}星 {'背面' if back else '正面'}")
            page_map.append({'page':page,'group':label,'back':back,'ids':[r['id']+'-'+str(r['star']) for r in batch]})

# Keep the original PNG resolution when Word saves the file.
settings=doc.settings.element
compression=OxmlElement('w:doNotAutoCompressPictures');settings.append(compression)
path=Path('deliverables/淮德島卡牌_63x88mm_A4雙面列印.docx');doc.save(path)
Path('.taste-skill/v44/word-page-map.json').write_text(json.dumps(page_map,ensure_ascii=False,indent=2),encoding='utf-8')
readme='''淮德島卡牌列印與修改說明

尺寸：每張 63 × 88 mm。PNG 為 1260 × 1760 像素，等效 508 dpi。
Word：A4，每面最多 9 張。每張都是獨立圖片，可在 Word 選取後移動、縮放或更換。
第 1–10 頁：37 種基本卡正反面。
第 11–20 頁：20 種物種的 2 星與 4 星版本，共 40 張正反面。
奇數頁正面、接續偶數頁背面；背面已左右換位，適用直式 A4 長邊翻頁。
選取成對頁數印刷，例如 1–2 頁。先試印一組，確認比例與背面方向，再大量列印。
列印選擇 A4、原尺寸 100%，關閉「符合頁面」或自動縮放。
用尺確認卡面外緣 63 × 88 mm；沿卡面外緣裁切。留白角是圓角設計，未提供印刷廠出血。
雙面對位仍受印表機進紙偏移影響；亦可分開列印正背面再貼合。
卡背含個別物種故事，因此這份設計用於收藏禮品；背面可辨認卡種。

圖片內的文字不能直接在 Word 編輯；需要改文字時修改遊戲卡牌來源再重新輸出圖片。
調整圖片時請保留長寬比。只移動某張正面時，也要同步調整對應背面的位置。
圖檔分類：01 基本卡正面 37 張；02 卡背 37 張；03 升星正面 40 張。總計 114 PNG。
卡牌清單.json 記錄每張正面對應的背面檔名。生態資料來源另列於「生態故事來源.txt」，不印在卡面上。
'''
(root/'列印與修改說明.txt').write_text(readme,encoding='utf-8-sig')
Path('deliverables/列印說明.txt').write_text(readme,encoding='utf-8-sig')
with zipfile.ZipFile('deliverables/淮德島卡牌_全套圖片.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted(root.rglob('*')):
        if f.is_file():z.write(f,f.relative_to(root))
print(json.dumps({'docx':str(path),'pages':page,'picture_objects':sum(len(p['ids']) for p in page_map),'pngs':len(list(root.rglob('*.png')))},ensure_ascii=False))

# Review all distinct fronts and backs without altering delivery images.
out=Path('.taste-skill/v44/contact');out.mkdir(exist_ok=True)
for folder in ['01_基本卡正面','02_卡背','03_升星正面']:
    files=sorted((root/folder).glob('*.png'))
    for batch_start in range(0,len(files),8):
        selected=files[batch_start:batch_start+8]
        canvas=Image.new('RGB',(1260,920),'#e7ece6')
        for i,f in enumerate(selected):
            im=Image.open(f);im.thumbnail((300,420))
            x=(i%4)*315+7;y=(i//4)*460
            canvas.paste(im,(x,y));ImageDraw.Draw(canvas).text((x,y+425),f.name.split('_')[0],fill='black')
        canvas.save(out/f'{folder}_{batch_start//8+1}.jpg')
