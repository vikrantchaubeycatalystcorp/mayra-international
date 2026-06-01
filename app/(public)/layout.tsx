// Applies the editorial design system (app/editorial.css) to every public
// student page. The `.ed-scope` wrapper raises specificity so the ported
// reference styles never collide with the Tailwind `.container`/`.card`
// utilities used elsewhere (e.g. the admin portal, which renders outside it).
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="ed-scope min-h-screen">{children}</div>;
}
