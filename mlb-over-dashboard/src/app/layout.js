import './globals.css'

export const metadata = {
  title: 'MLB Over 5.5 Runs — Signal Dashboard',
  description:
    'See which MLB games today are most likely to go over 5.5 runs, based on each team\'s recent scoring history.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
