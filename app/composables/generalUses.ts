import {ref} from 'vue'

export function generalUses() {
    const labels = ref(['Question', 'Discussion', 'Help'])
    const degrees = ref([
        "Bachelor of Science in Information Systems",
        "Bachelor of Science in Computer Science",
        "Bachelor in Robotics & Automation",
        "Bachelor of Information Technology",
        "Bachelor of IT in AI and Autonomous Systems",
        "Applied Generative AI and Data Analytics",
        "Bachelor of Science (Hons) in Food Science and Technology",
        "Bachelor of Science (Hons) in Data Science and Analytics",
        "Bachelor of Engineering (Aerospace Engineering)",
        "Bachelor of Applied Computing in Finance",
        "Bachelor of Fine Arts in Design Art",
        "Bachelor of Fine Arts in Media Art",
        "Bachelor of Computing in Artificial Intelligence & Society",
        "Bachelor of Engineering (Bioengineering)",
        "Bachelor of Engineering (Chemical & Biomolecular Engineering)",
        "Bachelor of Engineering (Civil Engineering)",
        "Bachelor of Engineering (Computer Engineering)",
        "Bachelor of Computing in Computer Science",
        "Bachelor of Technology in Computing",
        "Bachelor of Computing in Data Science & Artificial Intelligence",
        "Bachelor of Engineering (Electrical & Electronic Engineering)",
        "Bachelor of Engineering (Environmental Engineering)",
        "Bachelor of Engineering (Information Engineering & Media)",
        "Bachelor of Engineering (Materials Engineering)",
        "Bachelor of Engineering (Mechanical Engineering)",
        "Bachelor of Engineering (Robotics)",
        "Bachelor of Science in Mathematical and Computer Sciences",
        "Bachelor of Science in Economics & Data Science",
        "Bachelor of Science in Environmental Earth Systems Science",
        "Bachelor of Science in Physics",
        "Bachelor of Engineering Science",
        "Bachelor of Engineering Science + Master of Science in Technology Management",
        "Bachelor of Science in Computer Science and Design",
        "Bachelor of Science in Design and Artificial Intelligence",
        "Bachelor of Engineering Product Development",
        "Bachelor of Engineering Systems and Design",
        "Bachelor of Information Security",
        "Bachelor of Software Engineering",
        "Bachelor of Computer Science in Real-Time Interactive Simulation",
        "Bachelor of Game Design",
        "Bachelor of Computer Science and Game Design"
    ]);
    const communities = ref([
        'N/A',
        'Computer Engineering',
        'Computer Science',
        'Software Engineering'
    ])

    function getInitials(name: string): string {
        if (!name || typeof name !== "string") return "";
        const cleaned = name.trim().replace(/\s+/g, " ");
        if (cleaned === "") return "";
        const parts = cleaned.split(" ").filter(Boolean);
        const initials = parts.map(word => word[0].toUpperCase()).join("");
        return initials;
    }

    function timeAgo(timestamp: string | Date): string {
        const now = new Date();
        const date = new Date(timestamp);

        // calculate difference in **ms**, UTC-safe
        const diff = now.getTime() - date.getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);

        if (seconds < 60) return `${seconds}s`;
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        if (weeks < 4) return `${weeks}w`;

        // older: show date
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
        };
        if (date.getFullYear() !== now.getFullYear()) options.year = 'numeric';

        return date.toLocaleDateString(undefined, options);
    }


    const base64ToBlob = (base64: any) => {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], {type: 'image/png'});
    }
    return {
        labels,
        degrees,
        communities,
        getInitials,
        timeAgo,
        base64ToBlob
    }
}