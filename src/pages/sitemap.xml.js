export default function Sitemap() {}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/xml');
  res.write('<?xml version="1.0" encoding="UTF-8"?><urlset><url><loc>https://silentvoice-virid.vercel.app</loc></url></urlset>');
  res.end();
  return { props: {} };
}