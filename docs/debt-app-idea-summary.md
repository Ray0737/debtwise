# All-in-One Debt, Tax, and Investment App — Idea Summary

Status: concept under discussion, not a finalized specification.
Date: 15 October 2026
Event: U-Hackathon 2026, Bangkok

## The idea

One app where people can see debts across banks, keep money in a partner-provided account, make repayments, manage personal taxes, and receive personalized financial guidance. An AI consultant understands the user's circumstances and helps them compare repayment, restructuring, refinancing, and investment options. Tokenomist is a proposed data source for crypto investment research where feasible.

The aim is to connect understanding with action: help users work toward affordable repayments, lower borrowing costs, prepare their taxes, and make informed decisions about available savings while protecting essential living expenses.

## The problem

People with several loans must piece together balances, rates, due dates, and payments across different lenders. Their ability to repay also depends on circumstances such as school tuition, medical expenses, reduced income, and family responsibilities.

In a nationwide survey of 6,000 Thai adults conducted on 22–28 January 2026, the National Statistical Office reported concerns about high living costs (69.9%), income insufficient for expenses (63.8%), and debt (43.1%). These are survey responses, not the percentage of people holding debt.

Source: [NSO survey release](https://www.nso.go.th/nsoweb/storage/upload_file/2026/20260317174915_47206.pdf).

## Features requested by the user

1. **All debts in one place:** balances, interest rates, monthly obligations, due dates, and progress across lenders.
2. **Money and payments in the app:** users can put money into an account and use it to repay debts across banks.
3. **Repayment recommendations:** explain which debt to prioritize and how much to pay, considering costs and the user's circumstances.
4. **An AI consultant that listens:** users can discuss why payments have become difficult, including family expenses and changes in income.
5. **Personalized plans:** incorporate essential spending and update recommendations when circumstances change.
6. **Relevant debt updates:** explain interest-rate news, lender changes, and assistance programs, distinguishing general news from confirmed changes to a user's own loan.
7. **Refinancing recommendations:** compare potentially eligible offers from other banks and calculate whether switching is worthwhile after fees, penalties, insurance requirements, promotional periods, and repayment duration.
8. **Tax management and filing assistance:** help users understand their personal tax obligations, organize records, identify potentially applicable deductions and allowances, estimate tax, and prepare for filing. The desired experience is comprehensive help with what the user needs to know; exact coverage and direct filing capabilities remain to be defined.
9. **Investment guidance, using Tokenomist if feasible:** help users understand investment options in the context of their debts, cash flow, goals, and risk tolerance. Use Tokenomist for relevant crypto token data rather than treating it as a source for every investment category.

## Tax management — proposed scope

The working assumption is Thai personal income tax, consistent with the initial target market; the user has not yet confirmed taxpayer types or jurisdictions.

- Collect and organize income records, withholding certificates, receipts, and other relevant supporting documents.
- Ask about income sources and personal circumstances to explain relevant obligations and potentially applicable expenses, deductions, allowances, and credits.
- Estimate tax payable or a potential refund, showing assumptions and missing information.
- Provide a personalized checklist, deadline reminders, and plain-language explanations through the AI consultant.
- Prepare a filing summary or draft for user review and guide the user through the official filing process.
- Incorporate expected tax payments into the debt and cash-flow plan.

Tax guidance and calculations must use official rules for the applicable tax year and the user's circumstances. Direct submission, tax payment, refund tracking, and access to Revenue Department data are desired possibilities whose integrations and permissions have not been established. Preparing a return is different from submitting it; submission requires explicit user approval and a supported route.

Source for official filing services: [Thai Revenue Department e-Filing](https://efiling.rd.go.th/rd-cms/).

## Investment guidance and Tokenomist — proposed scope

- Understand the user's goals, time horizon, risk tolerance, debts, essential expenses, tax obligations, and available cash before presenting investment options.
- Compare the tradeoffs between paying down debt, retaining emergency savings, and investing. Investment recommendations should not assume money needed for repayments or tuition is available to invest.
- For crypto research, use Tokenomist's available data on token unlocks, vesting, emissions, allocations, fundraising, burns, and buybacks.
- Explain upcoming supply events and how they relate to a user's tracked tokens, with sources and data timestamps.
- Present scenarios and uncertainties. Unlocks do not prove that a price will rise or fall, and supply data alone is insufficient for a buy or sell recommendation.
- Combine tokenomics with other information where needed, such as market liquidity, prices, portfolio exposure, and project fundamentals. Additional data sources are not yet selected.

Tokenomist does not supply Thai tax rules, bank loan rates, or comprehensive stock, bond, and fund research. API access, supported assets, commercial usage rights, and costs need verification. The scope and applicable requirements for personalized investment recommendations also need review before a live service. Automatic trading is not part of the agreed concept.

Sources: [Tokenomist API offering](https://enterprise.tokenomist.ai/), [official Tokenomist data tools](https://github.com/tokenomist-ai/tokenomist-cli).

## Suggested additions, not yet confirmed

- Prepare restructuring or hardship requests and supporting documents.
- Track applications, missing documents, lender replies, and deadlines.
- Compare actual lender offers against the whole household budget.
- Schedule payments within permissions approved by the user.

## Example experience

A user explains: “My child's tuition is due, so I cannot afford all my usual repayments this month.”

The app reviews the user's confirmed income, essential expenses, loan terms, and upcoming obligations. It shows the shortfall and explains possible next steps. Where appropriate, it helps prepare a request to the lender or compare refinancing offers. A proposed arrangement becomes effective only after lender approval.

## Business model discussion

The user is choosing between selling the product to banks and charging individuals a subscription. No final choice has been made.

| Model | Reason a customer might pay | Main challenge |
| --- | --- | --- |
| Bank or financial institution license | Help customers prepare complete cases and manage repayment, restructuring, or refinancing workflows | Sales, integrations, approval, and conflicts when another bank has a better offer |
| Individual subscription | Organization, convenience, personalized support, and potential savings | Willingness to pay, free alternatives, acquisition costs, and proving ongoing value |

**Assistant recommendation:** start with institutional software contracts and keep the core service free for borrowers. Explore implementation fees and ongoing licenses through pilots. Preserve the possibility of working with multiple institutions; an optional consumer premium plan could come later.

This is a hypothesis, not evidence of demand or profitability. An independent app and a feature embedded inside a bank are different distribution choices, and that choice remains open.

### Central business conflict

A bank paying for the product may not welcome a recommendation that moves its customer to a competitor. Whether independent cross-bank recommendations are a non-negotiable promise remains unresolved. Any commercial incentives would need to be transparent to users.

## Tools and financial partnerships

- **ElevenLabs:** preferred where useful for voice conversations with the AI consultant. Voice supports the experience; it is not the core value by itself.
- **Tokenomist:** requested as a potential input to the crypto investment research feature. Its usefulness and commercial access must be validated; it is not required for the debt or tax features.
- **Money account and payments:** the proposed starting approach is a suitable licensed financial partner. Holding funds and moving money require capabilities beyond a debt dashboard.
- **Cross-bank data:** access must be verified lender by lender and through applicable infrastructure. BOT's Your Data framework starts with personal deposit data in late 2026, with other categories expanding during 2027–2028. Universal live loan connections should not be assumed.

Source: [BOT Open Data / Your Data](https://www.bot.or.th/en/financial-innovation/digital-finance/open-data.html).

## Existing solutions and differentiation

| Existing solution | Relevant overlap | What the research establishes |
| --- | --- | --- |
| Refinn | Thai refinancing comparisons, application support, and alerts | Offers free services and paid packages; a basic refinancing recommendation is already available |
| SAM Debt Clinic and BOT debt programs | Debt assistance and restructuring pathways | Established alternatives exist; this product should help people navigate suitable options |
| Undebt.it | Debt tracking and repayment planning | Debt planning is an existing category, with free and paid offerings |

Potential differentiation to validate: combine cross-bank debt information, payments, life-aware conversations, tax preparation, and investment guidance in one experience for Thai users, with recommendations that account for the whole household budget.

**Novelty is unproven.** Research so far does not establish that nobody offers this combination, that it improves outcomes, or how profitable competitors are. More competitor research and user interviews are needed.

The expanded tax and investment features have not yet received a dedicated competitor review. Existing debt-product research does not establish novelty for these additions.

Sources:

- [Refinn refinancing](https://www.refinn.com/home-loan-refinance)
- [Refinn free and paid service options](https://www.refinn.com/aff/wellexp)
- [BOT debt measures](https://www.bot.or.th/th/debtsolution/debtsolution-measure.html)
- [BOT “ปิดหนี้ไว ไปต่อได้”](https://www.bot.or.th/th/cleardebt.html)
- [Undebt.it paid features](https://undebt.it/plus-info.php)

## Hackathon fit

The supplied judging slide shows: app execution 40%, practicality 40%, usability and design 10%, innovation and ecosystem 5%, and U-Bot integration 5%.

Suggested demonstration: turn several sample loan statements and a conversation about a life event into a checked debt overview, an explained repayment proposal, and a refinancing comparison. Any simulated payments, bank connections, or lender approvals must be identified as demonstrations.

**Assistant scope recommendation, not a user decision:** keep the full debt, tax, and investment vision in the concept, but select one complete user journey for the hackathon. Tax preparation, money custody, cross-bank payments, and personalized investing each add substantial work. A possible integrated example is allocating available money between essential expenses, an upcoming tax bill, and debt payments, then explaining whether any surplus remains for investment research. The final demonstration scope remains open.

The event permits AI and Web3 tracks. Existing projects are not allowed; pre-research is acceptable. Source: [U-Hackathon event brief](https://luma.com/lqrbtu27).

## Decisions still open

- Independent consumer app, feature inside a bank, or software offered to multiple institutions?
- Institution-funded service, consumer subscription, or a combination?
- Should the app recommend a competitor even when its paying bank loses the loan?
- Is the account dedicated to debt and bills, or also everyday spending?
- Which users and debt types come first?
- Which bank data, payment connections, and refinancing offers can actually be accessed?
- Should hardship and restructuring applications be included?
- Which Thai tax situations come first: salary income, freelance income, investment income, or a defined combination?
- Does tax assistance stop at preparing a reviewed filing summary, or include supported direct submission?
- Is investment guidance limited to crypto research, or does it cover other asset classes using additional sources?
- What level of personalization, professional support, and financial partnership is appropriate for tax and investment services?
- Is Tokenomist access available on suitable commercial terms?
- What smallest demonstration proves useful, accurate decisions within the hackathon?

## Measures of value to test

- Time saved assembling debts and preparing applications.
- Accuracy and completeness of the debt overview.
- Net refinancing savings after all costs, using comparable terms.
- Affordability and total cost of approved repayment arrangements.
- Completed applications and sustained repayment outcomes.
- User trust, institutional willingness to pay, and operating cost per supported user.
- Accuracy and completeness of tax preparation, time saved, and corrections needed before filing.
- User understanding of investment risks and whether guidance respects repayment, tax, and essential spending commitments.
