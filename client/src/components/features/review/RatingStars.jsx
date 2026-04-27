import { Star } from "lucide-react";

export default function RatingStars({ value = 0, onChange, size = 16 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange?.(rating)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${rating} star`}
        >
          <Star
            size={size}
            fill={rating <= value ? "var(--color-amber)" : "transparent"}
            color={rating <= value ? "var(--color-amber)" : "var(--color-cream-dark)"}
          />
        </button>
      ))}
    </div>
  );
}
