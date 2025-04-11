
import { Link } from "react-router-dom";

const Accessibility = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gradient mb-6 animate-fade-in">Accessibility Statement</h1>
        
        <div className="glass-morph rounded-lg p-8 mb-12 animate-fade-in">
          <p className="mb-6">
            At STEM Assistant, we are committed to ensuring our website and mobile application are 
            accessible to everyone, including those with disabilities. We strive to meet or exceed 
            the requirements of applicable accessibility laws and standards.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
          <p className="mb-6">
            We have designed our platform specifically with visually impaired users in mind, and 
            we continuously work to improve the accessibility and usability of our website and app 
            for all users, including those who rely on assistive technologies.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Conformance Status</h2>
          <p className="mb-6">
            Our goal is to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. 
            We regularly assess our website against these guidelines and work to address any issues.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Accessibility Features</h2>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Keyboard navigation support throughout the entire website</li>
            <li>Compatible with screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
            <li>Text alternatives for non-text content</li>
            <li>Clear heading structure for easy navigation</li>
            <li>Sufficient color contrast for text and UI components</li>
            <li>Resizable text without loss of content or functionality</li>
            <li>ARIA landmarks and labels to enhance navigation</li>
            <li>Skip to main content link</li>
            <li>Focus indicators for keyboard navigation</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Technology Used</h2>
          <p className="mb-6">
            Our website relies on the following technologies for compliance with the accessibility 
            standards mentioned:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>HTML</li>
            <li>WAI-ARIA</li>
            <li>CSS</li>
            <li>JavaScript</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Assessment Methods</h2>
          <p className="mb-6">
            We assess the accessibility of our website through:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Self-evaluation</li>
            <li>User testing with people who use assistive technologies</li>
            <li>Automated testing tools</li>
            <li>Keyboard-only navigation testing</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Feedback</h2>
          <p className="mb-6">
            We welcome your feedback on the accessibility of our website and app. If you 
            experience any accessibility barriers or have suggestions for improvement, please contact us at:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Email: <a href="mailto:accessibility@stemassistant.com" className="text-stem-blue hover:underline">accessibility@stemassistant.com</a></li>
            <li>Phone: 1-800-555-1234</li>
            <li>Contact form: <Link to="/support" className="text-stem-blue hover:underline">Support Page</Link></li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Compatibility with Browsers and Assistive Technology</h2>
          <p className="mb-6">
            The website is designed to be compatible with the following browsers and assistive technologies:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Latest versions of Chrome, Firefox, Safari, and Edge</li>
            <li>NVDA and JAWS with Firefox or Chrome</li>
            <li>VoiceOver with Safari</li>
            <li>TalkBack with Chrome on Android</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Known Limitations</h2>
          <p className="mb-6">
            While we strive for complete accessibility, there may be some areas that are still being 
            improved. We are actively working to address these issues:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Some older content may not be fully accessible</li>
            <li>Some third-party content may not meet the same accessibility standards</li>
          </ul>
          
          <p>
            This statement was last updated on April 11, 2025. We will regularly review and update this 
            statement as our website evolves.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
