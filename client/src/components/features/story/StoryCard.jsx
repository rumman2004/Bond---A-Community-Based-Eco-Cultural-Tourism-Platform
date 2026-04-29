import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Card } from "../../ui";
import { formatDate } from "../../../utils/dateUtils";

export default function StoryCard({ story }) {
  const image = story.cover_image_url || story.image || "";
  return (
    <Link to={`/stories/${story.id}`}>
      <Card variant="experience" padding="none" hover>
        <Card.Image src={image} alt={story.title}>
          <BookOpen size={34} />
        </Card.Image>
        <div className="p-5">
          <p className="flex items-center gap-2 text-xs text-[#7A9285]"><BookOpen size={13} /> {story.communityName || "Community story"}</p>
          <h3 className="mt-2 font-display text-xl text-[#1A2820]">{story.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-[#3D5448]">{story.excerpt || story.content}</p>
          <p className="mt-4 text-xs text-[#7A9285]">{story.createdAt ? formatDate(story.createdAt) : "Draft"}</p>
        </div>
      </Card>
    </Link>
  );
}
