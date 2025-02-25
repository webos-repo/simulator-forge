import { Button } from "@heroui/react";
import { tv } from "tailwind-variants";

export default function FunctionBar() {
  return (
    <section className={tLayout()}>
      <Button variant="solid" className={tButton()}>
        abc
      </Button>
    </section>
  );
}

const tLayout = tv({
  base: ["flex justify-between items-center", "w-full h-20", "px-6"],
});

const tButton = tv({
  base: ["h-20 w-24", "rounded-3xl"],
});
