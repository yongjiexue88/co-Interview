export interface BlogPost {
  id: string;
  title: string;
  date: string;
  link: string;
  isFeatured?: boolean;
  coverImage?: string; // Only for featured
}

export interface MonthGroup {
  month: string;
  year: string;
  posts: BlogPost[];
}