import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/tunisia-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Explore Tunisia
            <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Like Never Before
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover the enchanting beauty of Tunisia through our personalized travel experiences. 
            From ancient Carthage to pristine beaches, let us guide your perfect journey.
          </p>
          
          <Link to="/chat">
            <Button 
              size="lg" 
              className="text-xl px-12 py-6 bg-gradient-hero hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Start Your Journey
            </Button>
          </Link>
          
          {/* Decorative elements */}
          <div className="mt-16 flex justify-center space-x-8 text-white/70">
            <div className="text-center">
              <div className="text-3xl font-bold">2000+</div>
              <div className="text-sm">Years of History</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1200km</div>
              <div className="text-sm">of Coastline</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">7</div>
              <div className="text-sm">UNESCO Sites</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
