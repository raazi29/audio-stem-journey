import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Heart, 
  BookOpen, 
  Presentation, 
  Users,
  Headphones as HeadphonesIcon,
  FileText,
  Vibrate as VibrateIcon
} from "lucide-react";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="max-w-4xl mx-auto mb-16 animate-fade-in">
        <h1 className="text-4xl font-bold text-gradient mb-6">About the App</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The Assistive STEM Learning Platform is designed to make STEM education accessible to everyone, 
          especially those with visual impairments.
        </p>
        
        <div className="glass-morph rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-6 text-muted-foreground">
            We believe that education should be accessible to everyone, regardless of physical ability. 
            Our mission is to break down barriers in STEM education by transforming visual content into 
            accessible formats that work for visually impaired students.
          </p>
          <p className="text-muted-foreground">
            Through innovative technology and thoughtful design, we're creating tools that enable 
            independent learning, boost confidence, and open doors to STEM careers for visually 
            impaired individuals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: <Heart className="h-10 w-10 text-rose-400" />,
              title: "Inclusive Design",
              description: "Built from the ground up with accessibility as a priority, not an afterthought."
            },
            {
              icon: <BookOpen className="h-10 w-10 text-violet-400" />,
              title: "STEM Focus",
              description: "Specialized tools to tackle the unique challenges of science, technology, engineering, and math."
            },
            {
              icon: <Presentation className="h-10 w-10 text-teal-400" />,
              title: "Educational Excellence",
              description: "Developed alongside educators to ensure alignment with curriculum standards."
            },
            {
              icon: <HeadphonesIcon className="h-10 w-10 text-amber-400" />,
              title: "Audio Clarity",
              description: "Crystal clear audio descriptions with adjustable speed and pitch for personalized learning."
            },
            {
              icon: <VibrateIcon className="h-10 w-10 text-blue-400" />,
              title: "Haptic Feedback",
              description: "Advanced tactile responses that represent visual information through touch patterns."
            },
            {
              icon: <Users className="h-10 w-10 text-green-400" />,
              title: "Community Driven",
              description: "Developed with continuous feedback from educators and visually impaired students."
            }
          ].map((value, index) => (
            <div 
              key={index} 
              className={`glass-morph p-6 rounded-lg text-center card-hover animation-delay-${(index + 1) * 100}`}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full glass-morph">
                  {value.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="max-w-4xl mx-auto mb-16 animate-fade-in">
        <h2 className="text-3xl font-bold text-gradient-accent mb-6">How It Works</h2>
        <div className="glass-morph rounded-lg p-8">
          <div className="space-y-8">
            {[
              {
                icon: <Camera className="h-8 w-8 text-sky-400" />,
                title: "Capture",
                description: "Point your device's camera at printed material, handwritten notes, or diagrams. Our advanced image recognition technology instantly processes the content.",
                animationClass: "animate-float animation-delay-100"
              },
              {
                icon: <FileText className="h-8 w-8 text-violet-400" />,
                title: "Process",
                description: "The app intelligently analyzes the content, recognizing text, equations, graphs, and scientific notation with high accuracy.",
                animationClass: "animate-float animation-delay-200"
              },
              {
                icon: <HeadphonesIcon className="h-8 w-8 text-teal-400" />,
                title: "Hear",
                description: "Content is converted to clear, natural-sounding speech. Complex equations are broken down step-by-step, and diagrams are described in detail.",
                animationClass: "animate-float animation-delay-300"
              },
              {
                icon: <VibrateIcon className="h-8 w-8 text-amber-400" />,
                title: "Feel",
                description: "Haptic feedback provides tactile cues for different content types, creating a multi-sensory learning experience.",
                animationClass: "animate-float animation-delay-400"
              }
            ].map((step, index) => (
              <div key={index} className={`flex flex-col md:flex-row gap-6 items-start ${step.animationClass}`}>
                <div className="flex-shrink-0 p-3 rounded-full glass-morph">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="max-w-4xl mx-auto mb-16 animate-fade-in">
        <h2 className="text-3xl font-bold text-gradient-accent mb-6">Key Benefits</h2>
        <div className="glass-morph rounded-lg p-8">
          <ul className="space-y-4">
            {[
              "Increases independence for visually impaired students in STEM classrooms",
              "Reduces the gap between visual and non-visual learning experiences",
              "Improves comprehension of complex STEM concepts through multi-sensory learning",
              "Integrates seamlessly with existing educational materials and textbooks",
              "Allows real-time processing of classroom materials as they're presented",
              "Builds confidence by providing equal access to educational content"
            ].map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-br from-stem-blue to-stem-purple"></div>
                <p className="text-muted-foreground">{benefit}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      
      <section className="max-w-4xl mx-auto mb-16 animate-fade-in">
        <h2 className="text-3xl font-bold text-gradient-accent mb-6">Our Team</h2>
        <div className="glass-morph rounded-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <Users className="h-16 w-16 text-violet-400" />
          </div>
          <p className="text-center text-muted-foreground">
            We're a diverse team of educators, engineers, accessibility specialists, and STEM enthusiasts. 
            Many of our team members have personal connections to the visually impaired community, 
            making our mission deeply personal.
          </p>
        </div>
      </section>
      
      <section className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
        <h2 className="text-3xl font-bold text-gradient mb-6">Get Started Today</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Experience the future of accessible STEM education.
        </p>
        <Button 
          size="lg" 
          asChild
        >
          <Link to="/download">
            <Download className="mr-2 h-5 w-5" />
            Download the App
          </Link>
        </Button>
      </section>
    </div>
  );
};

export default About;

// Icons needed for imports
const Camera = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);
