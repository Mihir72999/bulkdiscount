"use client";

interface ColorPaletteProps {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
}

export function ColorPalette({
  colors,
  value,
  onChange,
}: ColorPaletteProps) {
  return (
    <div className="flex gap-2 flex-wrap cursor-pointer">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full border-2 transition
            ${
              value === color
                ? "border-black ring-2 ring-offset-2"
                : "border-gray-300"
            }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}