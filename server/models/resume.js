import mongoose, { Mongoose } from "mongoose"

const ResumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
    },
    title: {
        type: String, default: "untitled resume",
    },
    public: {
        type: Boolean,
        default: false
    },
    template: {
        type: String,
        default: "classic",
    },
    accent_color: {
        type: String,
        default: "#3B82F6",
    },
    professional_summary: {
        type: String,
        default: "",
    },
    skills: {
        type: [String],
        default: [],
    },
    personal_info: {
        image: {
            type: String,
            default: "",
        },
        full_name: {
            type: String,
            default: "",
        },
        profession: {
            type: String,
            default: "",
        },
        email: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        location: {
            type: String,
            default: "",
        },
        linkedin: {
            type: String,
            default: "",
        },
        website: {
            type: String,
            default:"",
        },
    },
    experience: [
        {
            company: {
                type: String
            },
            position: {
                type: String
            },
            start_date: {
                type: String
            },
            end_date: {
                type: String
            },
            description: {
                type: String
            },
            is_current: {
                type: Boolean
            }
        }
    ],
    project: [
        {
            name: {
                type: String
            },
            type: {
                type: String
            },
            description: {
                type: String
            },
        }
    ],
    education: [
        {
            institution: {
                type: String
            },
            degree: {
                type: String
            },
            field: {
                type: String
            },
            graduation_date: {
                type: String
            },
            gpa: {
                type: String
            },
        }
    ],
    section_headings: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    custom_sections: {
        type: [
            {
                id:      { type: String, required: true },
                heading: { type: String, default: "" },
                content: { type: String, default: "" },
            }
        ],
        default: [],
    },
    style_options: {
        fontFamily:    { type: String, default: "inter" },
        fontSize:      { type: Number, default: 14 },
        lineSpacing:   { type: Number, default: 1.5 },
        sectionOrder:  { type: [String], default: [] },
        headingBold:   { type: Boolean, default: true },
        headingItalic: { type: Boolean, default: false },
        contentBold:   { type: Boolean, default: false },
        contentItalic: { type: Boolean, default: false },
    },
}, {timestamps: true, minimize: false})

const Resume = mongoose.model("Resume", ResumeSchema);

export default Resume;
