import { Card, Avatar } from "../../ui";
import RatingStars from "./RatingStars";
import { formatDate } from "../../../utils/dateUtils";

export default function ReviewCard({ review }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <Avatar name={review.userName || "Guest"} src={review.avatar} />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold text-[#1A2820]">{review.userName || "Guest traveller"}</h4>
              <p className="text-xs text-[#7A9285]">{review.createdAt ? formatDate(review.createdAt) : "Recently"}</p>
            </div>
            <RatingStars value={review.rating || 0} />
          </div>
          <p className="mt-3 text-sm text-[#3D5448]">{review.comment}</p>
        </div>
      </div>
    </Card>
  );
}
