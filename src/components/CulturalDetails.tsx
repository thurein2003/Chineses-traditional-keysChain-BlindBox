import type { ZodiacMeaning } from "@/data/zodiacMeanings";
export default function CulturalDetails({
  meaning,
  compact = false,
}: {
  meaning: ZodiacMeaning;
  compact?: boolean;
}) {
  return (
    <div className={`cultural-details ${compact ? "compact" : ""}`}>
      <dl>
        <div>
          <dt>生肖名称</dt>
          <dd>{meaning.chineseName}</dd>
        </div>
        <div>
          <dt>象征寓意</dt>
          <dd>{meaning.symbolicMeaning}</dd>
        </div>
        <div>
          <dt>性格特征</dt>
          <dd>{meaning.personalityTraits}</dd>
        </div>
        <div className="cultural-explanation">
          <dt>文化含义</dt>
          <dd>{meaning.culturalExplanation}</dd>
        </div>
      </dl>
      <blockquote>
        <span>幸运祝福</span>
        <p>{meaning.luckyBlessing}</p>
      </blockquote>
      <p className="culture-note">传统文化意象，寄托美好祝愿，不作个性预测。</p>
    </div>
  );
}
