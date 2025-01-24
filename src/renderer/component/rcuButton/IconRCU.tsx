import { css } from '@emotion/react';
import type { SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';

type IconRCUProps = {
  iconImage?: any;
  iconAdditionalCSS?: SerializedStyles;
  iconNoInvert?: boolean;
};

function IconRCU(props: IconRCUProps) {
  const { iconImage } = props;

  return iconImage ? <Icon {...props} /> : null;
}

const Icon = styled.div<IconRCUProps>(
  ({ iconImage, iconNoInvert, iconAdditionalCSS }) => css`
    width: 12.5vw;
    height: 12.5vw;
    background-size: cover;
    background-position: center;
    filter: invert(90%);
    background-image: url(${iconImage});

    ${iconAdditionalCSS}

    ${iconNoInvert &&
    css`
      filter: none;
      opacity: 1;
    `}
  `
);

export default IconRCU;
export type { IconRCUProps };
