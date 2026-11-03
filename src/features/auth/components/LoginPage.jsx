import {
  CalendarDays,
  CircleUserRound,
  Clock3,
  LockKeyhole,
  Sparkles,
} from 'lucide-react';
import AuthStatusMessage from '../../../components/Navbar/AuthStatusMessage';
import GoogleLoginButton from './GoogleLoginButton';
import {
  BrandArea,
  BrandImage,
  FeatureDescription,
  FeatureFooter,
  FeatureGlow,
  FeatureIntro,
  FeaturePanel,
  FeaturePill,
  FeatureTitle,
  Greeting,
  LoginAction,
  LoginContent,
  LoginDescription,
  LoginError,
  LoginLayout,
  LoginPanel,
  LoginTitle,
  PreviewArrow,
  PreviewCard,
  PreviewCheck,
  PreviewGlow,
  PreviewHeader,
  PreviewHeading,
  PreviewIcon,
  PreviewItems,
  PreviewItem,
  PreviewItemDescription,
  PreviewItemIcon,
  PreviewItemText,
  PreviewItemTitle,
  PreviewSubtitle,
  PreviewTitle,
  PreviewWrap,
  PrivacyNote,
  SecureCaption,
  SecurityIcon,
  ScreenReaderOnly,
} from './LoginPage.styles';

export default function LoginPage({ error, isSubmitting, onLogin }) {
  return (
    <LoginLayout>
      <LoginPanel
        aria-labelledby="login-title"
      >
        <LoginContent>
          <BrandArea>
            <BrandImage
              alt=""
              src="/epilink-logo.jpg"
            />
            <ScreenReaderOnly>
              <p>
                Epilink
              </p>
              <p>
                ניהול קליניקה, בפשטות
              </p>
            </ScreenReaderOnly>
          </BrandArea>

          <SecurityIcon>
            <LockKeyhole aria-hidden="true" size={21} />
          </SecurityIcon>
          <Greeting>טוב שחזרת</Greeting>
          <LoginTitle id="login-title">
            מתחברים וממשיכים
          </LoginTitle>
          <LoginDescription>
            התחברי לחשבון שלך כדי לנהל את הלקוחות, התורים והיום שלך — במקום
            אחד.
          </LoginDescription>

          {error && (
            <LoginError>
              <AuthStatusMessage>{error}</AuthStatusMessage>
            </LoginError>
          )}

          <LoginAction>
            <GoogleLoginButton
              fullWidth
              isSubmitting={isSubmitting}
              onLogin={onLogin}
            />
          </LoginAction>

          <SecureCaption>
            <LockKeyhole aria-hidden="true" size={14} />
            <span>ההתחברות מאובטחת באמצעות Google</span>
          </SecureCaption>

          <PrivacyNote>
            בהתחברותך, תוכן המערכת יהיה זמין לחשבונך בלבד.
          </PrivacyNote>
        </LoginContent>

        <FeaturePanel>
          <FeatureGlow />

          <FeatureIntro>
            <FeaturePill>
              <Sparkles aria-hidden="true" size={15} />
              <span>כל מה שהקליניקה שלך צריכה</span>
            </FeaturePill>
            <FeatureTitle>
              יותר סדר.
              <br />
              יותר זמן בשבילך.
            </FeatureTitle>
            <FeatureDescription>
              תורים, לקוחות ומעקב — מסודרים ונגישים, כדי שתוכלי להתמקד במה
              שחשוב באמת.
            </FeatureDescription>
          </FeatureIntro>

          <PreviewWrap>
            <PreviewGlow />
            <PreviewCard>
              <PreviewHeader>
                <PreviewHeading>
                  <PreviewTitle>היום שלך, במבט אחד</PreviewTitle>
                  <PreviewSubtitle>
                    הכל מתוכנן ומוכן
                  </PreviewSubtitle>
                </PreviewHeading>
                <PreviewIcon>
                  <CalendarDays aria-hidden="true" size={20} />
                </PreviewIcon>
              </PreviewHeader>

              <PreviewItems>
                <PreviewItem>
                  <PreviewItemIcon>
                    <CircleUserRound aria-hidden="true" size={18} />
                  </PreviewItemIcon>
                  <PreviewItemText>
                    <PreviewItemTitle>הלקוחות שלך</PreviewItemTitle>
                    <PreviewItemDescription>
                      הפרטים החשובים תמיד בהישג יד
                    </PreviewItemDescription>
                  </PreviewItemText>
                  <PreviewCheck aria-hidden="true" size={17} />
                </PreviewItem>

                <PreviewItem>
                  <PreviewItemIcon>
                    <Clock3 aria-hidden="true" size={18} />
                  </PreviewItemIcon>
                  <PreviewItemText>
                    <PreviewItemTitle>התורים שלך</PreviewItemTitle>
                    <PreviewItemDescription>
                      היומן המעודכן שלך, במקום אחד
                    </PreviewItemDescription>
                  </PreviewItemText>
                  <PreviewArrow aria-hidden="true" size={17} />
                </PreviewItem>
              </PreviewItems>
            </PreviewCard>
          </PreviewWrap>

          <FeatureFooter>
            Epilink · ניהול נעים יותר, בכל יום
          </FeatureFooter>
        </FeaturePanel>
      </LoginPanel>
    </LoginLayout>
  );
}
