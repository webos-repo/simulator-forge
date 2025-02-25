import { tv } from "tailwind-variants";
import { motion, useAnimate } from "framer-motion";
import React from "react";
import webOSLogo from "@/assets/webos_logo.png";

type Props = {
  whenFinished?: () => void;
};

export default function MainIntro({ whenFinished }: Props) {
  const [panelComp, panelAnimate] = useAnimate();
  const [logoComp, logoAnimate] = useAnimate();

  React.useEffect(() => {
    const animateLogo = async () => {
      await logoAnimate(
        logoComp.current,
        { opacity: 1 },
        { delay: 0.5, duration: 1 },
      );
      await logoAnimate(
        panelComp.current,
        { opacity: 0 },
        {
          delay: 0.5,
          duration: 0.5,
        },
      );
      whenFinished?.();
    };
    animateLogo();
  }, [logoComp, logoAnimate, panelComp, panelAnimate, whenFinished]);

  return (
    <motion.div ref={panelComp} initial={{ opacity: 1 }} className={tLayout()}>
      <motion.div
        ref={logoComp}
        initial={{ opacity: 0 }}
        className={tLogo.wrapper()}
      >
        <section className={tLogo.box()}>
          <img src={webOSLogo} alt="webOS Logo" className={tLogo.img()} />
          <span className={tLogo.text()}>TV Simulator</span>
        </section>
      </motion.div>
    </motion.div>
  );
}

const tLayout = tv({
  base: [
    "fixed z-[100]",
    "flex flex-col items-center justify-center",
    "w-screen h-screen min-w-screen min-h-screen",
    "bg-black",
  ],
});

const tLogo = {
  wrapper: tv({
    base: ["h-12"],
  }),
  box: tv({
    base: ["flex gap-3 items-center justify-center w-full h-full"],
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
