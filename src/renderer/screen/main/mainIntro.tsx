import { tv } from "tailwind-variants";
import webOSLogo from "@/assets/webos_logo.png";
import { motion, useAnimate } from "framer-motion";
import React from "react";

type Props = {
  whenFinished?: () => void;
};

export default function MainIntro({ whenFinished }: Props) {
  const [panelRef, panelAnimate] = useAnimate();
  const [logoComp, logoAnimate] = useAnimate();

  React.useEffect(() => {
    const animateLogo = async () => {
      await logoAnimate(
        logoComp.current,
        { opacity: 1 },
        { delay: 0.5, duration: 1 },
      );
      await logoAnimate(
        panelRef.current,
        { opacity: 0 },
        {
          delay: 0.5,
          duration: 0.5,
        },
      );
      whenFinished?.();
    };
    animateLogo();
  }, [logoComp, logoAnimate, panelRef, panelAnimate, whenFinished]);

  return (
    <motion.div ref={panelRef} initial={{ opacity: 1 }} className={tLayout()}>
      <motion.div
        ref={logoComp}
        initial={{ opacity: 0 }}
        className={tLogo.box()}
      >
        <img src={webOSLogo} alt="webOS Logo" className={tLogo.img()} />
        <span className={tLogo.text()}>TV Simulator</span>
      </motion.div>
    </motion.div>
  );
}

const tLayout = tv({
  base: [
    "fixed z-10",
    "flex flex-col items-center justify-center",
    "w-screen h-screen min-w-screen min-h-screen",
    "bg-black",
  ],
});

const tLogo = {
  box: tv({
    base: ["flex gap-3 items-center justify-center h-12"],
  }),
  img: tv({
    base: ["h-full"],
  }),
  text: tv({
    base: [
      "font-light text-6xl",
      "bg-clip-text text-transparent bg-gradient-to-r from-[#C30036] to-gray-400",
    ],
  }),
};
