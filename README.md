# WinWin.travel QA Automation

E2E tests for the [WinWin.travel](https://winwin.travel/app) search page that cover max adults selection, pet options and filters that affect the search request.

Test cases for the Header (Task 1) are in this [Google Sheet](https://docs.google.com/spreadsheets/d/1VXkG-VwtfOWMclLEIosNpib0foe4ue7teuLhvRjGMLA/edit?gid=0#gid=0).

## Stack

- Playwright with TypeScript.
- Page Object Model with pages and components. Fixtures give tests a ready page object.
- ESLint and Prettier.

## Setup and run

You need Node.js 20 or newer.

```bash
git clone https://github.com/vadymchan/winwin-travel.git
cd winwin-travel
npm ci
npx playwright install chromium
```

| Command               | What it does                         |
| --------------------- | ------------------------------------ |
| `npm test`            | run all tests                        |
| `npm run test:headed` | run tests in a visible browser       |
| `npm run test:debug`  | run tests with Playwright Inspector  |
| `npm run report`      | open the HTML report of the last run |
| `npm run lint`        | run ESLint                           |

Test steps are printed in the terminal during the run, and the HTML report has screenshots of failed tests.

## Differences from the task

- I used TypeScript instead of the preferred JavaScript because types catch mistakes in page objects before the tests even run.
- The task lists Dog weights without 10-15 kg, but the site has this option, so I covered it too.
- Cat isn't in the task either so I also added a separate test for it because it hides the weight select and sends `weight=0`.
- Max adults and pets are checked both in the UI and in the page URL, since the URL holds the search state.
- Filters are checked by intercepting `GET /api/v1/offers/search` and asserting its `filters[i]` params, along with the chip state in the UI.

## Known issues

Things I noticed on the live site that are worth keeping in mind when running the tests.

- The site is slow (especially under high load). It can take 10-30 s to initialize the search, so I set the test timeout to 60 s and used 4 workers. When the site is overloaded, a lot of tests fail on the initialization wait at once, so it's better to rerun them later.
- The cookie banner shows up at a random moment, intercepts clicks and closes the Guests dialog. Tests block it with a network route instead of clicking it away.
- Adding a pet sometimes doesn't reach the URL, and the next quick change can overwrite it. Pet tests occasionally fail because of this.
- Clicks on checkboxes in the Filters dialog occasionally don't apply, so filter tests can fail from time to time.
- Removing the last filter doesn't send a new request because the site uses cached results. That's why the unchecking test applies two filters and removes one of them.
