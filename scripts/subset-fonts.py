"""
Subset font Jepang (Zen Antique, Dela Gothic One) hanya ke glyph yang dipakai situs.

Font CJK penuh berukuran megabyte dan CSS @fontsource-nya ratusan KB
(ratusan blok unicode-range). Skrip ini memindai src/ untuk semua karakter
CJK/kana yang benar-benar muncul, men-subset potongan woff2 dari @fontsource
(lisensi SIL OFL 1.1), lalu menulis:
  - public/fonts/<family>-<n>.woff2
  - src/styles/fonts-jp.css (deklarasi @font-face + unicode-range)

Jalankan: npm run fonts   (butuh: pip install fonttools brotli)
"""
from __future__ import annotations

import pathlib
import re

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT_DIR = ROOT / "public" / "fonts"
CSS_OUT = SRC / "styles" / "fonts-jp.css"

FAMILIES = {
    "Zen Antique": ("zen-antique", "zen-antique"),
    "Dela Gothic One": ("dela-gothic-one", "dela-gothic-one"),
}

# Hiragana, Katakana, CJK, tanda baca CJK, fullwidth forms
JP_RE = re.compile(r"[　-〿぀-ゟ゠-ヿ㐀-䶿一-鿿＀-￯]")
# Glyph ekstra yang selalu disertakan (dipakai di canvas/shader)
EXTRA = "刺客資格四角視覚死角シカクユゲル吸血鬼殺し屋藤本タツキ"


def collect_chars() -> set[str]:
    chars: set[str] = set(EXTRA)
    for path in SRC.rglob("*"):
        if path.suffix not in {".ts", ".tsx", ".json", ".css"} or path == CSS_OUT:
            continue
        chars.update(JP_RE.findall(path.read_text(encoding="utf-8")))
    return chars


def unicode_range(codepoints: list[int]) -> str:
    codepoints = sorted(codepoints)
    ranges: list[str] = []
    start = prev = codepoints[0]
    for cp in codepoints[1:]:
        if cp == prev + 1:
            prev = cp
            continue
        ranges.append(f"U+{start:X}" if start == prev else f"U+{start:X}-{prev:X}")
        start = prev = cp
    ranges.append(f"U+{start:X}" if start == prev else f"U+{start:X}-{prev:X}")
    return ", ".join(ranges)


def main() -> None:
    chars = collect_chars()
    wanted = {ord(c) for c in chars}
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*.woff2"):
        old.unlink()

    css = [
        "/* AUTO-GENERATED oleh scripts/subset-fonts.py — jangan edit manual. */",
        f"/* {len(chars)} glyph CJK/kana dipakai situs. Lisensi font: SIL OFL 1.1. */",
    ]
    total = 0
    for family, (pkg, prefix) in FAMILIES.items():
        files = sorted((ROOT / "node_modules" / "@fontsource" / pkg / "files").glob(f"{prefix}-*-400-normal.woff2"))
        index = 0
        for f in files:
            font = TTFont(f)
            cmap = font.getBestCmap() or {}
            hit = sorted(wanted & set(cmap.keys()))
            if not hit:
                continue
            opts = Options()
            opts.flavor = "woff2"
            opts.layout_features = ["*"]
            opts.name_IDs = ["*"]
            opts.notdef_outline = True
            sub = Subsetter(opts)
            sub.populate(unicodes=hit)
            sub.subset(font)
            name = f"{prefix}-{index}.woff2"
            out = OUT_DIR / name
            font.flavor = "woff2"
            font.save(out)
            total += out.stat().st_size
            css.append(
                "@font-face {\n"
                f"  font-family: '{family}';\n"
                "  font-style: normal;\n"
                "  font-weight: 400;\n"
                "  font-display: swap;\n"
                f"  src: url('/fonts/{name}') format('woff2');\n"
                f"  unicode-range: {unicode_range(hit)};\n"
                "}"
            )
            index += 1
    CSS_OUT.write_text("\n".join(css) + "\n", encoding="utf-8")
    print(f"{len(chars)} glyph, {total / 1024:.1f} KB total -> {OUT_DIR}")


if __name__ == "__main__":
    main()
