# Debtwise screenshots (phone)

> These screenshots were taken before the 2026-10-16 UI changes (chat New chat and History, bank picker, tax questionnaire, Invest graphs and spare cash, upload checks). Retake them before using them in a deck.

Phone size, 390 by 844 CSS pixels at 2x (780 by 1688 files). Taken with Playwright in Edge, with a demo family and real Thai bank names. Everything shown is demo data. Thai is in `phone/th`, English in `phone/en`, the same 35 screens in each, plus 10 whole pages.

| File | Screen |
|---|---|
| 01-landing | Landing page before login |
| 02-guide | Guide |
| 03-get-the-app | Get the app |
| 04-get-started | Get started |
| 05-support | Support |
| 06-community | Community |
| 07-terms | Terms (draft) |
| 08-privacy | Privacy (draft) |
| 09-sign-in | Sign in |
| 10 to 14-onboarding-1 to 5 | The five onboarding steps |
| 15, 16 | Year picker and day picker pop-ups |
| 20-home | Home, month at a glance |
| 21-home-no-debts | Home with no debts |
| 22-chat | Chat, first line from the app's numbers |
| 23-chat-proposal | A one-off bill proposed by the consultant |
| 24-chat-sources | The answer after applying it, with Bank of Thailand sources |
| 25-invest | Invest, live token prices and the sample unlock calendar |
| 26-tax | Tax estimate and allowances (Revenue Department rules, 2568) |
| 27-debt-by-bank, 28-debt-by-type | Debt tab |
| 29-bank-group | Loans inside one bank |
| 30-loan-detail | A loan, with payoff at the minimum |
| 31-loan-delete-popup | Delete warning |
| 32-add-debt, 33-add-debt-form | Add a debt |
| 34-review-numbers | Check the numbers from a statement |
| 35-plan | This month's plan |
| 36-plan-message-to-lender | Drafted message to the lender |
| 37-profile, 38-profile-delete-popup | Profile and its delete warning |

`phone/<lang>/full-page/` holds whole pages as one tall image (1x): landing, guide, terms, privacy, home, loan detail, plan, tax, invest, profile.

The chat reply in 23 and 24 is a scripted example, not a live AI answer. To retake the set, run the app with a mock store and capture each route at the phone size above.
