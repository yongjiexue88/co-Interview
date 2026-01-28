import React from 'react';

const faqItems = [
    {
        question: 'Is it free?',
        answer: 'We offer a free trial so you can test the product before committing. After that, we have affordable pricing plans to suit your needs.',
    },
    {
        question: 'Is there a trial?',
        answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.',
    },
    {
        question: 'How does it work?',
        answer: 'Our AI analyzes your screen and the interview questions in real-time, providing you with helpful suggestions and code solutions.',
    },
    {
        question: 'What platforms?',
        answer: 'We support all major interview platforms including Zoom, Google Meet, Microsoft Teams, and specialized platforms like HackerRank and LeetCode.',
    },
    {
        question: 'How undetectable?',
        answer: 'Our technology is built from the ground up to be invisible to screen recording, proctoring software, and browser extensions.',
    },
    {
        question: 'Is it cheating?',
        answer: 'We provide assistance similar to having notes or references. Think of it as a smart study companion that helps you perform your best.',
    },
];

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    return (
        <div className="border-b border-gray-200 last:border-b-0 py-5">
            <h3 className="font-medium text-gray-900 mb-2">{question}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
        </div>
    );
};

const SimpleFAQ: React.FC = () => {
    const leftColumn = faqItems.slice(0, 3);
    const rightColumn = faqItems.slice(3, 6);

    return (
        <section className="bg-gray-50 py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">FAQ</h2>
                </div>

                {/* Two Column FAQ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                    {/* Left Column */}
                    <div>
                        {leftColumn.map((item, index) => (
                            <FAQItem key={index} question={item.question} answer={item.answer} />
                        ))}
                    </div>

                    {/* Right Column */}
                    <div>
                        {rightColumn.map((item, index) => (
                            <FAQItem key={index + 3} question={item.question} answer={item.answer} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SimpleFAQ;
