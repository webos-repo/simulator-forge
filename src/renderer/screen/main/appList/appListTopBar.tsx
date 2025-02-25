import { Input } from "@heroui/react";
import { tv } from "tailwind-variants";

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
        isClearable
      />
    </section>
  );
}
const tTopBar = tv({
  base: ["flex gap-2 items-center", "absolute top-6 right-10"],
});
