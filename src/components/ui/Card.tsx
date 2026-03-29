import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "game";
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-green/10",
        variant === "default" && "bg-navy-card p-6",
        variant === "game" && "game-card bg-navy-card p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
