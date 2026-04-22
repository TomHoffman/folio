type TestimonialBase = {
  quote: string;
  name: string;
  jobTitle: string;
  company: string;
};

type TestimonialWithImage = {
  imageSrc: string;
  imageAlt: string;
};

type TestimonialWithoutImage = {
  imageSrc?: undefined;
  imageAlt?: undefined;
};

export type TestimonialData = TestimonialBase &
  (TestimonialWithImage | TestimonialWithoutImage);

export type TestimonialProps = TestimonialData & {
  className?: string;
};
