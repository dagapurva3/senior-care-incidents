import './globals.css'

export const metadata = {
  title: 'CareTracker - Senior Care Incident Management',
  description: 'Modern incident tracking and management system for senior care facilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
