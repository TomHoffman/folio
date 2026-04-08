type WorkProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function WorkProjectPage({
  params,
}: WorkProjectPageProps) {
  await params;
  return null;
}
