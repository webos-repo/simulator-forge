import { Button, Input } from "@heroui/react";
import { tv } from "tailwind-variants";
import { Plus } from "lucide-react";
import TooltipWB from "@/renderer/component/tooltip/tooltipWB";

export default function AppListTopBar() {
  return (
    <section className={tTopBar()}>
      <Input
        type="text"
        variant="flat"
        size="sm"
        placeholder="Search app..."
        classNames={{
          base: ["w-96"],
          input: ["px-1"],
        }}
      />
      <TooltipWB value="Add app" placement="bottom-start">
        <Button isIconOnly variant="light" radius="lg">
          <Plus size={24} />
        </Button>
      </TooltipWB>
    </section>
  );
}
const tTopBar = tv({
  base: ["flex gap-2 items-center", "absolute top-0 right-2", "h-14"],
});
