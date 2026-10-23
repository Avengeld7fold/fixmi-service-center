export default function AdminPageHeader({ description }: { title: string; description: string; icon?: string }) {
  return <p className="admin-page-description">{description}</p>;
}
