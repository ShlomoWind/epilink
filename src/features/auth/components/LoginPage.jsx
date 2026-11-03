import {
  ArrowUpLeft,
  CalendarDays,
  Check,
  CircleUserRound,
  Clock3,
  LockKeyhole,
  Sparkles,
} from 'lucide-react';
import AuthStatusMessage from '../../../components/Navbar/AuthStatusMessage';
import GoogleLoginButton from './GoogleLoginButton';

export default function LoginPage({ error, isSubmitting, onLogin }) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f6fb] px-4 py-8 sm:px-8 sm:py-12"
      dir="rtl"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 -top-40 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-36 h-[28rem] w-[28rem] rounded-full bg-fuchsia-100/70 blur-3xl"
      />

      <section
        aria-labelledby="login-title"
        className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_32px_100px_-40px_rgba(54,36,93,0.3)] lg:min-h-[610px] lg:grid-cols-2"
      >
        <div className="flex flex-col justify-center px-7 py-10 sm:px-12 sm:py-14 lg:px-14">
          <div className="mb-12 flex items-center gap-3">
            <img
              alt=""
              className="h-36 w-72 object-contain sm:h-40 sm:w-80"
              src="/epilink-logo.jpg"
            />
            <div className="sr-only">
              <p className="text-lg font-bold tracking-tight text-gray-900">
                Epilink
              </p>
              <p className="text-xs font-medium text-gray-500">
                ניהול קליניקה, בפשטות
              </p>
            </div>
          </div>

          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
            <LockKeyhole aria-hidden="true" size={21} />
          </div>
          <p className="mb-2 text-sm font-semibold text-violet-700">
            טוב שחזרת
          </p>
          <h1
            className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl"
            id="login-title"
          >
            מתחברים וממשיכים
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-gray-500">
            התחברי לחשבון שלך כדי לנהל את הלקוחות, התורים והיום שלך — במקום
            אחד.
          </p>

          {error && (
            <div className="mt-7">
              <AuthStatusMessage>{error}</AuthStatusMessage>
            </div>
          )}

          <div className="mt-8">
            <GoogleLoginButton
              fullWidth
              isSubmitting={isSubmitting}
              onLogin={onLogin}
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <LockKeyhole aria-hidden="true" size={14} />
            <span>ההתחברות מאובטחת באמצעות Google</span>
          </div>

          <p className="mt-12 text-xs text-gray-400">
            בהתחברותך, תוכן המערכת יהיה זמין לחשבונך בלבד.
          </p>
        </div>

        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#32205f] via-[#55358c] to-[#7651b5] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="absolute -left-24 -top-20 h-80 w-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -left-8 -top-4 h-48 w-48 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-36 -right-20 h-96 w-96 rounded-full bg-fuchsia-300/10 blur-2xl"
          />

          <div className="relative">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-violet-100">
              <Sparkles aria-hidden="true" size={15} />
              <span>כל מה שהקליניקה שלך צריכה</span>
            </div>
            <h2 className="max-w-sm text-4xl font-bold leading-tight tracking-tight">
              יותר סדר.
              <br />
              יותר זמן בשבילך.
            </h2>
            <p className="mt-5 max-w-sm leading-7 text-violet-100/80">
              תורים, לקוחות ומעקב — מסודרים ונגישים, כדי שתוכלי להתמקד במה
              שחשוב באמת.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-5 rounded-[2rem] bg-white/10 blur-2xl" />
            <div className="relative rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-semibold">היום שלך, במבט אחד</p>
                  <p className="mt-1 text-xs text-violet-100/70">
                    הכל מתוכנן ומוכן
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-violet-100">
                  <CalendarDays aria-hidden="true" size={20} />
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-violet-100">
                    <CircleUserRound aria-hidden="true" size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">הלקוחות שלך</p>
                    <p className="mt-0.5 text-xs text-violet-100/70">
                      הפרטים החשובים תמיד בהישג יד
                    </p>
                  </div>
                  <Check
                    aria-hidden="true"
                    className="text-emerald-200"
                    size={17}
                  />
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-violet-100">
                    <Clock3 aria-hidden="true" size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">התורים שלך</p>
                    <p className="mt-0.5 text-xs text-violet-100/70">
                      היומן המעודכן שלך, במקום אחד
                    </p>
                  </div>
                  <ArrowUpLeft
                    aria-hidden="true"
                    className="text-violet-100/70"
                    size={17}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-violet-100/60">
            Epilink · ניהול נעים יותר, בכל יום
          </p>
        </div>
      </section>
    </main>
  );
}
