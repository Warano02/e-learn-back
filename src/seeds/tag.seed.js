const mongoose = require("mongoose");
const Tag = require("../models/tag.model");

const tags = [
    {
        name: "JavaScript",
        category: "programming",
        aliases: ["JS", "ECMAScript"],
        description: "Langage de programmation web",
    },
    {
        name: "TypeScript",
        category: "programming",
        aliases: ["TS"],
        description: "JavaScript typé",
    },
    {
        name: "Node.js",
        category: "programming",
        aliases: ["Node", "Backend JS"],
        description: "Runtime JavaScript côté serveur",
    },
    {
        name: "React",
        category: "programming",
        aliases: ["ReactJS"],
        description: "Librairie frontend",
    },
    {
        name: "Next.js",
        category: "programming",
        aliases: [],
        description: "Framework React fullstack",
    },
    {
        name: "Python",
        category: "programming",
        aliases: [],
        description: "Langage polyvalent",
    },
    {
        name: "Backend",
        category: "programming",
        aliases: ["Server-side"],
        description: "Développement côté serveur",
    },
    {
        name: "Frontend",
        category: "programming",
        aliases: ["Client-side"],
        description: "Développement côté client",
    },
    {
        name: "UI/UX Design",
        category: "design",
        aliases: ["UX", "UI Design"],
        description: "Design d'expérience utilisateur",
    },
    {
        name: "Cybersecurity",
        category: "security",
        aliases: ["Security", "InfoSec"],
        description: "Sécurité informatique",
    },
    {
        name: "DevOps",
        category: "devops",
        aliases: [],
        description: "Déploiement et infrastructure",
    },
];

const seedTags = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to DB");

        for (const tag of tags) {
            const slug = tag.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace("/", "-");

            const exists = await Tag.findOne({ slug });

            if (!exists) {
                await Tag.create({
                    name: tag.name,
                    slug,
                    category: tag.category,
                    aliases: tag.aliases,
                    description: tag.description,
                });

                console.log(` Created: ${tag.name}`);
            } else {
                console.log(` Already exists: ${tag.name}`);
            }
        }

        console.log(" Tag seeding completed");
        process.exit();
    } catch (error) {
        console.error(" Seed error:", error);
        process.exit(1);
    }
};

seedTags();