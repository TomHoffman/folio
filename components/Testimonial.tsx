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

  const hasImage = Boolean(imageSrc?.trim());
  const sectionClass = [styles.section, className].filter(Boolean).join(" ");
  const citationText = `${safeName}, ${safeJobTitle} - ${safeCompany}`;

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
              src={imageSrc}
              alt={imageAlt}
              fill
              className={styles.image}
              sizes="(max-width: 767px) 120px, 176px"
            />
          </div>
        ) : null}
        <div className={styles.copy}>
          <blockquote className={styles.quote}>{safeQuote}</blockquote>
          <p className={styles.citation}>{citationText}</p>
        </div>
      </div>
    </section>
  );
}
