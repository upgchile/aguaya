"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rateOrder } from "@/lib/actions/order-actions";
import { toast } from "sonner";

interface RatingStarsProps {
  orderId: string;
  existingRating?: number | null;
  onRated?: () => void;
}

export function RatingStars({
  orderId,
  existingRating,
  onRated,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(existingRating ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingRating);

  if (submitted) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-4 ${
              star <= selected
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">
          {selected}/5
        </span>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (selected === 0) {
      toast.error("Selecciona una calificación");
      return;
    }

    setSubmitting(true);
    const result = await rateOrder(orderId, selected);

    if (result.error) {
      toast.error("Error al calificar", { description: result.error });
    } else {
      toast.success("Gracias por tu calificación");
      setSubmitted(true);
      onRated?.();
    }
    setSubmitting(false);
  };

  const activeValue = hovered || selected;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitting}
            className="p-0.5 transition-transform hover:scale-110 active:scale-95 disabled:pointer-events-none"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(star)}
          >
            <Star
              className={`size-6 transition-colors ${
                star <= activeValue
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
      <AnimatePresence>
        {selected > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              size="sm"
              className="h-7 bg-primary px-3 text-xs"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                "Enviar"
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
