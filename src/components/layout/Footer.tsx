
import { Link } from "react-router-dom";
import { Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto glass-morph">
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gradient">STEM Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Empowering visually impaired students with accessible STEM education.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Visit our GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Visit our Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="mailto:contact@stemassistant.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email us"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/download"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Download
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/support"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link 
                  to="/accessibility"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} STEM Assistant. All rights reserved.</p>
          <p className="mt-2">
            <Link 
              to="/accessibility"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Accessibility Statement
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
