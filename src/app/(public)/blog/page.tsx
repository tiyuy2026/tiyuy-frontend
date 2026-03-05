import { BlogSection } from '@/presentation/components/blog/BlogSection/BlogSection';
import { BlogPosts } from '@/presentation/components/blog/BlogPosts/BlogPosts';
import { CompleteServices } from '@/presentation/components/services/CompleteServices/CompleteServices';

export default function BlogPage() {
  return (
    <main>
      <BlogSection />
      <BlogPosts />
      <CompleteServices />
    </main>
  );
}
