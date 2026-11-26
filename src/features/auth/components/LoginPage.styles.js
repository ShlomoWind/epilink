import { ArrowUpLeft, Check } from 'lucide-react';
import styled from 'styled-components';

export const LoginLayout = styled.main`
  position: relative;
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 2rem 1rem;
  background: #f7f6fb;
  direction: rtl;

  &::before,
  &::after {
    position: absolute;
    z-index: 0;
    border-radius: 50%;
    filter: blur(48px);
    content: '';
    pointer-events: none;
  }

  &::before {
    top: -10rem;
    right: -9rem;
    width: 24rem;
    height: 24rem;
    background: rgb(221 214 254 / 0.5);
  }

  &::after {
    bottom: -12rem;
    left: -9rem;
    width: 28rem;
    height: 28rem;
    background: rgb(250 232 255 / 0.7);
  }

  @media (min-width: 640px) {
    padding: 3rem 2rem;
  }
`;

export const LoginPanel = styled.section`
  position: relative;
  z-index: 1;
  display: grid;
  width: 100%;
  max-width: 64rem;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.8);
  border-radius: 2rem;
  background: #ffffff;
  box-shadow: 0 32px 100px -40px rgb(54 36 93 / 0.3);

  @media (min-width: 1024px) {
    min-height: 38rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const LoginContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2.5rem 1.75rem;

  @media (min-width: 640px) {
    padding: 3.5rem 3rem;
  }

  @media (min-width: 1024px) {
    padding: 3.5rem;
  }
`;

export const BrandArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 3rem;
`;

export const BrandImage = styled.img`
  width: 18rem;
  height: 9rem;
  object-fit: contain;

  @media (min-width: 640px) {
    width: 20rem;
    height: 10rem;
  }
`;

export const ScreenReaderOnly = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
`;

export const SecurityIcon = styled.div`
  display: flex;
  width: 3rem;
  height: 3rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  border-radius: 1rem;
  background: #f5f3ff;
  color: #6d28d9;
  box-shadow: inset 0 0 0 1px #ede9fe;
`;

export const Greeting = styled.p`
  margin: 0 0 0.5rem;
  color: #6d28d9;
  font-size: 0.875rem;
  font-weight: 600;
`;

export const LoginTitle = styled.h1`
  margin: 0;
  color: #030712;
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.025em;

  @media (min-width: 640px) {
    font-size: 2.25rem;
  }
`;

export const LoginDescription = styled.p`
  max-width: 28rem;
  margin: 1rem 0 0;
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.75;
`;

export const LoginError = styled.div`
  margin-top: 1.75rem;
`;

export const LoginAction = styled.div`
  margin-top: 2rem;
`;

export const SecureCaption = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  color: #9ca3af;
  font-size: 0.75rem;
`;

export const PrivacyNote = styled.p`
  margin: 3rem 0 0;
  color: #9ca3af;
  font-size: 0.75rem;
`;

export const FeaturePanel = styled.div`
  position: relative;
  display: none;
  overflow: hidden;
  padding: 3.5rem 3rem;
  background: linear-gradient(135deg, #32205f, #55358c 55%, #7651b5);
  color: #ffffff;

  &::before,
  &::after {
    position: absolute;
    border: 1px solid rgb(255 255 255 / 0.1);
    border-radius: 50%;
    content: '';
  }

  &::before {
    top: -5rem;
    left: -6rem;
    width: 20rem;
    height: 20rem;
  }

  &::after {
    top: -1rem;
    left: -2rem;
    width: 12rem;
    height: 12rem;
  }

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

export const FeatureGlow = styled.div`
  position: absolute;
  right: -5rem;
  bottom: -9rem;
  width: 24rem;
  height: 24rem;
  border-radius: 50%;
  background: rgb(240 171 252 / 0.1);
  filter: blur(32px);
`;

export const FeatureIntro = styled.div`
  position: relative;
`;

export const FeaturePill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgb(255 255 255 / 0.15);
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.1);
  color: #ede9fe;
  font-size: 0.875rem;
`;

export const FeatureTitle = styled.h2`
  max-width: 24rem;
  margin: 0;
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.25;
`;

export const FeatureDescription = styled.p`
  max-width: 24rem;
  margin: 1.25rem 0 0;
  color: rgb(237 233 254 / 0.8);
  line-height: 1.75;
`;

export const PreviewWrap = styled.div`
  position: relative;
  width: 100%;
  max-width: 24rem;
  margin: 0 auto;
`;

export const PreviewGlow = styled.div`
  position: absolute;
  inset: -1.25rem;
  border-radius: 2rem;
  background: rgb(255 255 255 / 0.1);
  filter: blur(24px);
`;

export const PreviewCard = styled.div`
  position: relative;
  padding: 1.25rem;
  border: 1px solid rgb(255 255 255 / 0.15);
  border-radius: 1.5rem;
  background: rgb(255 255 255 / 0.1);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  backdrop-filter: blur(12px);
`;

export const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
`;

export const PreviewHeading = styled.div`
  min-width: 0;
`;

export const PreviewTitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
`;

export const PreviewSubtitle = styled.p`
  margin: 0.25rem 0 0;
  color: rgb(237 233 254 / 0.7);
  font-size: 0.75rem;
`;

export const PreviewIcon = styled.span`
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.1);
  color: #ede9fe;
`;

export const PreviewItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`;

export const PreviewItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.1);
`;

export const PreviewItemIcon = styled.span`
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgb(255 255 255 / 0.1);
  color: #ede9fe;
`;

export const PreviewItemText = styled.div`
  min-width: 0;
  flex: 1;
`;

export const PreviewItemTitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
`;

export const PreviewItemDescription = styled.p`
  margin: 0.125rem 0 0;
  color: rgb(237 233 254 / 0.7);
  font-size: 0.75rem;
`;

export const PreviewCheck = styled(Check)`
  flex: 0 0 auto;
  color: #a7f3d0;
`;

export const PreviewArrow = styled(ArrowUpLeft)`
  flex: 0 0 auto;
  color: rgb(237 233 254 / 0.7);
`;

export const FeatureFooter = styled.p`
  position: relative;
  margin: 0;
  color: rgb(237 233 254 / 0.6);
  font-size: 0.75rem;
`;
