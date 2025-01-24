import styled from '@emotion/styled';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  content?: string;
  children?: ReactNode;
};

function GeneralToast({ title, content, children }: Props) {
  return (
    <GeneralToastLayout data-testid="GeneralToast">
      <TitleBox>{title}</TitleBox>
      {children || (content && <ContentBox>{content}</ContentBox>)}
    </GeneralToastLayout>
  );
}

const GeneralToastLayout = styled.section`
  display: flex;
  flex-direction: column;
  font-size: 0.8em;
`;

const TitleBox = styled.div`
  font-size: 1.3em;
  color: white;
  margin-bottom: 0.5em;
`;

const ContentBox = styled.div`
  margin-bottom: 0.3em;
`;

export default GeneralToast;
