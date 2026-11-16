import type { Metadata } from "next";
import { LegalPage } from "../legal";

export const metadata: Metadata = {
  title: "Privacy — Kyre",
  description: "What Kyre collects, what it does not, and how to get it deleted.",
};

export default function Page() {
  return (
    <LegalPage title="Privacy" updated="16 August 2026">
      <p>
        The short version: this site sets no analytics or advertising cookies,
        and the only personal data we hold is what you type into a booking form
        or send us by email.
      </p>

      <h2>The website</h2>
      <p>
        These pages are static files. There is no account system, no tracking
        pixel, no session cookie and no advertising network. We do not build a
        profile of you and we have nothing to sell to anyone who would want one.
      </p>
      <p>
        Two third parties can see a request when you use the features that need
        them. Fonts are served by Google Fonts, which receives your IP address
        as part of the request. Booking a call opens Cal.com, which handles the
        scheduling and holds whatever you enter into it under its own privacy
        policy.
      </p>

      <h2>What we hold</h2>
      <p>
        If you book a call or email us: your name, your email address, and
        whatever you chose to tell us about your product. We keep it so we can
        run the conversation and the engagement. That is the entire list.
      </p>
      <p>
        During an engagement we may be granted access to a repository and a
        staging environment. We treat everything we see there as confidential,
        we take no copies beyond a working clone, and we delete that clone when
        the engagement closes.
      </p>

      <h2>How long</h2>
      <p>
        Enquiry correspondence is kept for two years, then deleted. Engagement
        records are kept for six years because tax law requires it.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell personal data and we do not share it for marketing. It
        goes only to the service providers needed to run the business —
        scheduling, email and accounting — and to a regulator or court where the
        law compels it.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask for a copy of what we hold about you, ask us to correct it,
        or ask us to delete it. Email{" "}
        <a href="mailto:aditya@trykyre.com">aditya@trykyre.com</a> and we will
        act within 30 days. There is nothing to unsubscribe from, because we do
        not run a mailing list.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the date at the top changes with it. We do not
        make changes retroactive.
      </p>
    </LegalPage>
  );
}
