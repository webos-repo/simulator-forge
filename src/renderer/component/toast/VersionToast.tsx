import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { VersionToastProps } from '../../lib/toastManager';
import GeneralToast from './GeneralToast';
import { InstallationURL } from '@share/constant/urls';
import { shell, ipcRenderer } from 'electron';

function VersionToast({ currentVersion, latestVersion }: VersionToastProps) {
  return (
    <GeneralToast title="New version release">
      <Wrapper>
        <p>
          Version : <CurrentVerText>{`[${currentVersion}]`}</CurrentVerText>
          {' -> '}
          <LatestVerText>{`[${latestVersion}]`}</LatestVerText>
        </p>
        <LinkBox>
          <LinkBtn
            onClick={() => shell.openExternal(InstallationURL)}
            css={css`
              color: mediumaquamarine;
              opacity: 0.9;
              &:hover {
                color: #75e6c0;
              }
            `}
          >
            Go to install page
          </LinkBtn>
          <LinkBtn
            onClick={() =>
              ipcRenderer.send('clicked-skip-this-version', latestVersion)
            }
            css={css`
              color: white;
              opacity: 0.5;
            `}
          >
            Skip this version
          </LinkBtn>
        </LinkBox>
      </Wrapper>
    </GeneralToast>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const CurrentVerText = styled.span`
  color: #b5b5b5;
`;

const LatestVerText = styled.span`
  font-weight: 600;
  color: mediumaquamarine;
`;

const LinkBox = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
`;

const LinkBtn = styled.button`
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9em;

  &:hover {
    opacity: 1;
  }
`;

export default VersionToast;
