import projectGridStyles from "@/components/ProjectGrid.module.css";
import styles from "./HomepageHero.module.css";

export function HomepageHero() {
  return (
    <section
      className={`${projectGridStyles.pageInset} ${styles.hero}`}
      aria-label="Homepage hero"
    >
      <div className={styles.row1}>
        <div className={styles.cluster1}>
          <div className={styles.cluster2}>
            <div className={styles.panelHero} />
            <div className={styles.availabilityContact}>
              <div className={styles.availability}>
                <span className={styles.dot} aria-hidden />
                <span>Available for new projects</span>
              </div>
              <div className={styles.contactPills}>
                <div className={styles.contactPill}>
                  <img
                    src="/svg/icons/email.svg"
                    alt=""
                    className={styles.contactIcon}
                  />
                </div>
                <div className={styles.contactPill}>
                  <img
                    src="/svg/icons/LinkedIn.svg"
                    alt=""
                    className={styles.contactIcon}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cluster3}>
            <div className={styles.contactMobile}>
              <div className={styles.contactMobileItem}>
                <img
                  src="/svg/icons/email.svg"
                  alt=""
                  className={styles.contactIcon}
                />
              </div>
              <div className={styles.contactMobileItem}>
                <img
                  src="/svg/icons/LinkedIn.svg"
                  alt=""
                  className={styles.contactIcon}
                />
              </div>
            </div>
            <div className={styles.profile}>
              <div className={styles.profileImageContainer}>
                <img
                  src="/images/profile.jpg"
                  alt=""
                  className={styles.profileImage}
                />
              </div>
            </div>
            <div className={styles.location}>
              <div className={styles.locationCard}>
                <p className={styles.locationPrimary}>Based in London</p>
                <p className={styles.locationSecondary}>Working globally</p>
              </div>
              <div className={styles.timePill}>
                <img
                  src="/svg/icons/weather/rain.svg"
                  alt=""
                  className={styles.timeWeatherIcon}
                />
                <span>15:48</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cluster4}>
          <div className={styles.cluster4Inner} />
        </div>
      </div>
    </section>
  );
}
