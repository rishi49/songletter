Changing the time range substantially changes the artists, but the same candidate songs keep winning because they match a persistent indie/dream-pop tag cluster. Repeated candidate tag sets and score ties amplify that effect.
1. The Spotify artist lists are substantially different.
Comparison	Artist overlap	Shared artists
Short ↔ Medium	1/10	Men I Trust
Short ↔ Long	3/10	Men I Trust, Alvvays, Arctic Monkeys
Medium ↔ Long	3/10	Men I Trust, Justin Bieber, Snail Mail


Artists exclusive to each range:
- Short: Slowdown, Cigarettes After Sex, Not For Radio, After, Khalid, Beach House, Babygirl.
- Medium: Charlie Puth, Mitski, Tiffany Day, Bruno Mars, Vansire, Ethel Cain, Drake.
- Long: Laufey, Royel Otis, Lady Gaga, Charli xcx, Whirr.
Therefore, “Spotify top artists barely change” is not the explanation.
2. The taste profiles change, but their strongest shared tags persist.
V1 takes the first five Last.fm tags for each artist and adds 1 per tag occurrence. All ten artists contribute equally, regardless of Spotify rank. Last.fm tag strengths are not used as weights. Each profile contains 50 total contributions.
Tag	Short	Medium	Long
dream pop	6	4	4
indie	6	4	4
indie pop	5	5	4
lo-fi	3	2	4
indie rock	1	2	3
pop	1	4	4
rnb	1	4	1
electronic	0	0	3
alternative	2	0	1
female vocalists	0	1	2
bedroom pop	1	1	0
maryland	0	1	1


The differences are meaningful: medium becomes more pop/R&B-heavy, while long gains electronic and stronger lo-fi/indie-rock weights. However, dream pop, indie, and indie pop remain heavily weighted in every range.
The five tags dream pop, indie, indie pop, lo-fi, and indie rock account for 21/50 short, 17/50 medium, and 19/50 long contributions.
3. Recommendation membership barely changes, although scores and positions do.
- Short ↔ Medium: 10/10 songs overlap, in exactly the same order.
- Short ↔ Long: 8/10 overlap.
- Medium ↔ Long: 8/10 overlap.
- Eight songs appear in all three: four Vansire tracks and four Snail Mail tracks.
Each cell below shows rank / score. Positions 11–12 were reproduced from the full candidate pool.
Recommendation	Short	Medium	Long
Vansire — For the Moment	1 / 21	1 / 16	6 / 16
Vansire — Love That You Try	2 / 21	2 / 16	7 / 16
Vansire — Rinkside	3 / 21	3 / 16	8 / 16
Vansire — The Sun Arrives	4 / 21	4 / 16	9 / 16
Blondshell — Heart Has To Work So Hard	5 / 18	5 / 15	11 / 15
Current Joys — HOLE	6 / 18	6 / 15	12 / 15
Snail Mail — Dead End	7 / 15	7 / 14	1 / 16
Snail Mail — Hell	8 / 15	8 / 14	2 / 16
Snail Mail — Butterfly	9 / 15	9 / 14	3 / 16
Snail Mail — Tractor Beam	10 / 15	10 / 14	4 / 16
Snail Mail — My Maker	11 / 15	11 / 14	5 / 16
Halsey — Carry the Weight	12 / 14	12 / 14	10 / 15


4. The scoring arithmetic explains the repetition.
V1 calculates:
Song score = sum of taste-profile weights for its matching tags
All four Vansire tracks have identical tags:
dream pop + indie pop + lo-fi + bedroom pop + indie

Short:   6 + 5 + 3 + 1 + 6 = 21
Medium:  4 + 5 + 2 + 1 + 4 = 16
Long:    4 + 4 + 4 + 0 + 4 = 16
All five Snail Mail tracks also share identical tags:
indie + indie rock + indie pop + lo-fi + maryland

Short:   6 + 1 + 5 + 3 + 0 = 15
Medium:  4 + 2 + 5 + 2 + 1 = 14
Long:    4 + 3 + 4 + 4 + 1 = 16
These songs cannot be distinguished within their respective groups by this algorithm.
Medium’s stronger pop/R&B weights do influence other candidates. But Charlie Puth candidates tagged pop, rnb, soul, usa, american score only 4 + 4 + 1 + 1 + 1 = 11, below Vansire and Snail Mail.
The algorithm responds to the changed profile, but those changes often do not push different songs above the selection threshold. It also rewards related tags independently: indie, indie pop, and dream pop each add points despite their overlapping meaning.
5. The fixed candidate pool and tie-breaking further stabilize the results.
The app actually imports 110 candidate entries, representing 108 unique tracks, from src/data/candidateProfiles.json. The previously counted 397-entry file is in src/scripts and is not the file the app imports.
Changing time range reranks the same pool. It does not generate a new candidate collection.
There is no artist-diversity constraint, so four Vansire songs and five Snail Mail songs can occupy nine recommendation slots.
Sorting uses only score, with ties preserving candidate-file order:
- In short and medium, several Snail Mail songs tie at the cutoff; the same first four are selected.
- In long, all five Snail Mail tracks and all four Vansire tracks tie at 16. Snail Mail appears first because its entries occur earlier in the file.
- Halsey, Blondshell, and Current Joys tie at 15 in long. Halsey gets position #10 because its entry comes first.
Thus, some ranking and membership differences reflect file order rather than stronger preference.
6. Secondary information losses are present.
- Candidate enrichment falls back to artist tags when track tags are unavailable. This could explain identical tags across songs, but saved data does not identify which tracks used the fallback.
- Matching is exact after lowercasing: rnb versus r&b, for example, remain separate.
- Non-genre tags such as maryland receive ordinary scoring weight.
- Eight tags in each profile have no matches anywhere in the active candidate pool and therefore cannot affect scores.
- The currently checked-in Spotify request hardcodes short_term; that does not explain the saved logs, which contain demonstrably different artist lists.
The primary diagnosis is a combination of broad shared taste tags, candidates that repeatedly bundle those tags, simple additive scoring, and deterministic ties. All three logged top 10s were reproduced exactly using the current scoring code and active candidate file.