from html.parser import HTMLParser
from pathlib import Path
import html
import json
import re


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "btki_chm_extract"
OUT = ROOT / "public" / "apps" / "btki-data.js"


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_tr = False
        self.in_td = False
        self.current_row = []
        self.current_cell = []
        self.rows = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag == "tr":
            self.in_tr = True
            self.current_row = []
        elif tag == "td" and self.in_tr:
            self.in_td = True
            self.current_cell = []
        elif tag == "br" and self.in_td:
            self.current_cell.append(" ")

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "td" and self.in_td:
            text = clean_text("".join(self.current_cell))
            self.current_row.append(text)
            self.in_td = False
            self.current_cell = []
        elif tag == "tr" and self.in_tr:
            if self.current_row:
                self.rows.append(self.current_row)
            self.in_tr = False

    def handle_data(self, data):
        if self.in_td:
            self.current_cell.append(data)


def clean_text(value: str) -> str:
    value = html.unescape(value or "")
    value = value.replace("\xa0", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalize_hs(value: str) -> str:
    value = clean_text(value)
    if not value:
        return ""
    if re.fullmatch(r"\d{2}\.\d{2}", value):
        return value
    if re.fullmatch(r"\d{4}(?:\.\d{2}){1,2}", value):
        return value
    return ""


def chapter_from_file(path: Path) -> str:
    match = re.search(r"bab(\d+)_isi", path.name, flags=re.I)
    if not match:
        return ""
    chapter = int(match.group(1))
    return "98" if path.name.lower() == "bab100_isi.htm" else f"{chapter:02d}"


def parse_file(path: Path):
    parser = TableParser()
    parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
    chapter = chapter_from_file(path)
    records = []

    for row in parser.rows:
        if len(row) < 7:
            continue

        hs = normalize_hs(row[0])
        uraian = clean_text(row[1])
        description = clean_text(row[2])
        bm = clean_text(row[3])
        bk = clean_text(row[4])
        ppn = clean_text(row[5])
        ppnbm = clean_text(row[6])

        header_blob = " ".join(row[:3]).upper()
        if "POS TARIF" in header_blob or "HS CODE" in header_blob:
            continue
        if not hs or not (uraian or description):
            continue

        records.append(
            {
                "hs": hs,
                "chapter": chapter,
                "uraian": uraian,
                "description": description,
                "bm": bm or "-",
                "bk": bk or "-",
                "ppn": ppn or "-",
                "ppnbm": ppnbm or "-",
            }
        )

    return records


def main():
    files = sorted(SOURCE.glob("bab*_isi.htm"), key=lambda item: (int(re.search(r"\d+", item.name).group()), item.name))
    records = []
    for path in files:
        records.extend(parse_file(path))

    seen = set()
    unique_records = []
    for item in records:
        key = (item["hs"], item["chapter"], item["uraian"], item["description"], item["bm"], item["bk"], item["ppn"], item["ppnbm"])
        if key in seen:
            continue
        seen.add(key)
        unique_records.append(item)

    payload = {
        "source": "E-BTKI 2022 v2.1 - Agustus 2022 CHM",
        "generatedFrom": "E-BTKI 2022 v2.1- Agustus 2022.chm",
        "recordCount": len(unique_records),
        "records": unique_records,
    }
    OUT.write_text("window.BTKI_DATA = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"Wrote {len(unique_records)} records to {OUT}")


if __name__ == "__main__":
    main()
