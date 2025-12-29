export interface BlogPost {
    id: string;
    title: string;
    date: string;
    href: string;
    readTime?: string;
}

export interface MonthGroup {
    month: string;
    year?: string;
    posts: BlogPost[];
}

export interface FeaturedPost {
    id: string;
    title: string;
    date: string;
    href: string;
    imageUrl: string;
}
