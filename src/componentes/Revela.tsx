/**
 * Aparece quando chega na tela.
 *
 * Diferente do <Revela> da IVE, aqui o estado de REPOUSO é visível. O bloco
 * nasce aparecendo; só quando está prestes a entrar na tela (12% antes da
 * borda de baixo) ele ganha `.surge`, e é a animação que parte de opacidade
 * zero. Como isso acontece fora da vista, a pessoa só vê a subida.
 *
 * Isso garante que nada fica invisível esperando um observer: miniatura de
 * link, leitor que pula direto para uma âncora, navegador sem
 * IntersectionObserver, todos veem o texto.
 *
 * `once`: o observer se desliga depois da primeira vez.
 */
import { useEffect, useRef, useState, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Atraso da animação, em ms, para escalonar blocos vizinhos. */
  atraso?: number;
  como?: ElementType;
  className?: string;
} & HTMLAttributes<HTMLElement>;

export function Revela({ children, atraso = 0, como: Tag = "div", className = "", style, ...resto }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [surge, setSurge] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Já está na tela na montagem (recarregou no meio da página): não anima,
    // senão o bloco piscaria para zero na frente da pessoa.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setSurge(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px 12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      {...resto}
      ref={ref}
      className={`${surge ? "surge" : ""} ${className}`}
      style={atraso ? ({ ...style, "--atraso": `${atraso}ms` } as CSSProperties) : style}
    >
      {children}
    </Tag>
  );
}
