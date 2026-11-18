# Rolling back to design v1

Design v1 is the site as it stood before the "Teardown mat" redesign: dark
graphite hero After screen, glass pane that tilts with the pointer, Mona Sans /
Geist Mono, the Agnost concept section, Meet the team.

| What | Value |
| --- | --- |
| Code | commit `6c96dfedc61cf4f059e54abf8291699f4772fe47` on `claude/keen-cerf-z86p59` |
| Built site | Vercel deployment `dpl_J5qEXeZzjmccnBQgyB3m68kTGagF` (project `kyre-site`) |
| Preview | https://kyre-site-p96ik97hx-vera-ai3.vercel.app |

## The one prompt

Say this to Claude in a session on this repository:

> **Switch trykyre.com back to design v1.**

That means two steps, both already defined here:

1. **Live site (instant, nothing rebuilt):** point the `trykyre.com` alias at
   deployment `dpl_J5qEXeZzjmccnBQgyB3m68kTGagF`
   (Vercel `assign_alias`, team `team_wSQN3AZFD2sQ49fJ7qlBm1mH`). The site is back
   on v1 within seconds; the redesign's deployment stays available.
2. **Code:** restore the site's files from commit `6c96dfe` on top of the
   current branch and commit it as a new commit, so history keeps the redesign
   and the next deploy builds v1:

   ```bash
   git checkout 6c96dfe -- app components lib public next.config.ts postcss.config.mjs package.json package-lock.json
   ```

   Files added only by the redesign (new fonts, new components) are removed in
   the same commit. `PRODUCT.md`, `ROLLBACK.md` and `archive/` stay.

Say "only the live site" to do step 1 alone, for example to compare the two
designs without touching the code.

## Going forward again

Point `trykyre.com` back at the redesign's latest deployment, or revert the
rollback commit.
