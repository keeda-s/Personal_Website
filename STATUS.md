# STATUS — keeda-s personal website

- **Now**: `claude/project-thread-nf2q2l` trims the home page so the projects come first: Looksy and Rig2Rescue as clickable stars, real stats only, a "My work" panel (projects, About, contact), the moon and surf panel moved to the unlisted `/tides` page, and the Rive character removed. PR open, awaiting Keeda's review.
- **Next**: set `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` (Looksy stats) and `RIG2RESCUE_REPO` plus optional `GITHUB_TOKEN` (Rig2Rescue progress) in Vercel; until then those stat tiles stay hidden. Then step 3: the new character intro.
- **Also open**: `villa-shell` (Villa Concierge at `/villa`) still needs the contact email and GitHub Pages enabled. Note the Pages static export drops API routes, so live data only works on Vercel.
