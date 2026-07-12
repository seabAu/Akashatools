# Regular-expression and pathological-input review

Reviewed 2026-07-11 against every regular expression reachable through the
public 2.x modules. No expression contains backreferences, recursive features,
or nested ambiguous quantifiers; the expressions are anchored or perform
single-pass scanning. This review is a complexity assessment, not a claim that
arbitrarily large inputs are inexpensive.

| Surface | Expressions/operation | Bound and decision |
| --- | --- | --- |
| Email syntax | ASCII local-part and domain-label character classes | Input is rejected above 254 characters before splitting or regex evaluation. Labels are checked independently at 63 characters maximum. |
| NANP normalization | Allowed formatting characters and non-digit removal | Input is rejected above 64 characters; numeric input must be a non-negative safe integer. The helper normalizes syntax and does not prove assignment or ownership. |
| Clock parsing | Anchored fixed-width 12-hour/24-hour patterns | `trim` is linear; the anchored expressions accept at most a small fixed result and have no ambiguous branches. |
| Property paths | Numeric bracket replacement, bracket detection, segment grammar | All scans are linear. Parsed segments are additionally checked for safe integers and prototype-mutating names. |
| Filename normalization | Combining-mark, non-ASCII-safe-character, edge-hyphen scans | Each replacement is linear. Very large filenames still require proportional normalization memory; callers handling untrusted bulk content should impose request/body limits before this presentation helper. |
| Case conversion | Two boundary scans plus Unicode letter/number tokenization | Linear passes with no nested repetition. Output allocation remains proportional to input. |

Literal replacement uses `String.prototype.replaceAll`. `replaceRegex` accepts
only an already-compiled caller RegExp and clones its source/flags so the
caller's `lastIndex` is unchanged; it does not claim to make a caller's unsafe
pattern safe. Akashatools never compiles an untrusted pattern string. Any future
pattern-string API requires a separate threat review and adversarial tests.

## Validation result shapes

Simple syntax/type predicates return booleans. `normalizeNanpPhone` and its
formatter return `null` for invalid syntax. JSON contract validation is the one
reviewed generic caller that needs multiple failures, so
`validateJsonContract` returns ordered path-bearing strings and
`assertJsonContract` throws their joined form. Mindspace password labels,
strength classes, English messages, and configurable character rules remain an
application-owned policy; no cross-project consumer supports a generic
validation-result object yet.
