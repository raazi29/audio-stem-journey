
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Support = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    submitted: false,
    loading: false
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({ ...formState, loading: true });
    
    // Simulate form submission
    setTimeout(() => {
      setFormState({
        ...formState,
        submitted: true,
        loading: false
      });
      
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon.",
        variant: "default",
      });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <section className="mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-6">Support</h1>
          <p className="text-xl text-muted-foreground mb-8">
            We're here to help you get the most out of the Assistive STEM Learning Platform.
          </p>
          
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
                href="mailto:support@stemassistant.com" 
                className="text-stem-blue hover:underline"
                aria-label="Email support at support@stemassistant.com"
              >
                support@stemassistant.com
              </a>
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
                href="tel:+18005551234" 
                className="text-stem-purple hover:underline"
                aria-label="Call support at 1-800-555-1234"
              >
                1-800-555-1234
              </a>
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
                accessibility@stemassistant.com
              </a>
            </div>
          </div>
        </section>
        
        <section className="mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-gradient-accent mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="glass-morph rounded-lg">
            <AccordionItem value="item-1" className="border-b border-white/10">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                How do I install the APK file?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Download the APK file to your Android device</li>
                  <li>Go to Settings &gt; Security</li>
                  <li>Enable "Unknown Sources" to allow installation of apps from sources other than the Play Store</li>
                  <li>Find the downloaded APK (usually in the Downloads folder) and tap on it</li>
                  <li>Follow the installation prompts</li>
                  <li>Once installed, you can open the app from your app drawer</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border-b border-white/10">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                What devices are compatible with the app?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                Our app is compatible with Android devices running Android 8.0 (Oreo) or newer. For the best experience, we recommend a device with:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>At least 3GB of RAM</li>
                  <li>Camera with autofocus capability</li>
                  <li>Haptic feedback/vibration motor</li>
                  <li>Screen reader (like TalkBack) enabled</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border-b border-white/10">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                How do I use the camera feature for equations?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Open the app and navigate to the "Camera" section</li>
                  <li>Hold your device over the equation or text you want to capture</li>
                  <li>The app will vibrate when it detects content in frame</li>
                  <li>Double tap anywhere on the screen to capture</li>
                  <li>The app will process the image and begin reading the content aloud</li>
                  <li>Use the playback controls to pause, resume, or adjust reading speed</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border-b border-white/10">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                Is an internet connection required?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                Basic features like text-to-speech and simple equation reading work offline. However, an internet connection is recommended for:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Processing complex equations and diagrams</li>
                  <li>Accessing the full library of STEM content</li>
                  <li>Receiving app updates</li>
                  <li>Syncing your notes and progress across devices</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                How do I provide feedback on accessibility?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                We value your feedback on making our app more accessible. You can:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Email us directly at accessibility@stemassistant.com</li>
                  <li>Use the "Accessibility Feedback" option in the app's settings menu</li>
                  <li>Fill out our contact form on this page</li>
                  <li>Participate in our user testing program (sign up through the app)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        
        <section className="mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-gradient-accent mb-6">Contact Us</h2>
          <div className="glass-morph rounded-lg p-8">
            {formState.submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Thank You!</h3>
                <p className="text-muted-foreground mb-6">
                  Your message has been sent. We'll get back to you as soon as possible.
                </p>
                <Button 
                  onClick={() => setFormState({ ...formState, submitted: false, name: "", email: "", subject: "", message: "" })}
                  variant="outline"
                  className="glass-morph"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="glass-morph"
                      aria-required="true"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      className="glass-morph"
                      aria-required="true"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    placeholder="What is your message about?"
                    required
                    className="glass-morph"
                    aria-required="true"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={6}
                    required
                    className="glass-morph resize-none"
                    aria-required="true"
                  />
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <p>All fields are required</p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full glass-morph"
                  disabled={formState.loading}
                >
                  {formState.loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Support;
