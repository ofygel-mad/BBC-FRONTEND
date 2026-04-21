SVG, viewBox="0 0 24 24", без width/height атрибутов внутри файла


<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- контент -->
</svg>
viewBox всегда 0 0 24 24 — стандарт (Lucide, Heroicons, Feather)
Размер задаётся только через CSS (width, height на классе) — никогда атрибутами
fill="none" + stroke="currentColor" → цвет наследуется из CSS автоматически
Графика не должна касаться краёв viewBox — минимум 1–2px отступ со всех сторон


Итог: SVG-файл или inline SVG, 24×24 viewBox, currentColor, без размеров в разметке.

PNG/JPG/WebP — только для фотографий и скриншотов, никогда для иконок и логотипов.