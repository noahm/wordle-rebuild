# Wordle, but Typescript/React

##### (and also some tweaks to hard mode)

This is a nearly pixel-perfect port of the original Wordle to React. Additional tech includes next.js, styled-components, recoil, and TypeScript.

Everything works the same as the original with a few slight changes.

- A timer has been added to keep track of how long it takes to go from your first guess to finished. Stats on your average time are tracked from day to day.

When hard mode is enabled:

- Words used as the first guess each day cannot be used as a first guess on later days

There's also a new "extreme mode" which adds further restrictions:

- letters previously revealed as absent (darkened) cannot be repeated in the same position
- letters revealed as present (yellow) must be tried in a new position

Eventually I'll probably add some backend functionality allowing in-app sharing of results, should one choose to share that way.

You can deploy your own personal copy of this for free with Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/noahm/wordle-rebuild/tree/main&project-name=wordle&repository-name=wordle)
