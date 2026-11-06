"""Build-time only: pip install qrcode; python event/generate-qr.py.
The SVGs and their URL manifest are committed; game runtime has no dependency.
"""
import json
from pathlib import Path
import qrcode
import qrcode.image.svg

root = Path(__file__).resolve().parent
config = json.loads((root / 'config.json').read_text(encoding='utf-8'))
for key in ('playUrl', 'feedbackUrl'):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4)
    qr.add_data(config[key])
    qr.make(fit=True)
    qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(root / 'assets' / (key + '.svg'))
(root / 'assets' / 'qr-urls.json').write_text(json.dumps({k: config[k] for k in ('playUrl', 'feedbackUrl')}, indent=2), encoding='utf-8')
