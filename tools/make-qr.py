"""Generate the QR code for the guest photo page, and a printable card sheet.

Run from the project folder:

    python -m pip install segno
    python tools/make-qr.py

Outputs into tools/qr/:
    photos-qr.svg   vector QR, for print (scales to any size without blurring)
    photos-qr.png   bitmap QR, for WhatsApp or slides
    photo-cards.html  four cards per A4 page, ready to print

The QR points at YOUR site, not at Google Photos, so the album link can change
later without reprinting anything.
"""

import pathlib
import segno

URL = "https://twoshotsofbaileys.com/photos/"
INK = "#1a2440"          # navy, dark enough for reliable scanning
OUT = pathlib.Path(__file__).parent / "qr"

OUT.mkdir(exist_ok=True)

# Error correction "Q" (25%) survives a smudge, a crease or a wine glass ring.
qr = segno.make(URL, error="q")
qr.save(OUT / "photos-qr.svg", scale=10, border=2, dark=INK, light=None)
qr.save(OUT / "photos-qr.png", scale=14, border=2, dark=INK, light="#ffffff")

svg_inline = qr.svg_inline(scale=8, border=0, dark=INK)

card = """      <article class="card">
        <p class="eyebrow">Our Wedding Weekend</p>
        <h1>Share your photos</h1>
        <div class="sprig"></div>
        <p class="lead">You saw moments we never will. Scan the code and add your
          photos to our album.</p>
        <div class="qr">%s</div>
        <p class="url">twoshotsofbaileys.com/photos</p>
      </article>
""" % svg_inline

html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Photo cards — print me</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500&family=Jost:wght@300;400;500&family=Pinyon+Script&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Jost", system-ui, sans-serif;
    background: #e9e4da;
    color: #1a2440;
  }
  .sheet {
    width: 190mm; min-height: 277mm;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 4mm;
    background: #fff;
  }
  .card {
    border: 1px dashed #c9c2b4;
    padding: 10mm 8mm;
    text-align: center;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: #fffcf6;
  }
  .card .eyebrow {
    font-size: 8pt; letter-spacing: 0.32em; text-transform: uppercase;
    color: #66703a; margin: 0 0 3mm;
  }
  .card h1 {
    font-family: "Pinyon Script", cursive; font-weight: 400;
    font-size: 30pt; line-height: 1.1; margin: 0;
    color: #7a2334;
  }
  .card .sprig {
    width: 26mm; height: 1px; background: #66703a;
    margin: 4mm 0;
  }
  .card .lead {
    font-family: "Cormorant Garamond", serif; font-style: italic;
    font-size: 12pt; line-height: 1.4; margin: 0 0 5mm;
    max-width: 70mm; color: #4a4a4a;
  }
  .card .qr { width: 40mm; height: 40mm; }
  .card .qr svg { width: 100%%; height: 100%%; display: block; }
  .card .url {
    font-size: 8pt; letter-spacing: 0.18em; text-transform: uppercase;
    margin: 4mm 0 0; color: #6b665d;
  }
  @media print {
    body { background: #fff; }
    .hint { display: none; }
  }
  .hint {
    max-width: 190mm; margin: 6mm auto; font-size: 10pt; color: #4a4a4a;
  }
</style>
</head>
<body>
  <p class="hint">Print this page (A4, actual size, colour). Four cards per sheet —
    cut along the dashed lines and put one on each table.</p>
  <div class="sheet">
%s  </div>
</body>
</html>
""" % (card * 4)

(OUT / "photo-cards.html").write_text(html, encoding="utf-8")

print("QR target :", URL)
print("written   :", OUT / "photos-qr.svg")
print("            ", OUT / "photos-qr.png")
print("            ", OUT / "photo-cards.html")
