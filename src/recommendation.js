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

    return {
        score,
        matchedTags
    }
}

export function rankCandidates(candidates, tasteProfile) {

    // Score every candidate
    const ranked = candidates
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

    // Keep only one track per album
    const bestByAlbum = new Map()

    for (const candidate of ranked) {
        if (!bestByAlbum.has(candidate.albumId)) {
            bestByAlbum.set(candidate.albumId, candidate)
        }
    }

    return [...bestByAlbum.values()]
}