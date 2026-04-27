import StoryCard from "./StoryCard";

export default function StoryFeed({ stories = [] }) {
  if (!stories.length) return <p className="py-10 text-center text-[#7A9285]">No stories published yet.</p>;

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => <StoryCard key={story.id} story={story} />)}
    </div>
  );
}
