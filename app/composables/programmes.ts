import {ref} from 'vue';

interface providers {
    providerId: number,
    provider: string,
    courses: string[]
}

export function programmes() {
    const allProgrammes = ref<providers[]>([
            {
                providerId: 1,
                provider: "Singapore Institute of Technology",
                courses: ["Accountancy", "Aircraft Systems Engineering", "Applied Artificial Intelligence", "Applied Computing (Fintech)", "Applied Computing Degree (via CSM Pathway)", "Aviation Management", "Business and Infocomm Technology"]
            },
            {
                providerId: 2,
                provider: "SIT & DigiPen Institute of Technology",
                courses: ["Introduction to Bird Watching", "Avian Ecology", "Bird Migration Patterns"]
            },
            {
                providerId: 3,
                provider: "SIT & Massey University",
                courses: ["Bird Photography", "Backyard Birding", "Advanced Ornithology"]
            },
            {
                providerId: 4,
                provider: "SIT & Newcastle University",
                courses: ["Urban Bird Ecology", "Bird Behavior and Communication", "Conservation Strategies"]
            },
            {
                providerId: 5,
                provider: "SIT & University of Glasgow",
                courses: ["Urban Bird Ecology", "Bird Behavior and Communication", "Conservation Strategies"]
            },
            {
                providerId: 6,
                provider: "SIT & Technical University of Munich",
                courses: ["Tropical Bird Ecology", "Bird Anatomy and Physiology", "Field Research Methods"]
            }
        ]
    )

    return {
        allProgrammes
    }
}