import { AppInfoWithState } from "@/share/structure/appInfo";
import { Image } from "@heroui/react";
import { CircleHelp } from "lucide-react";
import { tv } from "tailwind-variants";

export default function AppCard({
  appInfo: { iconRaw, title },
}: {
  appInfo: AppInfoWithState;
}) {
  return (
    <div className={tCard.card()}>
      <div className={tCard.body()}>
        <div className={tCard.bodyLeftBox()}>
          <Image
            removeWrapper
            src={iconRaw}
            alt={title}
            className={tAppIcon()}
          />
        </div>
        <div className={tCard.bodyRightBox()}>
          <CircleHelp size={24} className="text-zinc-300" />
        </div>
      </div>
      <div className={tCard.footer()}>{title}</div>
    </div>
  );
}

const tCard = {
  card: tv({
    base: [
      "flex flex-col",
      "w-full h-32 py-1 px-4",
      "rounded-2xl",
      "bg-zinc-800 bg-opacity-70",
    ],
  }),
  body: tv({
    base: ["flex justify-between", "flex-1"],
  }),
  bodyLeftBox: tv({
    base: ["flex items-center", "h-full"],
  }),
  bodyRightBox: tv({
    base: ["flex flex-col justify-between", "h-full py-2 px-1"],
  }),
  footer: tv({
    base: ["flex justify-center items-center text-medium text-zinc-300"],
  }),
};

const tAppIcon = tv({
  base: ["w-20 h-20 object-cover"],
});
