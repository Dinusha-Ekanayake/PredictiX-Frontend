import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  showText?: boolean;
  className?: string;
};

export default function PredictiXLogo({
  size = 56,           // ⬅ bigger default
  showText = true,
  className,
}: Props) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Image
        src="/logo/predictix-icon.svg"
        alt="PredictiX Logo"
        width={size}
        height={size}
        priority
      />

      {showText && (
        <div className="leading-tight">
          <div className="text-3xl font-bold tracking-tight">
            PredictiX
          </div>
          <div className="text-base font-medium text-muted-foreground">
            AI-Powered Asset Management
          </div>
        </div>
      )}
    </div>
  );
}
