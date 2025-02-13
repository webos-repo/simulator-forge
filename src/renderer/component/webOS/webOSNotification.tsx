import React from "react";
import { motion, useAnimate } from "framer-motion";
import { tv } from "tailwind-variants";

type Props = {
  contents: string[];
  whenClose?: () => void;
};

export default function WebOSNotification({ contents, whenClose }: Props) {
  const [boxComp, boxAnimate] = useAnimate();

  const onClick = () => {
    whenClose?.();
  };

  React.useEffect(() => {
    const notiAnimate = async () => {
      if (!boxComp.current) return;
      await boxAnimate(boxComp.current, { top: 570 }, { duration: 0.3 });
      await boxAnimate(
        boxComp.current,
        { top: 720 },
        { delay: 4.7, duration: 0.3 },
      );
    };
    notiAnimate();
  }, [boxComp, boxAnimate, whenClose]);

  return (
    <div className={tWrapper()} onClickCapture={onClick}>
      <motion.section ref={boxComp} className={tBox()} initial={{ top: 720 }}>
        {contents.map((content, idx) => (
          <span key={idx}>{content}</span>
        ))}
      </motion.section>
    </div>
  );
}

const tWrapper = tv({
  base: ["w-full h-full bg-transparent z-[5]"],
});

const tBox = tv({
  base: [
    "flex flex-col justify-center items-center",
    "absolute left-[320px] z-10",
    `w-[640px] h-[120px] rounded-2xl bg-simul-card-bg`,
    "font-LGSmart2 text-[1.2rem] text-simul-card-tx leading-normal",
  ],
});
