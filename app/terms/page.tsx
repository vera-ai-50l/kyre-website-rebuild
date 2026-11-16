import type { Metadata } from "next";
import { LegalPage } from "../legal";

export const metadata: Metadata = {
  title: "Terms of service — Kyre",
  description: "The terms under which Kyre engagements run.",
};

export default function Page() {
  return (
    <LegalPage title="Terms of service" updated="16 August 2026">
      <p>
        Kyre is an interface design and engineering studio operated by Golden
        Arc AI. These terms cover the website and any engagement booked through
        it. Booking a teardown or a rebuild means you accept them.
      </p>

      <h2>The engagement</h2>
      <p>
        A teardown is a written and recorded review of one screen of your
        product, delivered at no cost and with no obligation on either side. A
        rebuild is a fixed five working-day engagement producing a pull request
        against a repository you control. Scope is one screen unless the written
        agreement says otherwise.
      </p>
      <p>
        Five days means five consecutive working days from the date we receive
        repository access and a runnable local environment. Delays in either
        push the delivery date by the same number of days.
      </p>

      <h2>What you keep</h2>
      <p>
        You own all code we write for you, outright, from the moment it is
        pushed. There is no licence to grant back and no dependency on us to
        keep running it. The teardown is yours to keep and act on whether or not
        you hire us for the rebuild.
      </p>
      <p>
        We keep the right to describe the work publicly and to show before and
        after screenshots, unless you tell us in writing not to. Anything marked
        confidential stays out of that entirely.
      </p>

      <h2>Your responsibilities</h2>
      <p>
        You confirm you have the right to grant us access to whatever you grant
        us access to. You are responsible for reviewing and merging our pull
        request; we do not merge to your default branch and we do not deploy to
        your production environment.
      </p>

      <h2>Payment</h2>
      <p>
        Rebuild engagements are invoiced at the fixed price agreed in writing
        before work starts, payable within 14 days of delivery. There are no
        recurring charges and nothing renews automatically.
      </p>

      <h2>Liability</h2>
      <p>
        We deliver the work with reasonable skill and care. We are not liable
        for indirect or consequential loss, and our total liability for any
        engagement is capped at the fees paid for it. Nothing here limits
        liability that cannot lawfully be limited.
      </p>

      <h2>Ending an engagement</h2>
      <p>
        Either side can end an engagement in writing at any time. You pay for
        working days already spent; we hand over everything produced up to that
        point.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms go to{" "}
        <a href="mailto:aditya@trykyre.com">aditya@trykyre.com</a>.
      </p>
    </LegalPage>
  );
}
