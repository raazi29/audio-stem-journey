import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone, MessageSquare, Search, Send, Headphones, BookOpen, Clock, Users, AlertTriangle, FileQuestion, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const FAQS = [
  {
    id: "item-1",
    question: "How do I install the APK file?",
    answer: `<ol class="list-decimal pl-5 space-y-2">
      <li>Download the APK file to your Android device</li>
      <li>Go to Settings &gt; Security</li>
      <li>Enable "Unknown Sources" to allow installation of apps from sources other than the Play Store</li>
      <li>Find the downloaded APK (usually in the Downloads folder) and tap on it</li>
      <li>Follow the installation prompts</li>
      <li>Once installed, you can open the app from your app drawer</li>
    </ol>`
  },
  {
    id: "item-2",
    question: "What devices are compatible with the app?",
    answer: `Our app is compatible with Android devices running Android 8.0 (Oreo) or newer. For the best experience, we recommend a device with:
    <ul class="list-disc pl-5 mt-2 space-y-1">
      <li>At least 3GB of RAM</li>
      <li>Camera with autofocus capability</li>
      <li>Haptic feedback/vibration motor</li>
      <li>Screen reader (like TalkBack) enabled</li>
    </ul>`
  },
  {
    id: "item-3",
    question: "How do I use the camera feature for equations?",
    answer: `<ol class="list-decimal pl-5 space-y-2">
      <li>Open the app and navigate to the "Camera" section</li>
      <li>Hold your device over the equation or text you want to capture</li>
      <li>The app will vibrate when it detects content in frame</li>
      <li>Double tap anywhere on the screen to capture</li>
      <li>The app will process the image and begin reading the content aloud</li>
      <li>Use the playback controls to pause, resume, or adjust reading speed</li>
    </ol>`
  },
  {
    id: "item-4",
    question: "Is an internet connection required?",
    answer: `Basic features like text-to-speech and simple equation reading work offline. However, an internet connection is recommended for:
    <ul class="list-disc pl-5 mt-2 space-y-1">
      <li>Processing complex equations and diagrams</li>
      <li>Accessing the full library of STEM content</li>
      <li>Receiving app updates</li>
      <li>Syncing your notes and progress across devices</li>
    </ul>`
  },
  {
    id: "item-5",
    question: "How do I provide feedback on accessibility?",
    answer: `We value your feedback on making our app more accessible. You can:
    <ul class="list-disc pl-5 mt-2 space-y-1">
      <li>Email us directly at accessibility@stemassistant.com</li>
      <li>Use the "Accessibility Feedback" option in the app's settings menu</li>
      <li>Participate in our user testing program (sign up through the app)</li>
    </ul>`
  },
  {
    id: "item-6",
    question: "How does the audio description feature work?",
    answer: `Our audio description features uses advanced AI to create detailed verbal descriptions of visual content:
    <ul class="list-disc pl-5 mt-2 space-y-1">
      <li>Graphics and diagrams are verbally described using spatial orientation</li>
      <li>Charts and graphs are converted to auditory patterns that represent trends</li>
      <li>Mathematical notation is broken down and explained step by step</li>
      <li>Customize speech rate, pitch and detail level in the settings</li>
    </ul>`
  },
  {
    id: "item-7",
    question: "Can I use the app for collaborative learning?",
    answer: `Yes, our app supports collaborative learning environments:
    <ul class="list-disc pl-5 mt-2 space-y-1">
      <li>Create shared study spaces with peers</li>
      <li>Share annotated materials with accessibility features intact</li>
      <li>Teachers can create specialized content for visually impaired students</li>
      <li>Live collaborative sessions with screen reader compatibility</li>
    </ul>`
  },
  {
    id: "item-8",
    question: "What STEM subjects does the app currently support?",
    answer: `Our app currently provides specialized support for:
    <ul class="list-disc pl-5 mt-2 space-y-1">
      <li>Mathematics (Algebra, Calculus, Geometry, Statistics)</li>
      <li>Physics (Mechanics, Electricity & Magnetism, Thermodynamics)</li>
      <li>Chemistry (Atomic Structure, Chemical Reactions, Organic Chemistry)</li>
      <li>Biology (Cell Biology, Genetics, Ecology)</li>
      <li>Computer Science (Programming Basics, Data Structures, Algorithms)</li>
    </ul>
    We're continuously expanding our subject coverage based on user feedback.`
  },
  {
    id: "item-9",
    question: "Does the app work with external assistive devices?",
    answer: `Yes, our app is designed to work with a variety of assistive technologies:
    <ul class="list-disc pl-5 mt-2 space-y-1">
      <li>Compatible with Braille displays and Braille notetakers</li>
      <li>Works with switch access devices for motor impairments</li>
      <li>Supports external keyboards and navigation devices</li>
      <li>Integrates with popular screen readers like TalkBack and VoiceOver</li>
    </ul>`
  },
  {
    id: "item-10",
    question: "What accessibility standards does the app comply with?",
    answer: `Our app is designed to meet international accessibility standards:
    <ul class="list-disc pl-5 mt-2 space-y-1">
      <li>WCAG 2.1 AA compliant</li>
      <li>Section 508 compliant for educational institutions</li>
      <li>Adheres to Android Accessibility Guidelines</li>
      <li>Regular third-party accessibility audits</li>
    </ul>`
  }
];

const SupportTicketForm = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      toast({
        title: "Support ticket submitted",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCategory("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="John Doe"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="john@example.com"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Issue Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical Problem</SelectItem>
            <SelectItem value="accessibility">Accessibility Issue</SelectItem>
            <SelectItem value="account">Account Management</SelectItem>
            <SelectItem value="feature">Feature Request</SelectItem>
            <SelectItem value="billing">Billing Question</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input 
          id="subject" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          placeholder="Brief description of your issue"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Please describe your issue in detail..." 
          className="min-h-[150px]"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>Submitting...</>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Ticket
          </>
        )}
      </Button>
    </form>
  );
};

const LiveChatPreview = () => {
  return (
    <div className="flex flex-col h-[400px]">
      <div className="bg-stem-blue text-white p-4 rounded-t-lg flex items-center">
        <Headphones className="mr-2 h-5 w-5" />
        <h3 className="font-medium">Live Support Chat</h3>
      </div>
      
      <div className="flex-1 p-4 bg-background border-x border-b border-border rounded-b-lg flex flex-col justify-center items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stem-blue/10 flex items-center justify-center">
          <Users className="h-8 w-8 text-stem-blue" />
        </div>
        <h3 className="text-lg font-medium">Support agents are online</h3>
        <p className="text-muted-foreground max-w-xs">
          Connect with a support agent for real-time assistance with your questions or issues.
        </p>
        <Button>
          Start Chat
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  
  // Filter FAQs based on search query
  const filteredFaqs = searchQuery 
    ? FAQS.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FAQS;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <section className="mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-6">Support Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            We're here to help you get the most out of the Assistive STEM Learning Platform.
          </p>
          
          {/* Support Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: <Clock className="h-6 w-6 text-stem-blue" />, label: "Response Time", value: "< 24 hours" },
              { icon: <CheckCircle className="h-6 w-6 text-green-500" />, label: "Resolution Rate", value: "95%" },
              { icon: <Users className="h-6 w-6 text-stem-purple" />, label: "Support Team", value: "24/7" },
              { icon: <BookOpen className="h-6 w-6 text-stem-light" />, label: "Knowledge Base", value: "200+ Articles" }
            ].map((stat, idx) => (
              <div key={idx} className="glass-morph p-4 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  {stat.icon}
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-morph p-6 rounded-lg text-center card-hover">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full glass-morph">
                  <Mail className="h-8 w-8 text-stem-blue" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-4">For general inquiries and support</p>
              <a 
                href="mailto:ashwinkumarbv@gmail.com" 
                className="text-stem-blue hover:underline"
                aria-label="Email support at support@stemassistant.com"
              >
                ashwinkumar00@gmail.com
              </a>
              <p className="text-stem-blue mt-1">
                amraazi088@gmail.com
              </p>
            </div>
            
            <div className="glass-morph p-6 rounded-lg text-center card-hover">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full glass-morph">
                  <Phone className="h-8 w-8 text-stem-purple" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-muted-foreground mb-4">Monday to Friday, 9am-5pm EST</p>
              <a 
                href="tel:+918217662612" 
                className="text-stem-purple hover:underline"
                aria-label="Call support at 1-800-555-1234"
              >
                +918217662612
              </a>
              <p className="text-stem-purple mt-1">
                +918310521470
              </p>
            </div>
            
            <div className="glass-morph p-6 rounded-lg text-center card-hover">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full glass-morph">
                  <MessageSquare className="h-8 w-8 text-stem-light" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Accessibility Feedback</h3>
              <p className="text-muted-foreground mb-4">Help us improve accessibility</p>
              <a 
                href="mailto:accessibility@stemassistant.com" 
                className="text-stem-light hover:underline"
                aria-label="Email accessibility feedback to accessibility@stemassistant.com"
              >
                ashwinkumarbv@gmail.com
              </a>
            </div>
          </div>
        </section>
        
        <section className="mb-16 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl font-bold text-gradient-accent">Frequently Asked Questions</h2>
            
            <div className="relative w-full md:w-auto">
              <Input
                type="search"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {searchQuery && (
            <div className="mb-4">
              <Badge variant="outline" className="text-sm">
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} for "{searchQuery}"
              </Badge>
            </div>
          )}
          
          {filteredFaqs.length === 0 ? (
            <div className="glass-morph rounded-lg p-8 text-center">
              <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any FAQs matching your search. Try different keywords or contact us directly.
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="glass-morph rounded-lg">
              {filteredFaqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-b border-white/10">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </AccordionContent>
            </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>
        
        <section className="mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-gradient-accent mb-6">Popular Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Getting Started Guide",
                description: "Learn the basics of the app and how to navigate its features.",
                icon: <BookOpen className="h-5 w-5" />,
                link: "/docs/getting-started"
              },
              {
                title: "Video Tutorials",
                description: "Watch step-by-step video guides for using the app effectively.",
                icon: <FileQuestion className="h-5 w-5" />,
                link: "/resources/videos"
              },
              {
                title: "Accessibility Features",
                description: "Detailed guide on all accessibility features and how to use them.",
                icon: <Users className="h-5 w-5" />,
                link: "/accessibility"
              },
              {
                title: "Troubleshooting",
                description: "Common issues and their solutions to help you resolve problems.",
                icon: <AlertTriangle className="h-5 w-5" />,
                link: "/support/troubleshooting"
              }
            ].map((resource, idx) => (
              <Card key={idx} className="glass-morph overflow-hidden border-0">
                <CardContent className="p-6 flex">
                  <div className="mr-4 h-10 w-10 rounded-full flex items-center justify-center bg-stem-blue/10">
                    {resource.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{resource.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{resource.description}</p>
                    <a href={resource.link} className="text-stem-blue text-sm inline-flex items-center hover:underline">
                      Learn more <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <SimpleSignup />
      </div>
    </div>
  );
};

// Simple email signup component for newsletter/updates
const SimpleSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail("");
      
      toast({
        title: "Signup successful!",
        description: "You've been added to our mailing list.",
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 800); // Faster response time
  };

  return (
    <section className="max-w-4xl mx-auto mb-16 animate-fade-in">
      <div className="glass-morph rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gradient-accent">Stay Updated</h2>
            <p className="text-muted-foreground">
              Get the latest accessibility tips and feature updates.
            </p>
          </div>
          
          {isSuccess ? (
            <div className="flex items-center space-x-2 text-stem-blue bg-stem-blue/10 p-3 rounded-md">
              <CheckCircle className="h-5 w-5" />
              <span>Thanks for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-[240px]"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : "Sign up with ease"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Support;
