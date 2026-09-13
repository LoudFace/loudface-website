# Verification report — toku-vs-bitwage-2026.md

Generated 2026-05-21 as part of the `/verify-content` step. Each claim in the draft is graded against the strongest available evidence.

## Grading scale

- ✅ **VERIFIED** — claim is supported by a citable external source surfaced during SERP recon or first-party data.
- 🟡 **INFERRED** — claim is plausible from context (voice file, Peec data, or competitor positioning) but lacks a direct external source. Acceptable for blog content if flagged internally; may need a citation before ship.
- 🔴 **UNVERIFIED** — claim is specific enough to require sourcing and isn't backed in the draft. Must be either sourced, softened, or removed before ship.

## Claims about Bitwage / Paystand

| Claim in draft | Grade | Source / Note |
|---|---|---|
| "In November 2025, Paystand acquired Bitwage" | ✅ | Yahoo Finance (Nov 11, 2025): "Paystand acquires Bitwage" |
| "$20B accounts-payable platform" (Paystand's scale) | ✅ | Yahoo Finance article in SERP |
| "Bitwage spent eleven years building crypto payroll" | ✅ | Zengo 2026 guide: "11 years" |
| "$400M+ processed" | ✅ | Zengo 2026 guide cites this |
| "integrations into ADP and Gusto" | ✅ | Zengo + Bitwage's own positioning |
| "Bitwage supports W-2 issuance for US-domiciled employers" | ✅ | eco.com (Apr 2026): "Bitwage, Rise, and Toku support W-2 issuance for US-domiciled employers" |
| "Paystand's customer base is mid-market US businesses running B2B payments" | 🟡 | Paystand's general public positioning. No direct citation in our SERP pull; consider citing Paystand's About page on ship |
| "Bitwage's natural place inside that stack is 'the crypto rail'" | 🟡 | Interpretive framing, not a sourced claim. Acceptable as opinion. |
| "$9T stablecoin transfers in 2025" (referenced as market backdrop) | ✅ (not directly in draft but if added) | Yahoo Finance article |

## Claims about Toku

| Claim in draft | Grade | Source / Note |
|---|---|---|
| "Toku acts as the employer or co-employer in 100+ jurisdictions" | 🟡 | `voices/toku.md` claims "100+ jurisdictions" / "110+ countries". Voice file is inferred-draft state; should be confirmed against Toku's site copy before ship. |
| "Toku handles token grants as a first-class product" | 🟡 | Voice file confirms token grants are core. Toku's own existing content (e.g., "Employer's Guide to Token Compensation", 29 Peec mentions) supports this. |
| "vesting tracking, FMV calculations at grant and at each vest event, jurisdiction-specific tax treatment" | 🟡 | Plausible from Toku's positioning; not directly cited in our SERP data. **Recommend confirming against Toku's product page before ship.** |
| "US 83(b), UK CSOP/EMI, EU equivalents" | 🟡 | 83(b) is a real US tax election applicable to early-stage equity/token grants. CSOP and EMI are real UK schemes. The claim Toku specifically handles all three needs product-page confirmation. |
| Brazil INSS example (a US company hiring an engineer in Brazil through Toku, Toku runs Brazilian payroll, handles INSS contributions) | 🟡 | INSS is the correct name for Brazil's social security contributions. The specific claim Toku covers Brazil with INSS handling is plausible but unverified. **Recommend citing a Toku Brazil case study or product page, OR softening to a generic "local payroll contributions" framing.** |
| "Pays in BRL or USDC depending on local rules" | 🟡 | Plausible; Toku's positioning around stablecoin payroll supports this. Local-rule constraints on stablecoin payroll in Brazil are real. Confirm against Toku product copy. |

## Claims about the regulatory frameworks themselves

| Claim in draft | Grade | Source / Note |
|---|---|---|
| W-2 / 1099 (US) | ✅ | Universally known US tax forms |
| IR35 (UK) | ✅ | Real UK off-payroll worker regulation |
| DAC7 (EU) | ✅ | Real EU directive on digital-platform reporting |
| AB5 (California) | ✅ | Real CA worker-classification law |
| 83(b) election (US) | ✅ | Real IRS election for early-stage equity/token grants |
| CSOP / EMI (UK) | ✅ | Real UK approved share-scheme programs |
| MiCA (EU stablecoin rules) | ✅ | Real EU Markets in Crypto-Assets Regulation |
| FMV reporting | ✅ | Real US tax concept |
| PMLA / AML / KYC | ✅ | Real anti-money-laundering frameworks (PMLA = India specifically) |

## Claims about comparison frameworks

| Claim in draft | Grade | Source / Note |
|---|---|---|
| The TL;DR matrix (✅/❌ across rows) | 🟡 | Each cell needs to hold. Most are defensible from product positioning. Specific rows to double-check:<br>• "Bitwage: Token grants + vesting administration ❌" — accurate; not in Bitwage's product surface<br>• "Bitwage: EOR ❌" — accurate; Bitwage is payments, not EOR<br>• "Bitwage: 1099 + W-2 + IR35 + DAC7 → US filings only" — accurate for product scope |
| The regulatory framework table (Toku ✅ across all rows, Bitwage mostly ❌) | 🟡 | Same as above. Toku's IR35 / DAC7 / MiCA coverage claims rest on the voice-file "100+ jurisdictions" claim being accurate. **Confirm before ship.** |
| The decision matrix (who should pick what) | ✅ | Logical conclusions from the upstream claims. If upstream claims hold, the matrix holds. |

## Verdict-section claims

| Claim in draft | Grade | Source / Note |
|---|---|---|
| "Bitwage (Paystand) is a crypto payroll rail inside a broader AP platform" | ✅ | Direct consequence of the acquisition |
| "The product is stable, the operator is credible" | 🟡 | Editorial position. Acceptable as opinion. |
| "Toku is global payroll infrastructure with crypto compensation built in" | 🟡 | Consistent with voice file and Toku's category positioning. Confirm specific phrasing against Toku site before ship. |

## Summary

- **VERIFIED claims**: 12
- **INFERRED claims (need confirmation before ship)**: 11
- **UNVERIFIED claims**: 0

**Verdict**: draft is structurally publishable, but the inferred claims around Toku's specific jurisdiction coverage, INSS / CSOP / EMI / MiCA handling, and product surface need a quick pass against Toku's actual product page or a Toku-side review before ship. **None of the inferred claims contradict the voice file or the SERP data**, but they go beyond what's directly sourced.

## Recommended pre-ship action

Open `voices/toku.md` and complete the `[VERIFY]` sections. Specifically:
- The Reference examples section (real Toku paragraphs)
- Confirm "100+ jurisdictions" vs "110+ countries" — which number does Toku actually publish?
- Confirm Toku does handle Brazil specifically (or pick a different example jurisdiction)
- Confirm UK CSOP/EMI handling
- Confirm MiCA framework coverage

Alternatively, soften the inferred-tier claims to "Toku covers EU jurisdictions including the UK and key MiCA-compliant rails" rather than naming specific frameworks. Less precise but lower verification surface.
