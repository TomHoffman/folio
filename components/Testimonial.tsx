import Image from "next/image";
import railStyles from "./projectContentRail.module.css";
import styles from "./Testimonial.module.css";
import type { TestimonialProps } from "./testimonialTypes";

export function Testimonial({
  imageSrc,
  imageAlt,
  quote,
  name,
  jobTitle,
  company,
  className,
}: TestimonialProps) {
  const safeQuote = quote.trim();
  const safeName = name.trim();
  const safeJobTitle = jobTitle.trim();
  const safeCompany = company.trim();
  const hasRequiredFields =
    safeQuote.length > 0 &&
    safeName.length > 0 &&
    safeJobTitle.length > 0 &&
    safeCompany.length > 0;
  if (!hasRequiredFields) return null;

  const trimmedImageSrc = imageSrc?.trim() ?? "";
  const hasImage = trimmedImageSrc.length > 0;
  const sectionClass = [styles.section, className].filter(Boolean).join(" ");
  return (
    <section className={sectionClass} aria-label="Testimonial">
      <div
        className={[
          styles.inner,
          !hasImage ? styles.innerNoImage : "",
          railStyles.contentRail,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {hasImage ? (
          <div className={styles.imageFrame}>
            <Image
              src={trimmedImageSrc}
              alt={imageAlt ?? ""}
              fill
              className={styles.image}
              sizes="(max-width: 767px) 120px, 176px"
            />
          </div>
        ) : null}
        <div className={styles.copy}>
          <blockquote className={styles.quote}>{safeQuote}</blockquote>
          <p className={styles.citation}>
            <span className={styles.citationName}>{safeName},</span>
            <span className={styles.citationMeta}>
              {safeJobTitle} - {safeCompany}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
