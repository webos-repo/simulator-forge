import { Tooltip } from "@heroui/react";

type OverlayPlacement =
  | "top"
  | "bottom"
  | "right"
  | "left"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export default function TooltipWB({
  children,
  value,
  placement = "right",
}: {
  children: React.ReactNode;
  value: string;
  placement?: OverlayPlacement;
}) {
  return (
    <Tooltip
      showArrow
      delay={500}
      placement={placement}
      color={"foreground"}
      classNames={{
        content: ["py-1.5 px-3 shadow-xl", "text-black text-xs"],
      }}
      content={value}
    >
      {children}
    </Tooltip>
  );
}
