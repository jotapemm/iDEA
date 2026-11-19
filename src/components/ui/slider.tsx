import type { ComponentProps } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

/**
 * Slider do shadcn/ui (Radix por baixo), redesenhado para a marca: trilho de
 * um fio, alça QUADRADA branca que fica roxa enquanto é arrastada. O Radix
 * cuida do teclado (setas, Home, End, Page Up/Down) e da acessibilidade.
 */
function Slider({ className, ...props }: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex h-7 w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-px w-full grow bg-linha-forte">
        <SliderPrimitive.Range className="absolute h-px bg-texto" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 cursor-grab bg-texto transition-[background-color,transform] duration-150 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ponto-claro active:cursor-grabbing active:bg-ponto" />
    </SliderPrimitive.Root>
  );
}

export { Slider };
