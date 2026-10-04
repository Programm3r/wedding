"""Render tools/envelope/generate.html in headless Edge/Chrome and save the
envelope and seal images into images/. Run from the repository root:

    python tools/envelope/build.py
"""
import base64, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BROWSERS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
]
browser = next((b for b in BROWSERS if os.path.exists(b)), None)
if not browser:
    sys.exit("No Edge or Chrome found; open tools/envelope/generate.html and save the canvases by hand.")

page = "file:///" + os.path.join(ROOT, "tools", "envelope", "generate.html").replace("\\", "/")
dom = subprocess.run([browser, "--headless=new", "--disable-gpu", "--virtual-time-budget=60000", "--dump-dom", page],
                     capture_output=True, timeout=300).stdout.decode("utf-8", "ignore")
IMAGES = (("FRONT", "envelope-front.webp"), ("FLAP", "envelope-flap.webp"),
          ("BACK", "envelope-back.webp"), ("FLAPIN", "envelope-flap-in.webp"), ("SEAL", "seal.webp"))
for key, name in IMAGES:
    m = re.search(key + r":data:image/webp;base64,([A-Za-z0-9+/=]+)", dom)
    if not m:
        sys.exit("Could not find the %s image in the rendered page." % key)
    data = base64.b64decode(m.group(1))
    with open(os.path.join(ROOT, "images", name), "wb") as f:
        f.write(data)
    print("%s  %d KB" % (name, len(data) // 1024))
