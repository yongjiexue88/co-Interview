const fs = require('fs');
const path = require('path');

const blogDir = '/Users/yongjiexue/Documents/GitHub/co-Interview/frontend/src/content/blog-html';

// Get all HTML files
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

// Build a mapping of slugs to local filenames
const slugToLocalFile = {};

// First pass: extract titles and create slug mapping
files.forEach(file => {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract title from h1
    const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (h1Match) {
        const title = h1Match[1].trim();
        const localSlug = file.replace('.html', '');

        // Store with the title for manual mapping later
        console.log(`${localSlug}: ${title.substring(0, 60)}`);
    }
});

// Create mapping from external slugs to local filenames based on content matching
const externalToLocal = {
    // Map based on base tag analysis and title matching
    'adobe-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_6',
    'affirm-software-engineer-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews',
    'angular-6-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_20',
    'angular-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_60',
    'angular-js-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_52',
    'ansible-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_45',
    'anthropic-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_2',
    'aspnet-mvc-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_31',
    'aws-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_61',
    'azure-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_49',
    'best-job-boards-for-software-engineers': 'interview_coder_ai_interview_assistant_for_technical_interviews_29',
    'bloomberg-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_10',
    'c-hash-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_57',
    'chewy-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_12',
    'citadel-software-engineer': 'interview_coder_ai_interview_assistant_for_technical_interviews_4',
    'code-signal-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_70',
    'coderpad-cheating': 'interview_coder_ai_interview_assistant_for_technical_interviews_66',
    'coderpad-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_73',
    'coderpad-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_72',
    'coding-interview-platforms': 'interview_coder_ai_interview_assistant_for_technical_interviews_25',
    'coding-interview-tools': 'interview_coder_ai_interview_assistant_for_technical_interviews_24',
    'coding-interviews': 'interview_coder_ai_interview_assistant_for_technical_interviews_64',
    'common-algorithms-for-interviews': 'interview_coder_ai_interview_assistant_for_technical_interviews_21',
    'common-c#-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_57',
    'costco-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_16',
    'cybersecurity-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_47',
    'deep-learning-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_36',
    'deloitte-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_15',
    'devops-interview-questions-and-answers': 'interview_coder_ai_interview_assistant_for_technical_interviews_34',
    'discord-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_1',
    'disney-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_3',
    'does-codesignal-record-screen': 'interview_coder_ai_interview_assistant_for_technical_interviews_71',
    'engineering-levels': 'interview_coder_ai_interview_assistant_for_technical_interviews_42',
    'figma-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_11',
    'front-end-developer-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_41',
    'git-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_43',
    'hackerrank-cheating': 'interview_coder_ai_interview_assistant_for_technical_interviews_65',
    'hackerrank-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_68',
    'hackerrank-proctoring': 'interview_coder_ai_interview_assistant_for_technical_interviews_67',
    'home-depot-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_8',
    'how-does-hackerrank-detect-cheating': 'interview_coder_ai_interview_assistant_for_technical_interviews_69',
    'how-to-cheat-on-codesignal': 'interview_coder_ai_interview_assistant_for_technical_interviews_74',
    'hubspot-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_5',
    'intuit-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_17',
    'java-interview-questions-and-answers': 'interview_coder_ai_interview_assistant_for_technical_interviews_51',
    'java-selenium-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_27',
    'jenkins-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_54',
    'jira-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_33',
    'jquery-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_37',
    'kubernetes-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_58',
    'leetcode-75': 'interview_coder_ai_interview_assistant_for_technical_interviews_59',
    'leetcode-alternatives': 'interview_coder_ai_interview_assistant_for_technical_interviews_44',
    'leetcode-blind-75': 'interview_coder_ai_interview_assistant_for_technical_interviews_56',
    'leetcode-cheat-sheet': 'interview_coder_ai_interview_assistant_for_technical_interviews_30',
    'leetcode-patterns': 'interview_coder_ai_interview_assistant_for_technical_interviews_55',
    'leetcode-roadmap': 'interview_coder_ai_interview_assistant_for_technical_interviews_35',
    'lockedin': 'interview_coder_ai_interview_assistant_for_technical_interviews_48',
    'ml-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_40',
    'netflix-software-engineer-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_19',
    'nodejs-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_38',
    'paypal-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_7',
    'python-basic-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_28',
    'questions-to-ask-interviewer-software-engineer': 'interview_coder_ai_interview_assistant_for_technical_interviews_26',
    'react-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_62',
    'rpa-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_22',
    'selenium-interview-questions-and-answers': 'interview_coder_ai_interview_assistant_for_technical_interviews_39',
    'software-engineer-interview-prep': 'interview_coder_ai_interview_assistant_for_technical_interviews_32',
    'spotify-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_9',
    'sql-server-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_53',
    'square-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_18',
    'system-design-interview-preparation': 'interview_coder_ai_interview_assistant_for_technical_interviews_46',
    'technical-interview-cheat-sheet': 'interview_coder_ai_interview_assistant_for_technical_interviews_23',
    'typescript-interview-questions': 'interview_coder_ai_interview_assistant_for_technical_interviews_50',
    'uber-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_13',
    'vibe-coding': 'interview_coder_ai_interview_assistant_for_technical_interviews_63',
    'wells-fargo-software-engineer-interview': 'interview_coder_ai_interview_assistant_for_technical_interviews_14',
};

console.log('\n\n=== Starting link replacement ===\n');

let totalReplacements = 0;

// Second pass: replace links in all files
files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;

    // Replace all external blog links with local ones
    const originalContent = content;

    // Replace links like href="https://www.interviewcoder.co/blog/slug"
    content = content.replace(
        /href="https:\/\/www\.interviewcoder\.co\/blog\/([^"]+)"/g,
        (match, slug) => {
            // Check if we have a mapping for this slug
            if (externalToLocal[slug]) {
                fileReplacements++;
                return `href="/blog/${externalToLocal[slug]}"`;
            }
            // If no mapping, keep as "Related Reading" placeholder (remove link)
            console.log(`  No mapping found for slug: ${slug}`);
            return match; // Keep original if no mapping
        }
    );

    if (fileReplacements > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`${file}: ${fileReplacements} links replaced`);
        totalReplacements += fileReplacements;
    }
});

console.log(`\n=== Total replacements: ${totalReplacements} ===`);
