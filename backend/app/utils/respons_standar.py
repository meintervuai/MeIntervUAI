"""Format respons baku: { status, data?, pesan? } (struktur_file.md §7)."""


def balasan_sukses(data=None, pesan: str | None = None) -> dict:
    isi: dict = {"status": "sukses"}
    if data is not None:
        isi["data"] = data
    if pesan:
        isi["pesan"] = pesan
    return isi