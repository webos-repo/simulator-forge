import { Global, css } from '@emotion/react';
import normalize from './normalize';
import reset from './reset';

function GlobalStyles() {
  return (
    <Global
      styles={css`
        ${normalize};
        ${reset};
        body {
          overflow: hidden;
          font-family: Arial, sans-serif;
        }

        button {
          background: transparent;
          box-shadow: 0px 0px 0px transparent;
          border: 0px solid transparent;
          text-shadow: 0px 0px 0px transparent;
          outline: none;
        }
      `}
    />
  );
}

export default GlobalStyles;
