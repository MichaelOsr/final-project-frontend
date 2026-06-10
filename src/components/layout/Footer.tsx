import { Link } from "react-router-dom"

const footerSections = [
  {
    title: "Company",
    links: [
      { label: "About us", to: "#" },
      { label: "Careers", to: "#" },
      { label: "Partner stores", to: "#" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Help center", to: "#" },
      { label: "Track your order", to: "#" },
      { label: "Contact us", to: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", to: "#" },
      { label: "Privacy policy", to: "#" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="grid gap-2">
          <span className="text-lg font-bold text-primary">GrocerGo</span>
          <p className="text-sm text-muted-foreground">
            Fresh groceries from the store nearest to you — delivered fast.
          </p>
        </div>
        {footerSections.map((section) => (
          <div key={section.title} className="grid content-start gap-2">
            <h3 className="text-sm font-semibold">{section.title}</h3>
            {section.links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GrocerGo. All rights reserved.
      </div>
    </footer>
  )
}
