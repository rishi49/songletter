export function scoreCandidate(candidate, tasteProfile) {
    let score = 0
    const matchedTags = []

    for (const tag of candidate.tags) {
        const tagScore = tasteProfile[tag] || 0

        if (tagScore > 0) {
            score += tagScore

            matchedTags.push({
                tag,
                score: tagScore
            })
        }
    }

    return { score, matchedTags }
}

export function rankCandidates(candidates, tasteProfile) {
    return candidates
        .map(candidate => {
            const { score, matchedTags } =
                scoreCandidate(candidate, tasteProfile)

            return {
                ...candidate,
                score,
                matchedTags
            }
        })
        .sort((a, b) => b.score - a.score)
}