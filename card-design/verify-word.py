from pathlib import Path
from zipfile import ZipFile
import json, xml.etree.ElementTree as ET
from PIL import Image
from pypdf import PdfReader

root=Path('deliverables/淮德島卡牌圖片')
manifest=json.loads((root/'卡牌清單.json').read_text(encoding='utf8'))
mapping=json.loads(Path('.taste-skill/v44/word-page-map.json').read_text(encoding='utf8'))
with ZipFile('deliverables/淮德島卡牌_63x88mm_A4雙面列印.docx') as z:
    assert z.testzip() is None
    xml=ET.fromstring(z.read('word/document.xml'))
ns={'wp':'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'}
anchors=xml.findall('.//wp:anchor',ns)
assert len(anchors)==154
for a in anchors:
    e=a.find('wp:extent',ns);assert int(e.attrib['cx'])==63*36000 and int(e.attrib['cy'])==88*36000
for p in root.rglob('*.png'):
    with Image.open(p) as im:assert im.size==(1260,1760),(p,im.size)
with ZipFile('deliverables/淮德島卡牌_全套圖片.zip') as z:
    assert z.testzip() is None
    assert sum(n.endswith('.png') for n in z.namelist())==114
pdf=PdfReader('.taste-skill/v44/word-render/淮德島卡牌_63x88mm_A4雙面列印.pdf')
assert len(pdf.pages)==20
for i,p in enumerate(pdf.pages):
    assert abs(float(p.mediabox.width)*25.4/72-210)<.1
    assert abs(float(p.mediabox.height)*25.4/72-297)<.1
    sizes=[]
    for args,op in p.get_contents().operations:
        if op==b'cm' and abs(float(args[0]))>100 and abs(float(args[3]))>100:
            sizes.append((abs(float(args[0]))*25.4/72,abs(float(args[3]))*25.4/72))
    assert len(sizes)==len(mapping[i]['ids']),(i,sizes)
    assert all(abs(w-63)<.15 and abs(h-88)<.15 for w,h in sizes),(i,sizes)
report={'pages':20,'independent_pictures':154,'pngs':114,'image_size_px':[1260,1760],'docx_size_mm':[63,88],'pdf_render_size_tolerance_mm':.15,'all_pages_visually_reviewed':True,'physical_print_unverified':True}
Path('.taste-skill/v44/word-verification.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report))
